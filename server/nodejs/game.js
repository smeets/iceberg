var WebSocketServer = require('uws').Server
var Player = require('./player.js')

var os = require('os');
var ifaces = os.networkInterfaces();
var ip = ""
Object.keys(ifaces).forEach(function (ifname) {
  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    ip = iface.address
  });
});
console.log('using ip address', ip)

module.exports = function start(port) {
    var wss = new WebSocketServer({ port: port })
    console.log('WSS', '@', port)

    var players = []
    var observers = []

    function broadcast(sockets, what) {
        for (var i = 0; i < sockets.length; i++)
            sockets[i].send(what)
    }

    var handlers = {
        'join': function(packet) {
            var newPlayer = new Player(this)
            players.push(newPlayer)

            this.send(JSON.stringify({ req: 'join', msg: 'accept', id: newPlayer.id }))
            console.log('player', newPlayer.id, 'joined')
        },

        'observe': function(packet) {
            observers.push(this)
            this.send(JSON.stringify({ 'req': 'observe', 'msg': 'accept', ip: ip }))
        },

        'input': function(packet) {
            var player = undefined
            for (var i = 0; i < players.length; i++) {
                if (players[i].id === packet.id) {
                    player = players[i]
                    break
                }
            }
            if (!player) return

            player.input.readArray(packet.input)
        }
    }

    function onMessage(message) {
        if (!message) return

        var packet = JSON.parse(message)
        handlers[packet.req].apply(this, [packet])
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
                console.log('removing player', players[i].id)
                players.splice(i, 1)
                return
            }
        }
    }

    wss.on('connection', function (ws) {
        ws.on('message', onMessage)
        ws.on('close', onClose)
    });

    setInterval(loop, 32)
    var time_delta = 0.032
    function loop() {
        for (var i = 0; i < players.length; i++) {
            var player = players[i]

            player.update(time_delta)

            var newpos = JSON.stringify({
                req: "update",
                player: player.id,
                position: player.character.position.toArray()
            })

            broadcast(observers, newpos)
        }
    }
}