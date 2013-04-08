.PHONY: test build install

test:
	@echo "Running tests..."
	@./node_modules/istanbul/lib/cli.js cover ./testrunner.js
	@echo "Creating coverage report..."
	@./node_modules/istanbul/lib/cli.js report html

build:
	@echo "Building stylesheets..."
	@lessc --yui-compress ./assets/less/main.less > ./assets/css/main.min.css
	sass ./assets/less/font.scss ./assets/css/font.min.css
	@echo "Minifing client javascript..."
	@uglifyjs ./assets/js/main.js -o ./assets/js/main.min.js
	@echo "Done."

install:
	npm install -g less
	npm install -g uglify-js
	gem install sass

	@echo "Creating database schema..."
	@node ./lib/install.js
	@echo "Done."

uninstall:
	@echo "Remoing database schema..."
	@node ./lib/uninstall.js
	@echo "Done."