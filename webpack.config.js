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

const appHtmlTitle = 'Web-työasema';

/**
 * Webpack Configuration
 */
module.exports = {
    entry: {
        bundle: path.join(dirApp, 'views/home/home.js')
    },
    resolve: {
        modules: [
            dirNode,
            dirApp,
            dirAssets
        ],
		alias: {
			openlayers4: path.join(dirApp, 'views/home/ol.js')
		},
    },
    plugins: [
        new webpack.DefinePlugin({
            IS_DEV: IS_DEV
        }),

        new webpack.ProvidePlugin({
	        $: 'jquery',
          jQuery: 'jquery',
          SVG: 'svg.js'
        }),

        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src/views/home/home.handlebars'),
            title: appHtmlTitle
        }),

        new CopyWebpackPlugin([
          { from: 'src/assets/images/*svg', to: 'src/assets/images', flatten: true, force: true }
        ]),

        extractLess
    ],
    module: {
        rules: [
            // Babel
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /(node_modules|layout\.js)/,
                options: {
                    compact: true
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
            }
        ]
    }
};
