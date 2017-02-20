var express = require('express')

module.exports = function (port) {
    var app = express()

    app.use('/player', express.static('../../player'))
    app.use('/render', express.static('../../observer'))

    app.listen(port, function() {
        console.log('HTTP', '@', port)
    })
}
