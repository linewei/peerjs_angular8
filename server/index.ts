const express = require('express');
const morgan = require('morgan');
const logger = require('./utils/logger');
const peer = require('./peerserver/src');
const cors = require('cors');
const fs = require('fs');
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
  .example('ts-node $0')
  .argv;

argv._ = String(argv._).trim();
const staticPath = argv._ ? argv._ : __dirname + '/../dist';

const app = express();
app.use(morgan('dev'));
app.use(express.static(staticPath));
app.use(cors());

const roomfactory = new RoomFactory();
app.locals.roomfactory = roomfactory;

const options = {
	pfx: fs.readFileSync('./ssl/csslcloud.net.pfx'),
	passphrase: 'dreamwindows'
};

const httpWeb = require('https');
httpWeb.createServer(options, app).listen(443, () => {
  console.log('Listening at 443 for serve web page.');
});

const httpSocket = require('https');
const server = httpSocket.createServer(options, app).listen(9000, () => {
  console.log(`Listening at 9000 for serve websocket.`);
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
