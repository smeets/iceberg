var g_id = 0
function Player(ws) {
	this.ws = ws
	this.id = g_id++
}

module.exports = Player