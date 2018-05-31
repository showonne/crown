#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const program = require('commander')

const xa = require('xa')
const express = require('express')
const webpack = require('webpack')

const pkg = require('../package.json')

program
    .version(pkg.version)
    .option('-c, --config <path>', 'config file path')
    .option('-p, --proxy <proxyName>', 'proxy http request')
    .parse(process.argv)

const configPath = path.resolve(program.config || 'crown.config.js')

if(!fs.existsSync(configPath)){
    console.log()
    xa.error('Could not found crown.conf.js', { exit: false })
    return
}

let { crownConfig = {} } = require(configPath)

let webpackConfig = require('../webpack-conf/webpack.dev.conf.js')(crownConfig)

// inject HMR client
Object.keys(webpackConfig.entry).map(key => {
    webpackConfig.entry[key] = [path.resolve(__dirname, '../dev-client.js')].concat(webpackConfig.entry[key])
})

const app = express()
const compiler = webpack(webpackConfig)

const devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    logLevel: 'silent'
})

const hotMiddleware = require('webpack-hot-middleware')(compiler, {
    log: () => {}
})

app.use(devMiddleware)
app.use(hotMiddleware)

// static resources
crownConfig.resource.map(item => {
    app.use(express.static(path.resolve(item)))
})


app.set('view engine', crownConfig.views.engine)
app.set('views', path.resolve(crownConfig.views.root))

app.set('views mock', crownConfig.views.mock)

switch(crownConfig.views.engine){
    case 'ftl':
        app.engine('ftl', require('express-ftl'))
        break
    default:
        app.engine('ftl', require('express-ftl'))
}

const router = require('../router.js')

router(app, crownConfig.pages)

// mock and proxy logic
const proxyName = program.proxy

if(proxyName){
    app.use(require('./proxy.js')(crownConfig.proxyMap[proxyName]))
}else{
    app.use(require('express-localmock')(crownConfig.mock))
}

app.use((err, req, res, next) => {
    console.log(err.stack)
    res.status(500).send(err.stack)
})

const port = crownConfig.port

const uri = `http://localhost:${port}`

devMiddleware.waitUntilValid(() => {
    console.log(`Listening on: ${uri}`)
})

app.listen(port, err => {
    if(err) return console.log(err)
})
