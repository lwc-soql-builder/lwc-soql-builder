/* eslint-disable no-undef */
// Custom webpack configuration file, provides generation of service worker
// More information: https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin
const webpack = require('webpack');
const { GenerateSW } = require('workbox-webpack-plugin');
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin');
const env = process.env.NODE_ENV || 'development';
const config = require(`../config/${env}`);

module.exports = {
    output: {
        publicPath: './'
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': JSON.stringify({
                ...config,
                ...process.env
            })
        }),
        new HtmlReplaceWebpackPlugin([
            {
                pattern: '{$GOOGLE_ANALYTICS_ID}',
                replacement: config.GOOGLE_ANALYTICS_ID
            }
        ]),
        new GenerateSW({
            swDest: 'sw.js',
            skipWaiting: true,
            exclude: [/.DS_Store/]
        })
    ]
};
