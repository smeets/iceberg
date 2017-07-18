function Vector3(x,y,z) {
	this.x = x
	this.y = y
	this.z = z
}

Vector3.prototype.add = function(other) {
	this.x += other.x
	this.y += other.y
	this.z += other.z
	return this
};

Vector3.prototype.scale = function(factor) {
	this.x *= factor
	this.y *= factor
	this.z *= factor
	return this
};

Vector3.prototype.toArray = function() {
	return [this.x, this.y, this.z]
}

Vector3.prototype.readArray = function(data) {
	this.x = data[0]
	this.y = data[1]
	this.z = data[2]
}

module.exports = Vector3