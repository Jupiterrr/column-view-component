
function htmlToDocumentFragment(html) {
  "use strict";
  var frag = document.createDocumentFragment();
  var tmp = document.createElement("body");
  tmp.innerHTML = html;
  var child;
  while (child = tmp.firstChild) {
    frag.appendChild(child);
  }
  return frag;
}


ColumnView.prototype.CustomSelect = (function() {
  "use strict";

  var indexOf = Array.prototype.indexOf;

  // aria-owns="catGroup" aria-expanded="false"
  // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_group_role

  function CustomSelect(parent, data) {
    if (!data) data = {};

    this.el = parent;

    this.models = data.items;
    this.groups = data.groups;
    this.changeCB = data.onChange;

    this._selectedEl = this.el.querySelector(".selected");
    this.items = this.el.querySelectorAll(".item");

    this.value = null;

    this.el.setAttribute("role", "group");

    this.boundOnClick = this._onClick.bind(this);
    this.el.addEventListener("click", this.boundOnClick);

    this._monkeyPatchEl();

    if (this.models || this.groups) this._render(data.selectedValue);
  }

  // instance methods
  // ----------------

  CustomSelect.prototype = {

    _monkeyPatchEl: function monkeyPatchEl() {
      var that = this;
      var selectIndex = this.selectIndex.bind(this);
      var movePosition = this.movePosition.bind(this);
      var deselect = this.deselect.bind(this);
      var clear = this.clear.bind(this);
      var selectValue = this.selectValue.bind(this);
      var elMethods = {
        selectIndex: selectIndex,
        movePosition: movePosition,
        deselect: deselect,
        selectValue: selectValue,
        clear: clear,
        value : function value() { return that.value; }
      };
      this.el.customSelect = elMethods;
    },

    _render: function render(selectedValue) {
      var container = document.createDocumentFragment();

      if (this.groups) {
        this._renderGroups(container, this.groups);
      }
      else if (this.models) {
        this._renderItems(container, this.models);
      }
      else {
        this._renderEmpty(container);
      }

      this.el.innerHTML = "";
      this.el.appendChild(container);
      this.items = this.el.querySelectorAll(".item");
      if (selectedValue) this.selectValue(selectedValue);
    },

    _renderItems: function renderItems(container, models) {
      var that = this;
      models.forEach(function(model) {
        var html = that.itemTemplate(model);
        var item = htmlToDocumentFragment(html);
        container.appendChild(item);
      });
    },

    _renderGroups: function renderGroups(container, groups) {
      var that = this;
      groups.forEach(function(group) {
        var html = that.groupTemplate(group);
        var item = htmlToDocumentFragment(html);
        container.appendChild(item);
        that._renderItems(container, group.items);
      });
    },

    _renderEmpty: function renderEmpty(container) {
      var el = document.createTextNode("empty");
      container.appendChild(el);
    },

    clear: function clear() {
      this.el.customSelect = null;
      this.el.removeEventListener("click", this.boundOnClick);
    },

    _scrollIntoView: function scrollIntoView() {
      var elRect = this.el.getBoundingClientRect();
      var itemRect = this._selectedEl.getBoundingClientRect();

      if (itemRect.bottom > elRect.bottom) {
        this.el.scrollTop += itemRect.bottom - elRect.bottom;
      }

      if (itemRect.top < elRect.top) {
        this.el.scrollTop -= elRect.top - itemRect.top;
      }
    },

    _deselect: function deselect(el) {
      el.classList.remove("selected");
      this._selectedEl = null;
    },

    _select: function select(el) {
      if (this._selectedEl === el) return;

      if (this._selectedEl) this._deselect(this._selectedEl);
      el.classList.add("selected");
      this._selectedEl = el;
      var oldValue = this.value;
      this.value = el.getAttribute("data-value");
      this.changeCB(this, this.value, oldValue);
    },

    _onClick: function onClick(e) {
      if (e.ctrlKey || e.metaKey) return;
      if ( !e.target.classList.contains("item") ) return;
      e.preventDefault();
      this._select(e.target);
    },

    _getActiveIndex: function getActiveIndex() {
      var active = this._selectedEl;
      var index = indexOf.call(this.items, active);
      return index;
    },

    movePosition: function movePosition(direction) {
      var index = this._getActiveIndex();
      this.selectIndex(index+direction);
    },

    selectIndex:  function selectIndex(index) {
      var item = this.items[index];
      if (item) this._select(item);
      this._scrollIntoView();
    },

    // ### public

    remove: function remove() {
      this.el.remove();
    },

    deselect: function deselect() {
      if (this._selectedEl) this._deselect(this._selectedEl);
    },

    selectValue: function selectValue(value) {
      var el = this.el.querySelector("[data-value='"+value+"']");
      this._select(el);
    },

    itemTemplate: function itemTemplate(data) {
      return '<div class="item" data-value="'+data.value+'" role="treeitem">'+data.name+'</div>';
    },

    groupTemplate: function groupTemplate(data) {
      return '<div class="divider">'+data.title+'</div>';
    }

  };

  return CustomSelect;

})();


ColumnView.prototype.Preview = (function() {
  "use strict";

  function Preview(parent, el) {
    this.el = parent;
    this.el.appendChild(el);
    this.el.classList.add("html");
  }

  Preview.prototype = {
    remove: function remove() {
      this.el.remove();
    }
  };
  return Preview;
})();
