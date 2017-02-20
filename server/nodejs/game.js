var WebSocketServer = require('uws').Server

function Player(id, ws) {
    this.id = id
    this.alive = true
    this.ws = ws
    this.position = Vector3(0,0,0)
    this.velocity = Vector3(0,0,0)
    this.input = Vector3(0,0,0)
}

function Vector3(x, y, z) { return [x, y, z] }

module.exports = function start(port) {
    var wss = new WebSocketServer({ port: port })
    console.log('WSS', '@', port)

    var players = []
    var observers = []

    function broadcast(sockets, what) {
        for (var i = 0; i < sockets.length; i++)
            sockets[i].send(what)
    }

    function onMessage(message) {
        if (message === "player") {
            var id = Math.floor(Math.random() * 999999)
            players.push(new Player(id, this))
            this.send(id.toString())
            console.log('players', players)
        } else if (message === "observer") {
            observers.push(this)
        } else {
            var data = JSON.parse(message)
            var player = undefined

            for (var i = 0; i < players.length; i++) {
                if (players[i].id === data.id) {
                    player = players[i]
                    break
                }
            }
            if (!player) return

            player.input[0] = data.input[0]
            player.input[1] = data.input[1]
            player.input[2] = data.input[2]
        }
    }

    function onClose(code, msg) {
        for (var i = 0; i < observers.length; i++) {
            if (this === observers[i]) {
                console.log('removing observer')
                observers.splice(i, 1)
                return
            }
        }
        for (var i = 0; i < players.length; i++) {
            if (this === players[i].ws) {
                players.splice(i, 1)
                return
            }
        }
    }

    wss.on('connection', function (ws) {
        ws.on('message', onMessage)
        ws.on('close', onClose)
    });

    setInterval(loop, 16)
    var time_delta = 0.016
    function loop() {
        for (var i = 0; i < players.length; i++) {
            var player = players[i]

            player.velocity[0] += player.input[0] * time_delta * time_delta
            player.velocity[1] += player.input[1] * time_delta * time_delta
            player.velocity[2] += player.input[2] * time_delta * time_delta

            player.position[0] += player.velocity[0] * time_delta * 0.98
            player.position[1] += player.velocity[1] * time_delta * 0.98
            player.position[2] += player.velocity[2] * time_delta * 0.98
            
            var newpos = JSON.stringify({
                message: "update",
                player: player.id,
                position: player.position
            })
            
            broadcast(observers, newpos)
        }


    }
}