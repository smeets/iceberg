var socket = new WebSocket('ws://' + window.location.hostname + ':3000')
var is_connected = false

var player = {
    id: -1
}

var input = [0,0,0]
var old_input = [0,0,0]
var reset_on_next = true
var game_loop = setInterval(tick, 32)

var debug = document.getElementById('debug')
function debug_clear() {
    var childs = debug.childNodes.length
    while (childs--)
        debug.removeChild(debug.lastChild)
}

socket.addEventListener('open', function (event) {
    socket.send(JSON.stringify({ req: 'join' }));
    console.log('connect')
})

socket.addEventListener('message', function (event) {
    var data = JSON.parse(event.data)
    if (data.req === 'join') {
        player.id = data.id
        is_connected = true
    }

    console.log('Message from server', data, event.data, event);
})

socket.addEventListener('close', function (event) {
    is_connected = false
    console.log('disconnect')
})

function tick() {
    var input = sampleInput()

    if (!is_connected) return

    socket.send(JSON.stringify({
        req: 'input',
        id: player.id,
        input: input
    }))
}

function sampleInput() {
    var x = input[0]-old_input[0]
    var y = input[1]-old_input[1]
    var z = input[2]-old_input[2]

    debug_clear()
    debug.appendChild(document.createTextNode("x:" + x))
    debug.appendChild(document.createElement('p'))
    debug.appendChild(document.createTextNode("y:" + y))
    debug.appendChild(document.createElement('p'))
    debug.appendChild(document.createTextNode("z:" + z))

    return [x, y, z]
}

function tilt(x, y, z) {
    if (x >  90) { x =  90};
    if (x < -90) { x = -90};

    // To make computation easier we shift the range of
    // x and y to [0,180]
    x += 90;
    y += 90;

    input[0] = x
    input[1] = y
	input[2] = z

    if (reset_on_next) {
        old_input[0] = input[0]
        old_input[1] = input[1]
        old_input[2] = input[2]
        reset_on_next = false
    }
}

function zero_orientation() {
    reset_on_next = true
}

window.addEventListener('deviceorientation', function (event) {
	tilt(event.beta, event.gamma, event.alpha)
}, false)

window.addEventListener('load', function () {
    document.getElementById('reset').addEventListener('click', zero_orientation)
})