var HTTP_PORT = 8080
require('./static.js')(HTTP_PORT)

var WSS_PORT = 3000
require('./game.js')(WSS_PORT)
