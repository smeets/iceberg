var uWS = require('uWebSockets.js')
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
    if (ifname.startsWith('vEthernet')) return
    if (ifname.startsWith('Tailscale')) return
    ip = iface.address
  });
});
console.log('using ip address', ip)

module.exports = function start(port) {
    const OBSERVE_ACCEPT_RESPONSE = JSON.stringify({
        'req': 'observe',
        ip: ip
    })

    var players = []
    var observers = []

    function broadcast(sockets, what) {
        for (var i = 0; i < sockets.length; i++)
            sockets[i].send(what, false)
    }

    var handlers = {
        // { req: 'join' } --> { req: 'join', id: player_id }
        'join': function(packet) {
            var newPlayer = new Player(this)
            players.push(newPlayer)

            this.send(JSON.stringify({ req: 'join', id: newPlayer.id }))
        },

        // { req: 'observe' } --> { req: 'observe', ip: local_addr }
        'observe': function(packet) {
            observers.push(this)
            this.send(OBSERVE_ACCEPT_RESPONSE)
        },

        // { req: 'signal', who: player.id, data: signal_data }
        'signal': function(packet) {
            var isObserver = observers.indexOf(this) !== -1

            if (isObserver) {
                var player = undefined
                for (var i = 0; i < players.length; i++) {
                    if (players[i].id === packet.who) {
                        player = players[i]
                        break
                    }
                }
                if (!player) return

                player.ws.send(JSON.stringify({ req:'signal', who:packet.who, data:packet.data}))
            } else {
                broadcast(observers, JSON.stringify({ req:'signal', who:packet.who, data:packet.data}))
            }
        }
    }

    function onMessage(ws, msg, isBinary) {
        if (!msg) return
        if (isBinary) return

        var packet = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(msg)))
        handlers[packet.req].apply(ws, [packet])
    }

    function onClose(ws, code, msg) {
        for (var i = 0; i < observers.length; i++) {
            if (ws === observers[i]) {
                observers.splice(i, 1)
                return
            }
        }

        for (var i = 0; i < players.length; i++) {
            if (ws === players[i].ws) {
                players.splice(i, 1)
                return
            }
        }
    }

    var wss = uWS.App().ws('/*', {
        message: onMessage,
        close: onClose,
        drain: (ws) => {
            console.log('WebSocket backpressure: ' + ws.getBufferedAmount());
          }
    }).listen(port, token => token ? console.log('wss @', port) : console.log('wss error'))

}
