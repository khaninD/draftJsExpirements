const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const common = require('../webpack.config.js');

module.exports = merge(common, {
  plugins: [
    new UglifyJSPlugin(),
    new ExtractTextPlugin("styles/styles.css")
  ]
});