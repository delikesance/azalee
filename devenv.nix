{ pkgs, lib, config, inputs, ... }:

{
	packages = with pkgs; [];

	languages.javascript.enable = true;
	languages.javascript.bun.enable = true;

	scripts.build.exec = ''
		bun build --target bun ./src/index.ts --outdir ./build/
	'';

	scripts.run.exec = ''
		bun run ./src/index.ts
	'';
}
