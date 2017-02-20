# iceberg
hybrid tilt-based mobile game

## layout
weird for now

### server
e.g. handle player input && do actual gameplay logic

### player
e.g. files that are run on the player side of things

### observer/renderer
not sure if wise to split server/observer but maybe not.

## how to
```
cd server/nodejs
npm install
node index.js
```

action:
 - open browser: `localhost:8080/render`
 - open phone: `your-ip:8080/player`
