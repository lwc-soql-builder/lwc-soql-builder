// Custom webpack configuration file, provides generation of service worker
// More information: https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin
const webpack = require('webpack');
const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = {
    output: {
        publicPath: './'
    },
    plugins: [
        new webpack.EnvironmentPlugin(['NODE_ENV', 'FIREBASE_ALIAS']),
        new GenerateSW({ swDest: 'sw.js', skipWaiting: true })
    ]
};
