# iceberg
tilt-based mobile game over webrtc.

### server (nodejs)
set up player registration to handle webrtc signaling.

### player (browser)
client side code (input), connects to observer via webrtc.

 - register on _server_ (unique player id)
 - connect via webrtc to _observer_ (join actual game)
 - deliver sampled inputs to _observer_

### observer (browser)
game logic, renderer, accepts webrtc connections

 - register on _server_
 - accept webrtc connections
  - each connection corresponds to a new player

## how to
```
cd server/nodejs
npm install
node index.js
```

 - open browser: `localhost:8080/render`
 - scan qr code or browse to: `server-addr:8080/player`
