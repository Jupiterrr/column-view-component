# &lt;column-view&gt;

Polymer Web Component for a Miller columns (a.k.a. OS X Column View) element


<img src="https://f.cloud.github.com/assets/681942/2457975/993771cc-af43-11e3-9585-0dadd54e6c4c.png" alt="screenshot" width="450" />

What does it do?

* It does fast
* It does Preview cloumns
* It does keyboard navigation

### [Demos with Code](http://raw.githack.com/Jupiterrr/column-view-component/master/demo/index.html)



## Install

Install the component using [Bower](http://bower.io/):

```sh
$ bower install column-view --save
```

<!--Or [download as ZIP](https://github.com/zenorocha/voice-elements/archive/gh-pages.zip).-->

## Usage

1. Import Web Components' polyfill:

    ```html
    <script src="bower_components/platform/platform.js"></script>
    ```

2. Import Custom Element:

    ```html
    <link rel="import" href="bower_components/column-view/dist/column-view.html">
    ```

3. Insert Custom Element

    ```html
    <column-view ondata="sourceFn"></column-view>
    ```

4. Set up your data source

	Example:

    ```html
    <script type="text/javascript">
      var data = {
        0: {name: "root", childIDs: [1,2]}, // not vissible
        1: {name: "Item 1", childIDs: [3,4,5]},
        2: {name: "Item 2"},
        3: {name: "Item 3"},
        4: {name: "Item 4"},
        5: {name: "Item 5"}
      };

      function getChildren(selectedItem) {
        var children = selectedItem.childIDs.map(function(id) {
          var item = data[id];
          return {name: item.name, value: id};
        });
        return children;
      }

      function sourceFn(ID, cb) {
        if (!ID) ID = 0;
        var selectedItem = data[ID];
        if (selectedItem.childIDs) {
          cb({items: getChildren(selectedItem)});
        } else {
          cb({dom: document.createTextNode("Preview: " + selectedItem.name)})
        }
      }
    </script>
    ```

## &lt;column-view&gt;


### Attributes

Attribute | Options | Default | Description
--- | --- | --- | ---
`ondata` | *Function(String value, Function callback)* | None. | **Required**<br> A function to be called for each selected item. This function can either pass child items or an HTML element to the callback function.<br><br>Callback:<br>`callback({dom: <HTMLElement>})` <br> `callback({items: [{name: <String>, value: <String, Number>}, ...]})`
`path` | *String* | `""` | Defines the path of items the column-view is initialized with. When the element is ready the `ondata` method is called with each item ID. Each call results in a new column. <br><br>IDs are speareated by `/`.<br><br>Example: `path="1/2/3"`

### Methods

Method | Parameters | Returns | Description
--- | --- | --- | ---
`back()`  | None. | Nothing. | Deselects last selected item

### Properties

Method | Returns | Description
--- | --- | ---
`canMoveBack` | *Boolean* | ...

### Events

Event | Description
--- | ---
`change` | Fires when selection changes.


## &lt;button is="column-view-back"&gt;

With `is="column-view-back"` you can extend a button so that when you click it you move the selection one column to the left.

```html
<button is="column-view-back" for="columnViewID">back</button>
<column-view id="columnViewID"></column-view>
```

### Attributes

Attribute | Options | Default | Description
--- | --- | --- | ---
`for` | *ID* | None. | The ID of a column-view

<!--

## Development

In order to run it locally you'll need to fetch some dependencies and a basic server setup.

1. Install [Bower](http://bower.io/) & [Grunt](http://gruntjs.com/):

    ```sh
    $ [sudo] npm install -g bower grunt-cli
    ```

2. Install local dependencies:

    ```sh
    $ bower install && npm install
    ```

3. To test your project, start the development server and open `http://localhost:8000`.

    ```sh
    $ grunt server
    ```

4. To build the distribution files before releasing a new version.

    ```sh
    $ grunt build
    ```

5. To provide a live demo, send everything to `gh-pages` branch.

    ```sh
    $ grunt deploy
    ```
-->

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## License

[MIT License](http://opensource.org/licenses/MIT)
