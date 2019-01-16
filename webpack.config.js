const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Is the current build a development build
const IS_DEV = (process.env.NODE_ENV === 'dev');

const extractLess = new ExtractTextPlugin({
    filename: "[name].css",
    disable: IS_DEV
});

const dirNode = 'node_modules';
const dirApp = path.join(__dirname, 'src');
const dirAssets = path.join(__dirname, 'assets');

const appHtmlTitle = 'MetWeb';

/**
 * Webpack Configuration
 */
module.exports = {
    entry: {
        bundle: ["@babel/polyfill", path.join(dirApp, 'components/MainView.jsx')]
    },
    resolve: {
        modules: [
            dirNode,
            dirApp,
            dirAssets
        ],
    },
    plugins: [

        new webpack.DefinePlugin({
            APIKEY: JSON.stringify('insert-your-apikey-here'),
            USERAPI: JSON.stringify('https://metweb.fmi.fi/api')
        }),

        new webpack.ProvidePlugin({
            React: 'react',
            ReactDOM: 'react-dom',
            $: 'jquery',
            jQuery: 'jquery'
        }),

        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src/templates/home.handlebars'),
            title: appHtmlTitle
        }),

        new CopyWebpackPlugin([
          { from: 'src/assets/images/*svg', to: 'src/assets/images', flatten: true, force: true }
        ]),

        new CopyWebpackPlugin([
          { from: 'src/assets/images/*png', to: 'src/assets/images', flatten: true, force: true }
        ]),

        extractLess
    ],
    module: {
        rules: [
            // Babel
            {
                test: /\.jsx?$/,
                exclude: /node_modules\/(?!metoclient)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            },

            // Less
            {
                test: /\.less/,
                use: extractLess.extract({
                    use: [{
                        loader: "css-loader"
                    }, {
                        loader: "less-loader"
                    }],
                    // use style-loader in development
                    fallback: "style-loader"
                })
            },

            // css
            {
                test: /\.css/,
                use: extractLess.extract({
                    use: [{
                        loader: "css-loader"
                    }],
                    // use style-loader in development
                    fallback: "style-loader"
                })
            },

            // Handlebars
            {
                test: /\.handlebars$/,
                loader: 'handlebars-loader',
                query: {
                    inlineRequires: '\/images\/'
                }
            },

            // Images
            {
                test: /\.(jpe*g|png|gif)$/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]'
                }
            },
            // SVG
            {
                test: /\.svg/,
                loader: 'svg-url-loader',
                options: {
                    name: '[path][name].[ext]'
                }
            },
            // Fonts
            {
                test: /\.(ttf|eot|woff|woff2)$/,
                loader: 'file-loader',
                options: {
                    name: 'fonts/[name].[ext]',
                },
            },
            // TOML configuration files
            {
                test: /\.toml/,
                use: 'raw-loader'
                //loader: 'file-loader',
                //options: {
                //    name: 'toml/[name].[ext]'
                //}
            }
        ]
    },
    devServer: {
      disableHostCheck: true // We have more pride than localhos! Add your hostname (like metweb.local) to dev api's CORS whitelist
    }
};
