.PHONY: test build install

test:
	node testrunner.js

build:
	lessc --yui-compress ./assets/less/main.less > ./assets/css/main.min.css
	uglifyjs ./assets/js/main.js -o ./assets/js/main.min.js
	sass ./assets/less/font.scss ./assets/css/font.min.css

install:
	npm install -g lessc
	npm install -g uglify-js
	gem install sass