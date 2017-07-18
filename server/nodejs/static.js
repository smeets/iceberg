var express = require('express')

module.exports = function (port) {
    var app = express()

    app.use('/player', express.static('../../player'))
    app.use('/render', express.static('../../observer'))

    app.get('/', function (req, res, next) {
    	var options = {
			root: __dirname + '/../',
			dotfiles: 'deny',
			headers: {
				'x-timestamp': Date.now(),
				'x-sent': true
			}
		}

		res.sendFile('index.html', options, function (err) {
			if (err) next(err)
		})
    })

    app.listen(port, function() {
        console.log('HTTP', '@', port)
    })
}
