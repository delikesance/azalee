{ pkgs, lib, config, inputs, ... }:

{
  packages = with pkgs; [ git nodejs ];

  languages.javascript.enable = true;
  languages.javascript.bun.enable = true;

  dotenv.enable = true;
}
