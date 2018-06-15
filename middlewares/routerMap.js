module.exports = pages => {
    return (req, res, next) => {
        let html = '<ul>'
        pages.map(page => {
            html += `<li><a href="${page.url}">${page.pageName || page.name} -- ${page.url}</a></li>`
        })
        html += '</ul>'

        res.send(html)
    }
}