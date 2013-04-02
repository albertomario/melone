.PHONY: test build install

test:
	node testrunner.js

build:
	lessc --yui-compress ./assets/less/main.less > ./assets/css/main.min.css
	uglifyjs ./assets/js/main.js -o ./assets/js/main.min.js
	sass ./assets/less/font.scss ./assets/css/font.min.css

install:
	npm install -g less
	npm install -g uglify-js
	gem install sass

	node ./lib/install.js

uninstall:
	node ./lib/uninstall.js