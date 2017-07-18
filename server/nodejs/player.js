const Vector3 = require('./vector3.js')

function Character() {
	this.velocity = new Vector3(0,0,0)
	this.position = new Vector3(0,0,0)
}

Character.prototype.steer = function(dt, input) {
	this.velocity.add(input.scale(dt))
	this.velocity.scale(0.90)
};

Character.prototype.move = function(dt) {
	this.position.add(this.velocity.scale(dt))
}

var g_id = 0
function Player(ws) {
	this.character = new Character()
	this.ws = ws
	this.id = g_id++
	this.input = new Vector3(0,0,0)
}

Player.prototype.update = function(dt) {
	this.character.steer(dt, this.input)
	this.character.move(dt)
};

module.exports = Player