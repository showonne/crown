#!/usr/bin/env node

const fs = require('fs')
const xa = require('xa')
const path = require('path')
const program = require('commander')

const express = require('express')
const webpack = require('webpack')

const pkg = require('../package.json')
const shell = require('shelljs')
const ora = require('ora')

program
    .version(pkg.version)
    .option('-c, --config <path>', 'config file path')
    .parse(process.argv)


const configPath = path.resolve(program.config || 'crown.config.js')

if(!fs.existsSync(configPath)){
    console.log()
    xa.error('Could not found crown.conf.js', { exit: false })
    return
}

let crownConfig = require(configPath)

const webpackConfig = require('../webpack-conf/webpack.prod.conf.js')(crownConfig)

shell.rm('-rf', webpackConfig.output.path)

const compiler = webpack(webpackConfig)

const spinner = ora('building for production...')
spinner.start()

compiler.run((err, stats) => {
    if(err) return spinner.fail('build faild.')

    process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
    }) + '\n\n')
    
    if(stats.hasErrors()) return spinner.fail('build faild.')

    spinner.succeed('build success')
})