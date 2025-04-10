{ pkgs, lib, config, inputs, ... }:

{
  packages = with pkgs; [ git nodejs libuuid ];

  languages.javascript.enable = true;
  languages.javascript.bun.enable = true;

  env = {
    LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [pkgs.libuuid];
  };

  dotenv.enable = true;
}
