.PHONY: fmt build

fmt:
	yarn prettier --write .

build:
	yarn esbuild src/index.ts --bundle --platform=node --outfile=dist/index.js --external:ssh2
