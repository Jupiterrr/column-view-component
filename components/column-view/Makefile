
dist/column-view-back.html:
	cp src/column-view-back.html dist

dist/column-view-lib.js:
	cp src/column-view-lib.js dist

dist/column-view.html: dist/column-view-back.html dist/column-view-lib.js
	cp src/column-view.html dist
	sed -i .bak 's/bower_components/../g' dist/column-view.html
	rm dist/*.bak

all: dist/column-view.html

clean:
	rm -rf dist/*
