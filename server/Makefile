.PHONY: lint build run clean apidoc secret-reset


all: build
	@:

lint:
	@npm run lint

build: lint
	@npm run build

run: build
	@npm run dev

clean:
	@-npm run clean

apidoc:
	@apidoc -i src -o ../apidoc/

secret-reset:
	@script/secret-gen.sh
