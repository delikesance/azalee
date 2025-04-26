{ pkgs, lib, config, inputs, ... }:

{
	packages = with pkgs; [bws];

	languages.javascript.enable = true;
	languages.javascript.bun.enable = true;
  dotenv.enable = true;

	scripts.build.exec = ''
		bws run --project-id $BWS_PROJECT_ID -- bun build --target bun ./src/index.ts --outdir ./build/
	'';

	scripts.run.exec = ''
		bws run --project-id $BWS_PROJECT_ID -- bun run ./src/index.ts
	'';
}
