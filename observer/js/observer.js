var socket = new WebSocket('ws://' + window.location.hostname + ':3000')
var is_connected = false

function getPlayerByPeer(peer) {
    for (var i = 0; i < players.length; i++) {
        if (peer === players[i].peer)
            return players[i]
    }
    return undefined
}
function getPlayerById(id) {
    for (var i = 0; i < players.length; i++) {
        if (id === players[i].id)
            return players[i]
    }
    return undefined
}

function setupNewPeer(id) {
    var peer = new SimplePeer()

    peer.on('signal', function (data) {
        console.log('signaling to', peer, id, data)
        socket.send(JSON.stringify({ req:'signal', who:id, data:data}))
    })

    peer.on('connect', function () {
        console.log(peer, 'is now connected')
    })

    peer.on('close', function() {
        console.log(peer, 'is now disconnected')
    })

    peer.on('data', function (data) {
        getPlayerById(id).input = JSON.parse(data.toString()).input
    })

    return peer
}

socket.addEventListener('open', function (event) {
    socket.send(JSON.stringify({ req: 'observe' }));
})


function showQrCode() {
    document.getElementById("qrcode").classList.remove('disabled')
    document.getElementById("qrcode-close").classList.remove('disabled')
    document.getElementById("qrcode-show").classList.add('disabled')
}
function hideQrCode() {
    document.getElementById("qrcode").classList.add('disabled')
    document.getElementById("qrcode-close").classList.add('disabled')
    document.getElementById("qrcode-show").classList.remove('disabled')
}

var id2cube = {}
var peer2player = {}
var players = []
function setupNewPlayer(id) {
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    id2cube[id] = cube
    var player = {
        id: id,
        peer: setupNewPeer(id),
        cube: cube,
        input: [0,0,0],
        velocity: [0,0,0]
    }
    players.push(player)
    return player
}
function getPlayerObject(id) {
    var cube = id2cube[id]
    if (cube)
        return cube
    else
        return setupNewPlayer(id).cube
}
socket.addEventListener('message', function (event) {
    var data = JSON.parse(event.data)

    if (data.req === 'observe') {
        is_connected = true
        new QRCode(document.getElementById("qrcode"), "http://" + data.ip + ":8080/player");
        document.getElementById("qrcode-close").addEventListener('click', hideQrCode, false)
        document.getElementById("qrcode-show").addEventListener('click', showQrCode, false)
        return
    }

    if (data.req === 'signal') {
        var player = getPlayerById(data.who)
        if (!player)
            player = setupNewPlayer(data.who)
        player.peer.signal(data.data)
    }
})

socket.addEventListener('close', function (event) {
    is_connected = false
})

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.rotation.x = 290 * (3.1415/180.0)
camera.position.z = 4;
camera.position.y = 10

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var render = function () {
    requestAnimationFrame( render );

    var keymap = ['x','y','z']
    for (var i = 0; i < players.length; i++) {
        var player = players[i]
        for (var j = 0; j < 3; j++) {
            player.velocity[j] = player.input[j] * 0.1
            player.velocity[j] *= 0.90

            player.cube.position[keymap[j]] += player.velocity[j] * 0.016
        }

    }

    renderer.render(scene, camera);
};

var loader = new THREE.ObjectLoader();
loader.load(
    // resource URL
    "assets/floor.json",

    function ( obj ) {
		//add the loaded object to the scene
        scene.add(obj)
        console.log(obj)
    },

    // Function called when download progresses
    function ( xhr ) {
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
    },

    // Function called when download errors
    function ( xhr ) {
        console.error( 'An error happened' );
    }
);

render();

