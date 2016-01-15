// data (from data.js) is save to `window.data`
// structure:
//   window.data = {
//     tree: {
//       <id>: [<name>, <ids of child nodes>, <is leave>],
//       ...
//     },
//     events: {
//       <id>: { name: "", type: "", lecturer: "", description: "" },
//       ...
//     }
//   }

// called whenever the selection changes
function ondata(value, cb) {
  if (value[0] == 'e') {
    cb({ dom: toDom(getEventPreview(value)) });
  } else {
    var items = getListItems(value);
    if (items.length == 0) {
      cb({ dom: toDom("<div>empty</div>") });
    } else {
      cb({ items: getListItems(value) });
    }
  }
}

function getEventPreview(value) {
  var eventId = value.slice(1);
  var e = data.events[eventId];
  return "<div class='event'><h2>" + e.name + "</h2>" + e.type + "<br />" + e.lecturer + "<br /><p>" + e.description + "</p></div>";
}

function getListItems(value) {
  var node = data.tree[value || data.rootID];
  var childIDs = node[1];

  return childIDs.map(function(id) {
    if (node[2]) { // true it its a leave node
      var event = data.events[id];
      return { name: event.name, value: "e" + id };
    } else {
      var item = data.tree[id];
      return { name: item[0], value: id };
    }
  });
}

// helper function
function toDom(html) {
  var wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  return wrapper;
}
