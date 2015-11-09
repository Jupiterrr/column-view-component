function sourceEvent(value, cb) {
  var event = data.events[value.slice(1)]
  var div = document.createElement("div");
  div.classList.add("event");
  div.innerHTML = "<h2>"+event.name+"</h2>"+event.type+"<br />"+event.lecturer+"<br /><p>"+event.description+"</p>";
  cb({dom: div});
}

function sourceNode(value, cb) {
  var node = data.tree[value || data.rootID];
  var childIDs = node[1];
  if (childIDs.length == 0) {
    sourceEmpty(value, cb);
    return;
  }

  var children = childIDs.map(function(id) {
    if (!node[2]) {
      var n = data.tree[id];
      var value = id;
      return {name : n[0], value: value};
    } else {
      var n = data.events[id];
      var value = "e" + id;
      return {name : n.name, value: value};
    }
  })
  cb({items: children});
}

function sourceEmpty(value, cb) {
  var div = document.createElement("div");
  div.innerHTML = "empty";
  cb({dom: div});
}

function source(value, cb) {
  // console.log("source", value);
  var sourceFn = value[0] == 'e' ? sourceEvent : sourceNode;
  sourceFn(value, cb);
};
