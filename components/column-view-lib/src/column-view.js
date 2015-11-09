function debounce(func, wait, immediate) {
  var timeout, args, context, timestamp, result;

  function now() { new Date().getTime(); }

  var later = function() {
    var last = now() - timestamp;
    if (last < wait) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        context = args = null;
      }
    }
  };

  return function() {
    context = this;
    args = arguments;
    timestamp = now();
    var callNow = immediate && !timeout;
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
}


var ColumnView = (function() {
  "use strict";

  var keyCodes, _slice, transformPrefix;

  keyCodes = {
    enter: 13,
    space: 32,
    backspace: 8,
    tab: 9,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
  };

  _slice = Array.prototype.slice;

  transformPrefix = getTransformPrefix();

  function getTransformPrefix() {
    var el = document.createElement("_");
    var prefixes = ["transform", "webkitTransform", "MozTransform", "msTransform", "OTransform"];
    var prefix;
    while (prefix = prefixes.shift()) {
      if (prefix in el.style) return prefix;
    }
    console.warn("transform not supported");
    return null;
  }

  function uid() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  function ColumnView(el, options) {
    if (!ColumnView.canBrowserHandleThis()) {
      throw "This browser doesn't support all neccesary EcmaScript 5 Javascript methods.";
    }

    var that = this, onKeydown, onKeyup, resize;

    this.options = options || {};
    this.value = null;
    this.ready = false;
    this.carriageReady = false;

    this.el = el;
    this.domCarriage = this.el.querySelector(".carriage");
    this.carriage = document.createDocumentFragment();
    this.style = this.el.querySelector("style");

    this.models = options.items;
    this.path = options.path;
    this.movingUpOrDown = false;
    this.colCount = 3; //default

    this.callbacks = {
      change: that.options.onChange,
      source: that.options.source,
      ready:  that.options.ready
    };

    this.setLayout(options.layout);

    if (options.itemTemplate) {
      this.CustomSelect.prototype.itemTemplate = options.itemTemplate;
    }

    this.uniqueClassName = "column-view-" + uid();
    this.el.classList.add(this.uniqueClassName);
    this.el.setAttribute("tabindex", 0);
    this.el.setAttribute("role", "tree");

    // bound functions
    onKeydown = this._onKeydown.bind(this);
    onKeyup = this._onKeyup.bind(this);
    resize = debounce(this._resize.bind(this), 300);
    this._onColumnChangeBound = this._onColumnChange.bind(this);
    // onResize = _.bind(this._onResize, this);

    this.el.addEventListener("keydown", onKeydown, true);
    this.el.addEventListener("keyup", onKeyup, true);
    window.addEventListener("resize", resize);

    // todo prevent scroll when focused and arrow key is pressed
    // this.el.addEventListener("keydown", function(e){e.preventDefault();});

    this._initialize();
  }

  ColumnView.canBrowserHandleThis = function canBrowserHandleThis() {
    return !!Array.prototype.map &&
           !!Array.prototype.forEach &&
           !!Array.prototype.map &&
           !!Function.prototype.bind;
  };

  // instance methods
  // ----------------

  ColumnView.prototype = {

    // Getter
    // --------

    columns: function columns() {
      if (!this.carriageReady) throw "Carriage is not ready";
      return _slice.call( this.carriage.children );
    },

    focusedColumn: function focusedColumn() {
      var cols = this.columns();
      return cols[cols.length-2] || cols[0];
    },

    canMoveBack: function canMoveBack() {
      if (this.colCount === 3)
        return this.columns().length > 2;
      else
        return this.columns().length > 1;
    },


    // Keyboard
    // --------

    _onKeydown: function onKeydown(e) {
      this.movingUpOrDown = false;
      if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey)
        return; // do nothing

      switch (e.keyCode) {
        case keyCodes.left:
        case keyCodes.backspace:
          this._keyLeft();
          e.preventDefault();
          break;
        case keyCodes.right:
        case keyCodes.space:
        case keyCodes.enter:
          this._keyRight();
          e.preventDefault();
          break;
        case keyCodes.up:
          this.movingUpOrDown = true;
          this._moveCursor(-1);
          e.preventDefault();
          break;
        case keyCodes.down:
          this.movingUpOrDown = true;
          this._moveCursor(1);
          e.preventDefault();
          break;
        default:
          return;
      }
    },

    _onKeyup: function onKeyup() {
      this.movingUpOrDown = false;
      if (this.fastMoveChangeFn) this.fastMoveChangeFn();
    },

    _keyLeft: function keyLeft() { this.back(); },

    _keyRight: function keyRight() {
      var col = this.carriage.lastChild;
      if (col.customSelect) col.customSelect.selectIndex(0); // COL ACTION!!!!!!
      // triggers change
    },

    _moveCursor: function moveCursor(direction) {
      var col = this.focusedColumn();
      col.customSelect.movePosition(direction);
    },

    _onColumnChange: function onColumnChange(columnClass, value, oldValue) {
      var that = this;
      var column = columnClass.el;
      if (!this.ready) return;

      if (this.movingUpOrDown) {
        this.fastMoveChangeFn = function() { that._onColumnChange(columnClass, value, oldValue); };
        return;
      }

      this.fastMoveChangeFn = null;
      // console.log("cv change", value)

      this.value = value;

      if (this.focusedColumn() == column && this.columns().indexOf(column) !== 0) {
        this.lastColEl = this.carriage.lastChild;
      } else {
        this._removeAfter(column);
        this.lastColEl = null;
      }
      // console.log("horizontal change", this._activeCol == column)

      function appendIfValueIsSame(data) {
        if (that.value !== value) return;
        that._appendCol(data);
        that.callbacks.change.call(that, value);
      }

      this.callbacks.source(value, appendIfValueIsSame);

      // todo handle case case no callback is called
    },

    // Calls the source callback for each value in
    // this.path and append the new columns
    _initialize: function initialize() {
      var that = this;
      var path = this.path || [];
      console.log("path", path);
      var pathPairs = path.map(function(value, index, array) {
        return [value, array[index+1]];
      });
      this.carriage.innerHTML = "";

      function proccessPathPair(pathPair, cb) {
        var id = pathPair[0], nextID = pathPair[1];
        var customSelect;
        that.callbacks.source(String(id), function(data) {
          if (nextID) data.selectedValue = String(nextID);
          customSelect = that._appendCol(data);
          cb();
        });
      }

      function proccessPath() {
        var pathPair = pathPairs.shift();
        if (pathPair)
          proccessPathPair(pathPair, proccessPath);
        else
          ready();
      }

      function ready() {
        that.domCarriage.innerHTML = "";
        that.domCarriage.appendChild(that.carriage);
        that.carriage = that.domCarriage;
        that.carriageReady = true;
        that._resize();
        that._alignCols();
        that.ready = true;
        if (that.callbacks.ready) that.callbacks.ready.call(that);
      }

      proccessPath();
    },

    _appendCol: function appendCol(data) {
      var col = this._createCol(data);
      if (this.ready) this._alignCols();
      this.lastColEl = null;
      return col;
    },

    _createCol: function createCol(data) {
      var col;
      // use existing col if possible
      if (this.lastColEl) {
        col = this.lastColEl;
        col.innerHTML = "";
        // col.selectIndex = null;
        col.scrollTop = 0;
      } else {
        col = document.createElement("div");
        col.classList.add("column");
        this.carriage.appendChild(col);
      }
      return this._newColInstance(data, col);
    },

    _newColInstance: function newColInstance(data, col) {
      var colInst;
      if (col.customSelect) col.customSelect.clear();
      if (data.dom) {
        colInst = new this.Preview(col, data.dom);
        // reset monkeypatched properties for reused col elements
      }
      else if (data.items || data.groups) {
        data.onChange = this._onColumnChangeBound;
        colInst = new this.CustomSelect(col, data);
      }
      else {
        throw "Type error";
      }
      return colInst;
    },

    _removeAfter: function removeAfter(col) {
      var cols = this.columns();
      var toRemove = cols.splice(cols.indexOf(col)+1, cols.length);
      var that = this;
      toRemove.forEach(function(col) { that.carriage.removeChild(col); });
    },

    _alignCols: function alignCols() {
      var length = this.columns().length;
      if (this.lastAllignment === length)
        return; // skip if nothing has changed

      this.lastAllignment = length;
      var leftOut = Math.max(0, length - this.colCount);
      this.lastLeftOut = leftOut
      //this._moveCarriage(leftOut);
      this._resizeY();
    },

    _resize: function resize() {
      this.colWidth = this.el.offsetWidth / this.colCount;
      this._setStyle("width:"+this.colWidth+"px;");
      var col = this.columns().slice(-1)[0];
      var height = col.offsetHeight;
      this._setStyle("height:"+height+"px;"+"width:"+this.colWidth+"px;");
      this._moveCarriage(this.lastLeftOut, {transition: false});
    },

    _resizeY: function resize() {
      this.colWidth = this.el.offsetWidth / this.colCount;
      this._setStyle("width:"+this.colWidth+"px;");
      var col = this.columns().slice(-1)[0];
      var height = col.offsetHeight;
      this._setStyle("height:"+height+"px;"+"width:"+this.colWidth+"px;");
      this._moveCarriage(this.lastLeftOut);
    },

    _setStyle: function setStyle(css) {
      this.style.innerHTML = "."+this.uniqueClassName+" .column {"+css+"}";
    },

    setLayout: function setLayout(layout) {
      // console.log("setLayout", layout);
      if (layout == "mobile") {
        this.colCount = 1;
        this.el.classList.add("mobile");
      } else {
        this.colCount = 3;
        this.el.classList.remove("mobile");
      }
      if (!this.ready) return;
      this._resize();
    },

    _moveCarriage: function moveCarriage(leftOut, options) {
      options = options || {};
      if (!options.hasOwnProperty("transition")) options.transition = true
      this.lastLeftOut = leftOut;
      // console.log("move", this.ready)
      var left = -1 * leftOut * this.colWidth;
      this.carriage.classList.toggle("transition", this.ready && options.transition);
      this.carriage.style[transformPrefix] = "translate("+left+"px, 0px)";
    },

    // ### public

    back: function back() {
      if (!this.canMoveBack()) return;
      var lastCol = this.focusedColumn();
      this._removeAfter(lastCol);
      // triggers no change
      //if (lastCol.customSelect)
      lastCol.customSelect.deselect(); // COL ACTION!!!!!!

      this._alignCols();
      this.value = this.focusedColumn().customSelect.value();
      this.callbacks.change.call(this, this.value);
    }


  };

  return ColumnView;


})();
