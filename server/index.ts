const express = require('express');
const morgan = require('morgan');
const logger = require('./utils/logger');
const peer = require('peer');
import { Candidate, Room, RoomFactory } from './room';
const argv = require('yargs')
  .usage('Usage: $0 <Directory> [-p port]')
  .help('help')
  .alias('h', 'help')
  .option('<Directory>', {
    describe: 'Directory to export, default \'dist\'',
    demand: false
  })
  .option('port', {
    alias: 'p',
    describe: 'listen port, default 9000',
    demand: false
  })
  .version(false)
  .example('node $0 -p 8080')
  .argv;

argv._ = String(argv._).trim();
const staticPath = argv._ ? argv._ : __dirname + '/../dist';
const port = argv.p ? argv.p : 9000;

const app = express();
app.use(morgan('dev'));
app.use(express.static(staticPath));

const roomfactory = new RoomFactory();
app.locals.roomfactory = roomfactory;


const server = app.listen(port, () => {
  console.log(
    `Listening at ${port}. Access http://localhost:${port}.`
  );
});

// /joinroom/?room=XXXX&candi=xxxx
app.get('/joinroom', (req, res) => {
  const roomId = req.query.room;
  const candiId = req.query.candi;
  const room = roomfactory.addRoomByid(roomId);
  const candi = room.joinRoom(candiId);

  const otherCandis = room.getOtherCandi(candiId);
  console.log(`${roomId} / ${candiId} other ${otherCandis.length} candidata.` + JSON.stringify(otherCandis));
  res.send(JSON.stringify(otherCandis));
});

// /leaveroom/?room=XXXX&candi=xxxx&from=xxxx
app.get('/leaveroom', (req, res) => {
  const roomId = req.query.room;
  const candiId = req.query.candi;
  const fromId = req.query.from;
  let errString = '';

  const room = roomfactory.findRoom(roomId);
  if (room) {
    const candi = room.getCandidate(candiId);
    if ( !candi ) {
      errString = `Candidate '${candiId}' do not exist in room '${roomId}'.`;
    }

    const fromCandi = room.getCandidate(fromId);
    if ( !fromCandi ) {
      errString = `From andidate '${fromId}' do not exist in room '${roomId}'.`;
    }

    if ( candi && fromCandi ) {
      room.leaveRoom(candiId);

      res.send(`'${candiId}' leave success.`);
      return;
    }
  }

  console.log(errString);
  res.status(404).send(errString);
});

const peerserver = peer.ExpressPeerServer(server, {debug: true});
app.use('/peerjs', peerserver);

/*
peerserver.on('connection', (client) => {
  logger.info('client connect. client: ', JSON.stringify(client));
});

peerserver.on('disconnect', (client) => {
  logger.info('client disconnect. client: ', JSON.stringify(client));
});
*/

// app.get('/', function(req, res, next) { res.send('Hello world!'); });
