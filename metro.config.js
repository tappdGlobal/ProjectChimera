const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const { resolver } = config;

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== "wasm"),
  sourceExts: [...resolver.sourceExts, "wasm"],
};

module.exports = config;
