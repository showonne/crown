const merge = require('webpack-merge')
const webpack = require('webpack')
const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const extractCommonCSS = new ExtractTextPlugin({
    filename: 'css/common.[hash:4].css'
})

const baseConf = require('./webpack.base.conf.js')

module.exports = crownConfig => {

    const pageMap = crownConfig.pages

    for(let page of pageMap){
        let key = page.name
        baseConf.entry[key] = [path.resolve(page.entryFile)]
        baseConf.plugins.push(
            new htmlWebpackPlugin({
                chunks: ['manifest', 'vendor', key],
                template: `!!raw-loader!${path.resolve(crownConfig.views.src, page.name)}.ftl`,
                filename: path.resolve(crownConfig.views.root, `${page.name}.ftl`),
                chunksSortMode: 'dependency'
            })
        )
    }

    var buildConf = {
        output: {
            path: path.resolve('resource/dist'),
            filename: '[name].[hash:4].js',
            publicPath: '/dist'
        },
        module: {
            rules: [
                {
                    test: /\.vue$/,
                    loader: 'vue-loader',
                    options: {
                        postcss: require('./postcss.config.js'),
                        loaders: {
                            css: ExtractTextPlugin.extract({
                                use: [
                                    {
                                        loader: 'css-loader',
                                        options: {
                                            minimize: true
                                        }
                                    }
                                ],
                                fallback: 'vue-style-loader'
                            })
                        }
                    }
                },
                {
                    test: /\.css$/,
                    loader: extractCommonCSS.extract([
                        {
                            loader: 'css-loader',
                            options: {
                                minimize: true
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                config: {
                                    path: path.resolve(__dirname, './postcss.config.js')
                                }
                            }
                        }
                    ])
                }
            ]
        },
        plugins: [
            extractCommonCSS,
            new ExtractTextPlugin('css/[name].[hash:4].css'),
            new ParallelUglifyPlugin({uglifyES: {}}),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
                minChunks(module) {
                    // any required modules inside node_modules are extracted to vendor
                    return (
                        module.resource &&
                        /\.js$/.test(module.resource) &&
                        module.resource.indexOf(
                          path.resolve('node_modules')
                        ) === 0
                    )
                }
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'manifest',
                chunks: ['vendor']
            }),
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
        ]
    }

    return merge(baseConf, buildConf, crownConfig.webpack)
}


