var webpack = require('webpack');
var nodeEnvironment = process.env.NODE_ENV;
var bourbon = require('node-bourbon').includePaths;
var _ = require('lodash');
var autoImportHash = require('./src/config/autoimport.json');

var config = {
  context: __dirname + '/src',
  node: {
    __filename: true,
  },   
  entry: './index.js',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'INCLUDE_ALL_MODULES': function includeAllModulesGlobalFn (modulesArray, application) {
        modulesArray.forEach(function executeModuleIncludesFn (moduleFn) {
            moduleFn(application);
        });
      },
      ENVIRONMENT: JSON.stringify(nodeEnvironment)
    })
  ],
  output: {
    path: __dirname + '/src',
    filename: 'bundle.js'
  },
  resolve: {
    root: __dirname + '/src'
  },
  jscs: {
    // JSCS errors are displayed by default as warnings.
    // Set `emitErrors` to `true` to display them as errors.
    emitErrors: false,

    // JSCS errors do not interrupt the compilation.
    // Set `failOnHint` to `true` if you want any file with
    // JSCS errors to fail.
    failOnHint: false
  },
  module: {
    preLoaders: [{
      test:    /\.js$/,
      exclude: /node_modules/,
      loader: 'eslint-loader'
    }, {
      test: /\.(js|jsx)$/,
      loader: 'auto-import-preloader',
      exclude: /node_modules/,
      query: {
        source: autoImportHash
      }
    }],
    loaders: [
      {test: /\.js$/, exclude: /(node_modules)/, loader: 'babel', query: {presets: ['stage-0'], plugins: ['transform-decorators-legacy']}},
      {test: /\.html/, exclude: /(node_modules)/, loader: 'html-loader'},
      {test: /\.s?css$/, loader: 'style!css!sass?includePaths[]=' + bourbon},
      {test: /\.(png|jpg)$/, loader: 'url-loader?mimetype=image/png'}
    ]
  }
};

switch (nodeEnvironment) {
  case 'production':
    config.output.path = __dirname + '/dist';
    config.plugins.push(new webpack.optimize.UglifyJsPlugin());
    config.plugins.push(new webpack.optimize.DedupePlugin());
    config.plugins.push(new webpack.optimize.OccurenceOrderPlugin());
    config.plugins.push(new webpack.optimize.CommonsChunkPlugin({name: 'vendor', minChunks: Infinity}));

    config.output.filename = '[name].js';

    config.entry = {
      bundle: './index.js',
      vendor: ['angular', 'angular-ui-router', 'lodash']
    };
    config.devtool = 'source-map';
    break;

  case 'test':
    config.entry = './index.js';
    break;

  case 'development':
    config.entry = ['./index.js', 'webpack/hot/dev-server'];
    config.devtool = 'source-map';
    break;

  default:
    console.warn('Unknown or Undefigned Node Environment. Please refer to package.json for available build commands.');
}

module.exports = config;
