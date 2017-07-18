var socket = new WebSocket('ws://' + window.location.hostname + ':3000')
var is_connected = false

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
var players = []
function getPlayerObject(id) {
    var cube = id2cube[id]
    if (!cube) {
        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        cube = new THREE.Mesh( geometry, material );
        scene.add( cube );
        id2cube[id] = cube
    }
    return cube
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

    if (data.req === 'update') {
        var obj = getPlayerObject(data.player)

        var pos = data.position
        obj.position.x = pos[0]
        obj.position.y = 1
        obj.position.z = -pos[1]
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

