const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  devtool: 'inline-source-map',
  plugins: [
		new CleanWebpackPlugin(['dist'])
  ],
  output: {
    filename: 'fsm.js',
    path: path.resolve(__dirname, 'dist')
  }
};