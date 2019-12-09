const path = require('path');

module.exports = {
  mode: 'production',
  entry: [path.resolve(__dirname, './index.js')],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    publicPath: '/dist/',
    library: 'json-yup',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        loader: 'babel-loader',
        sideEffects: false
      }
    ]
  }
};
