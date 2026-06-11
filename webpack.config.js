var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'inline-source-map',
  mode: "development",
  context: path.resolve(__dirname, 'src'),
  entry: {
    index: './index.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/static/'
  },
};