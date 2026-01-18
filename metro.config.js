const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const { resolver } = config;

config.resolver = {
  ...resolver,
  // Ensure wasm is treated as an asset (binary), not source (code)
  assetExts: [...resolver.assetExts, "wasm"],
  sourceExts: resolver.sourceExts.filter((ext) => ext !== "wasm"),
};

module.exports = config;
