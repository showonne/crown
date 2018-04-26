#!/usr/bin/env node

const pkg = require('../package.json')

require('commander')
    .version(pkg.version)
    .usage('<command> [options]')
    .command('dev', 'start up a develop server')
    .command('build', 'build project for production')
    .parse(process.argv)
