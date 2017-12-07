const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('../webpack.config.js');
const path = require('path');

module.exports = merge(common, {
  devtool: 'eval-source-map',
  devServer: {
    historyApiFallback: true,
    hot: true,
    port: 8080,
    noInfo: false,
    host: 'localhost'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
});