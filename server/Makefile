.PHONY: run lint build apidoc

run: build
	npm run dev

lint:
	npm run lint

build: lint
	npm run build

apidoc:
	apidoc -i src -o ../apidoc/
