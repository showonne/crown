const merge = require('webpack-merge')
const baseConf = require('./webpack.base.conf.js')
const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')

let FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
var HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
var webpack = require('webpack')

module.exports = crownConfig => {

    const pageMap = crownConfig.pages

    for(let page of pageMap){
        let key = page.name
        baseConf.entry[key] = path.resolve(page.entryFile)

        baseConf.plugins.push(
            new htmlWebpackPlugin({
                chunks: ['manifest', 'vendor', key],
                template: `!!raw-loader!${path.resolve(crownConfig.views.src, page.name)}.ftl`,
                filename: path.resolve(crownConfig.views.root, `${page.name}.ftl`),
                chunksSortMode: 'dependency',
                alwaysWriteToDisk: true
            })
        )
    }

    const devConf = {
        module: {
            rules: [
                {
                    test: /\.(js|vue)$/,
                    loader: 'eslint-loader',
                    // check source files, not modified by other loaders like `babel-loader`
                    // https://github.com/MoOx/eslint-loader
                    enforce: 'pre',
                    include: [path.resolve('src')],
                    options: {
                        formatter: require('eslint-friendly-formatter')
                    }
                },
                {
                    test: /\.vue$/,
                    loader: 'vue-loader',
                    options: {
                        postcss: require('./postcss.config.js')
                    }
                },
                {
                    test: /\.css$/,
                    use: [
                        { loader: 'style-loader' },
                        { loader: 'css-loader',
                            options: {
                                importLoaders: 1
                            }
                        },
                        { loader: 'postcss-loader',
                            options: {
                                config: {
                                    path: path.resolve(__dirname, './postcss.config.js')
                                }
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new HtmlWebpackHarddiskPlugin(),
            new webpack.NamedModulesPlugin(),
            new FriendlyErrorsWebpackPlugin()
        ]
    }

    return merge(baseConf, devConf, crownConfig.webpack)
}
