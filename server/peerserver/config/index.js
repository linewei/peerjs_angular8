module.exports = {
  port: 9000,
  expire_timeout: 5000,
  alive_timeout: 600000,
  key: 'peerjs',
  path: '/peerjs',
  concurrent_limit: 5000,
  allow_discovery: false,
  proxied: false,
  cleanup_out_msgs: 1000,
  ssl: {
    key: '',
    cert: ''
  }
};
