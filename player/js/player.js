var socket = undefined
var player = {
    id: -1
}

var input = [0,0,0]
var calibration = [0,0,0]
var reset_on_next = true
var game_loop = -1
var peer = undefined

// level 1 networking
function on_socket_open(event) {
    socket.send(JSON.stringify({ req: 'join' }));
}

function on_socket_close(event) { }

function on_socket_message(event) {
    var data = JSON.parse(event.data)

    if (data.req === 'join') {
        player.id = data.id

        peer = new SimplePeer({ initiator: true })

        peer.on('signal', player_signal)
        peer.on('connect', player_join)
        peer.on('close', player_leave)

        peer.on('error', function(err) {
            player_leave()
            document.getElementById('status').textContent = 'error = ' + err
        })

        return
    }

    if (data.req === 'signal') {
        peer.signal(data.data)
        return
    }
}

// level 2 networking
function player_signal(data) {
    document.getElementById('status').textContent = 'signaling'
    socket.send(JSON.stringify({ req: 'signal', who: player.id, data: data}))
}

function player_join() {
    zero_orientation()
    game_loop = setInterval(tick, 10)

    document.getElementById('status').textContent = 'connected'
}

function player_leave() {
    clearInterval(game_loop)
    game_loop = 0
    document.getElementById('status').textContent = 'disconnected'
}

function tick() {
    peer.send(JSON.stringify({
        req: 'input',
        id: player.id,
        input: sampleInput()
    }))
}

var debug = undefined
function sampleInput() {
    var x = input[0] - calibration[0]
    var y = input[1] - calibration[1]
    var z = input[2] - calibration[2]

    var childs = debug.childNodes.length
    while (childs--)
        debug.removeChild(debug.lastChild)
    debug.appendChild(document.createTextNode("x:" + x))
    debug.appendChild(document.createElement('p'))
    debug.appendChild(document.createTextNode("y:" + y))
    debug.appendChild(document.createElement('p'))
    debug.appendChild(document.createTextNode("z:" + z))

    return [x, 0, z]
}

var last = 0
function tilt(event) {
    console.log(Date.now()-last)
    last = Date.now()

    var x = event.beta // -180-180
    var y = event.gamma // -90-90
    var z = event.alpha // 0-360

    input[0] = x
    input[1] = y
	input[2] = z

    if (reset_on_next) {
        calibration[0] = x
        calibration[1] = y
        calibration[2] = z
        reset_on_next = false
    }
}

function zero_orientation() {
    reset_on_next = true
}


window.addEventListener('load', function () {
    debug = document.getElementById('debug' )

    document.getElementById('reset').addEventListener('click', zero_orientation, false)
    window.addEventListener('deviceorientation', tilt, false)

    socket = new WebSocket('ws://' + window.location.hostname + ':3000')
    socket.addEventListener('open', on_socket_open)
    socket.addEventListener('close', on_socket_close)
    socket.addEventListener('message', on_socket_message)
}, false)
