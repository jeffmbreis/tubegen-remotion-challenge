import { Config } from '@remotion/cli/config';

Config.overrideWebpackConfig((current) => ({
  ...current,
  module: {
    ...current.module,
    rules: [
      ...current.module.rules,
      { test: /\.m?jsx?$/, resolve: { fullySpecified: false } },
    ],
  },
}));
