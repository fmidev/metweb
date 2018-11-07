const webpackConfig = require('./webpack.config')

webpackConfig.forEach(function(config) {
  if (config.output.filename == '[name].en.js') {
    module.exports = Object.assign(config, {

      devtool: 'eval',

      output: {
        pathinfo: true,
        publicPath: '/',
        filename: '[name].en.js'
      },
    })
  }
})
