const path = require('path');

module.exports = {
    entry: './src/microKanren.js',
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'build.js',
        libraryTarget: 'umd'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
        }]
    }
}