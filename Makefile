.PHONY: test build install

test:
	node testrunner.js

build:
	lessc --yui-compress ./assets/less/main.less > ./assets/css/main.min.css
	sass ./assets/less/font.scss ./assets/css/font.min.css

install:
	sudo npm install -g lessc
	sudo gem install sass