// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  target: 'node',
  mode: 'production',
  output: {
    filename: 'main.cjs',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['ts-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
  },
};
