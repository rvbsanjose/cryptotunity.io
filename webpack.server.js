const path = require('path'),
      CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = (env, argv) => {
    return {
        watch: true,

        watchOptions: {
            poll: 5000,
            ignored: /node_modules/
        },
        
        target: 'node',

        mode: argv.mode === 'development' ? 'development' : 'production',

        entry: path.resolve('src', 'server'),

        output: {
            filename: 'index.js',
            path: path.resolve('dist', 'server')
        },

        stats: {
            warnings: false
        },

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
};