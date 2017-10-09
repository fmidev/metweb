const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Is the current build a development build
const IS_DEV = (process.env.NODE_ENV === 'dev');

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
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            IS_DEV: IS_DEV
        }),

        new webpack.ProvidePlugin({
	        $: 'jquery',
			jQuery: 'jquery'
        }),

        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src/views/home/home.handlebars'),
            title: appHtmlTitle
        })
    ],
    module: {
        rules: [
            // Babel
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /(node_modules|mapWindows\.js)/,
                options: {
                    compact: true
                }
            },

            // Styles
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: IS_DEV
                        }
                    }
                ]
            },

            // Less
            {
                test: /\.less/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: IS_DEV
                        }
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            sourceMap: IS_DEV,
                            includePaths: [dirAssets],
                        }
                    }
                ]
            },

            // Handlebars
            {
                test: /\.handlebars$/,
                loader: 'handlebars-loader'
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
			    use: {
			        loader: 'svg-url-loader',
			        options: {}
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
