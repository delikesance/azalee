{ pkgs, lib, config, inputs, ... }:

{
	packages = with pkgs; [bws];

	languages.javascript.enable = true;
	languages.javascript.bun.enable = true;

	scripts.build.exec = ''
		bws run --project-id 0f626c5f-5af3-478d-9545-b2ca00baf4eb -- bun build --target bun ./src/index.ts --outdir ./build/
	'';

	scripts.run.exec = ''
		bws run --project-id 0f626c5f-5af3-478d-9545-b2ca00baf4eb -- bun run ./src/index.ts
	'';
}
