const express = require('express');
const morgan = require('morgan');
const logger = require('./utils/logger');
const peer = require('./peerserver/src');
const cors = require('cors');
import { Candidate, Room, RoomFactory } from './room';
const argv = require('yargs')
  .usage('Usage: $0 <Directory>')
  .help('help')
  .alias('h', 'help')
  .option('<Directory>', {
    describe: 'Directory to export, default \'dist\'',
    demand: false
  })
  .version(false)
  .example('ts-node $0 -p 8080')
  .argv;

argv._ = String(argv._).trim();
const staticPath = argv._ ? argv._ : __dirname + '/../dist';
const port = 9000;

const app = express();
app.use(morgan('dev'));
app.use(express.static(staticPath));
app.use(cors());

const roomfactory = new RoomFactory();
app.locals.roomfactory = roomfactory;


const server = app.listen(port, () => {
  console.log(
    `Listening at ${port} for serve websocket.`
  );
});

const http80 = require('http');
http80.createServer(app).listen(80, () => {
  console.log('Listening at 80 for serve web page.');
});

/* /joinroom/?room=XXXX&candi=xxxx
  return all of other candidatas.
*/
app.get('/joinroom', (req, res) => {
  const roomId = req.query.room;
  const candiId = req.query.candi;
  const room: Room = roomfactory.addRoomByid(roomId, candiId);

  const otherCandis = room.getOtherCandi(candiId);
  console.log(`${roomId} / ${candiId} other ${otherCandis.length} candidata.` + JSON.stringify(otherCandis));
  res.send(JSON.stringify(otherCandis));
});

const peerserver = peer.ExpressPeerServer(server, {debug: true});
app.use('/', peerserver);

peerserver.on('connection', client => {
  logger.info(`client connected : ${client.getId()}`);
});

peerserver.on('disconnect', client => {
  const candiId = client.getId();
  roomfactory.leaveRoomByid(candiId);
  logger.info(`client disconnected : ${client.getId()}`);
});
