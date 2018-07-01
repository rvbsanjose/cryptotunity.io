const path = require('path'),
      CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: path.resolve('src', 'server'),

    output: {
        filename: 'index.js',
        path: path.resolve('dist', 'server')
    },

    mode: 'development',

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                include: [
                    path.resolve('src', 'server')
                ]
            }
        ]
    },

    plugins: [
        new CleanWebpackPlugin([ 'dist/server' ], {
            watch: true
        })
    ]
};