
dist/column-view-back.html:
	cp src/column-view-back.html dist

dist/column-view.html: dist/column-view-back.html
	cp src/column-view.html dist
	sed -i 's/bower_components/../g' src/column-view.html

all: dist/column-view.html
