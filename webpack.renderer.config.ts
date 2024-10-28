import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push(...[
  {
    test: /\.css$/,
    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
  },
  {
    test: /\.s[ac]ss$/,
    use: [
      'style-loader',
      'css-loader',
      {
        loader: 'sass-loader',
        options: {
          sassOptions: {
            // Silence some deprecation warnings triggered by Bootstrap
            silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'mixed-decls'],
          }
        }
      }
    ]
  }
]);

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  devtool: 'source-map',
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.sass', '.scss'],
  },
};
