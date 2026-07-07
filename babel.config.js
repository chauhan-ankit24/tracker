module.exports = function (api) {
  api.cache(true);
  return {
    // Both presets append `react-native-reanimated/plugin` (which must run
    // last), so it does not need to be listed manually here.
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
