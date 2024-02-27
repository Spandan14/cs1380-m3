const id = require('../util/id');
const wire = require('../util/wire');
const util = require('../util/util');
const spawn = require('child_process').spawn;
const path = require('path');

const status = {};

global.moreStatus = {
  sid: id.getSID(global.nodeConfig),
  nid: id.getNID(global.nodeConfig),
  counts: 0,
};

status.get = function(configuration, callback) {
  callback = callback || function() {};

  if (configuration in global.nodeConfig) {
    callback(null, global.nodeConfig[configuration]);
  } else if (configuration in moreStatus) {
    callback(null, moreStatus[configuration]);
  } else if (configuration === 'heapTotal') {
    callback(null, process.memoryUsage().heapTotal);
  } else if (configuration === 'heapUsed') {
    callback(null, process.memoryUsage().heapUsed);
  } else {
    callback(new Error('Status key not found'));
  }
};

status.stop = function(callback) {
  callback = callback || function() {};

  // global.localServer.close(() => {
  //   callback(null, 'Stopping server...');
  //   setTimeout(process.exit, 100); // exit 100ms after calling callback
  // });

  callback(null, 'Stopping server...');
  process.exit();
};

status.spawn = function(configuration, callback) {
  callback = callback || function() {};

  // 1. create RPC from callback
  let callbackRPC = wire.createRPC(util.wire.toAsync(callback));
  if (configuration.onStart) {
    let funcString = `
      let onStart = ${configuration.onStart.toString()};
      let callbackRPC = ${callbackRPC.toString()};
      onStart();
      callbackRPC(null, global.nodeConfig, () => {});
    `;
    configuration.onStart = new Function(funcString);
  } else {
    configuration.onStart = callbackRPC;
  }

  // 2. spawn
  let cwd = path.join(__dirname, '../../distribution.js');
  let distributionScript = 'node';
  let args = ['--config', util.serialize(configuration)];

  // console.log('Spawning new node with command:', spawnCommand);
  const child = spawn(distributionScript, [cwd, ...args]);

  child.on('error', (err) => {
    console.log('ERROR spawning new node:', err);
    process.exit(-1);
  });

  child.stdout.on('data', (data) => {
    console.log(`Child process stdout: ${data}`);
  });
};

module.exports = status;
