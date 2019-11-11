const express = require('express');
const process = require('process');
const morgan = require('morgan');
const logger = require('./utils/logger');
const peer = require('peer');
const argv = require('yargs')
  .usage('Usage: $0 <Directory> [-p port]')
  .help('help')
  .alias('h', 'help')
  .option('<Directory>',{
    describe: 'Directory to export, default \'dist\'',
    demand: false
  })
  .option('port',{
    alias: 'p',
    describe: 'listen port, default 9000',
    demand: false
  })
  .version(false)
  .example('node $0 -p 8080')
  .argv;

argv._ = String(argv._).trim();
let staticPath = argv._ ? argv._ : __dirname + '/../dist';
let port = argv.p ? argv.p : 9000;

let app = express();
app.use(morgan('dev'));
app.use(express.static(staticPath));


const server = app.listen(port, () => {
  console.log(
    `Listening at ${port}. Access http://localhost:${port}.`
  );
});

const peerserver = peer.ExpressPeerServer(server, {debug: true});
app.use('/peerjs', peerserver);

//app.get('/', function(req, res, next) { res.send('Hello world!'); });
