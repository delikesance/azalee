{ pkgs ? import <nixpkgs> {} }:

let
  bunBuild = pkgs.stdenv.mkDerivation {
    name = "viper-bun-build";
    src = ./.;
    buildInputs = [ pkgs.bun ];

    buildPhase = ''
      bun install --production
      bun build --target bun --minify ./src/index.ts --outdir ./build/
    '';

    installPhase = ''
      mkdir -p $out
      cp -r build/* $out/
    '';
  };

  runtimeEnv = pkgs.buildEnv {
    name = "viper-runtime";
    paths = [buildEnv pkgs.bun];
    pathsToLink = ["/"];
  };
in

pkgs.dockerTools.buildImage {
  name = "viper";
  tag = "latest";
  contents = [ runtimeEnv ];
  config = {
    WorkingDir = "/app";
    Cmd = [ "bun" "run" "index.js" ];
    Env = [ "NODE_ENV=production" ];
  };
}

