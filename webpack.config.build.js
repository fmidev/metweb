const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin
const webpackConfig = require('./webpack.config')

module.exports = Object.assign(webpackConfig, {

  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },

  plugins: webpackConfig.plugins.concat([
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest']
    }),
    new CleanWebpackPlugin(['dist']),
    new LicenseWebpackPlugin({
      pattern: /.*/,
      licenseFilenames: [ // list of filenames to search for in each package
        'LICENSE',
        'LICENSE.md',
        'LICENSE.txt',
        'license',
        'license.md',
        'license.txt'
      ],
      perChunkOutput: true, // whether or not to generate output for each chunk, for just create one file with all the licenses combined
      // outputTemplate: 'output.template.ejs', // ejs template for rendering the licenses. The default one is contained in the license-webpack-plugin directory under node_modules
      outputFilename: '../metweb.licenses.txt', // output name. [name] refers to the chunk name here. Any properties of the chunk can be used here, such as [hash]. If perChunkOutput is false, the default value is 'licenses.txt'
      suppressErrors: false, // suppress error messages
      includePackagesWithoutLicense: false, // whether or not to include packages that are missing a license
      unacceptablePattern: undefined, // regex of unacceptable licenses
      abortOnUnacceptableLicense: true, // whether or not to abort the build if an unacceptable license is detected
      addBanner: false, // whether or not to add a banner to the beginning of all js files in the chunk indicating where the licenses are
      bannerTemplate: // ejs template string of how the banner should appear at the beginning of each js file in the chunk
        '/*! 3rd party license information is available at <%- filename %> */',
      includedChunks: [], // array of chunk names for which license files should be produced
      excludedChunks: [], // array of chunk names for which license files should not be produced. If a chunk is both included and excluded, then it is ultimately excluded.
      additionalPackages: [] // array of additional packages to scan
    }),
  ])

})
