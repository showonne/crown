var proxy = require('http-proxy-middleware')

module.exports = options => {
    const filter = (path, req) => {
        return !req.headers.accept.includes('text/html')
    }

    return proxy(filter, options)
}