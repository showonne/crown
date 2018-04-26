const fs = require('fs')
const path = require('path')
const stripJsonComments = require('strip-json-comments')

function readJSON(path){
    var exists = fs.existsSync(path)
    if(!exists) return {}

    var jsonObj = JSON.parse(stripJsonComments(fs.readFileSync(path, 'utf-8')))
    Object.keys(jsonObj).map(key => {
        if(typeof jsonObj[key] === 'object') jsonObj[key] = JSON.stringify(jsonObj[key])
    })
    return jsonObj
}

module.exports = (app, pagesMap) => {
    const viewMockPath = path.resolve(app.get('views mock'))

    pagesMap.map(page => {
        app.get(page.url, (req, res, next) => {
            if(/text\/html/.test(req.headers.accept)){
                res.render(page.name, readJSON(`${viewMockPath}/${page.name}.json`))
            }else{
                next()
            }
        })
    })
}