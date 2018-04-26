const path = require('path')

let webpackConfig = {
    context: process.cwd(),
    entry: {},
    output: {
        path: path.resolve('/dist'),
        filename: '[name].js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.js', '.vue'],
        modules: [path.resolve('src'), 'node_modules']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader'
            },
            {
                test: /\.(png|svg)$/,
                use: [{ loader: 'file-loader' }]
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        query: {
                            limit: 10000
                        }
                    }
                ]
            }
        ]
    },
    plugins: []
}

module.exports = webpackConfig