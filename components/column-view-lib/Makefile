
PREFIXER_BIN = node_modules/autoprefixer/bin/autoprefixer

build:
	make clean
	make jshint
	make concat

jshint:
	jshint js/jquery.hcolumns.js

concat:
	cat src/column-view.js > src/column-view-all.js
	cat src/coumn.js > src/column-view-all.js

prefix:
	${PREFIXER_BIN} src/column-view.css 

clean:
	rm -f src/column-view-all.js

column-view.js:
	cat src/column-view.js > $@
	cat src/custom-select.js >> $@

