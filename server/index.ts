const peer = require('./peerserver/src');
import { logger } from './utils/logger';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';
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
const staticPath = path.resolve(argv._ ? argv._ : __dirname + '/..');
logger.info(`export directory : ${staticPath}`);

const app = express();
app.use(morgan('dev'));
app.use('/video', express.static(staticPath));
app.use(cors());

const roomfactory = new RoomFactory();
app.locals.roomfactory = roomfactory;

const options = {
  pfx: fs.readFileSync(path.resolve(__dirname + '/ssl/csslcloud.net.pfx')),
  passphrase: 'dreamwindows'
};

const httpWeb = require('https');
httpWeb.createServer(options, app).listen(443, () => {
  logger.info('Listening at 443 for serve web page.');
});

const httpSocket = require('https');
const server = httpSocket.createServer(options, app).listen(9000, () => {
  logger.info(`Listening at 9000 for serve websocket.`);
});

app.get('/video/:classid', (req, res, next) => {
  const indexFile = path.resolve(staticPath + '/index.html');
  res.sendFile(indexFile);
});


/* /joinroom/?room=XXXX&candi=xxxx
  return all of other candidatas.
*/
app.get('/joinroom', (req, res) => {
  const roomId = req.query.room;
  const candiId = req.query.candi;
  const room: Room = roomfactory.addRoomByid(roomId, candiId);

  const otherCandis = room.getOtherCandi(candiId);
  logger.info(`roomid: ${roomId}, candiId: ${candiId}`);
  logger.info(`other candidates in room ${roomId},${otherCandis.length} candidatas:` + JSON.stringify(otherCandis));
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
