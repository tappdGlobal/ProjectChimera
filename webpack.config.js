const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Ensure wasm files are emitted and available at runtime
  config.module.rules.push({
    test: /\\.wasm$/i,
    type: 'asset/resource',
  });

  // Enable async WebAssembly support in webpack (if available)
  config.experiments = config.experiments || {};
  config.experiments.asyncWebAssembly = true;

  return config;
};
