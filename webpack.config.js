const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const loaders = require('./webpack_cfg/loaders');
const env = process.env.NODE_ENV;

// the path(s) that should be cleaned
const pathsToClean = [
  'dist'
];

// the clean options to use
const cleanOptions = {
  root:     process.cwd(),
  verbose:  true,
  dry:      false
};

module.exports = {
  entry: {
    app: './src/index.js'
  },
  output: {
    filename: 'js/[name].bundle.js',
    path: path.resolve(__dirname, './dist')
  },
  module: loaders(),
  plugins: [
    new CleanWebpackPlugin(pathsToClean, cleanOptions),
    new HtmlWebpackPlugin({
      title: `${env} - build`,
      template: 'src/index.html'
    }),
    new ExtractTextPlugin("styles/styles.css")
  ]
};