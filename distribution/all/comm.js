// const localComm = require('../local/comm');
// const id = require('../util/id');

let comm = (config) => {
  let context = {};
  context.gid = config.gid || 'all';
  const util = global.distribution.util;

  return {
    'send': function(payload, remote, callback) {
      callback = callback || function() {};

      // if ('node' in remote) {
      //   callback(Error('node already supplied', payload));
      //   return;
      // }

      let group = global.groupMapping[context.gid];

      let errorMap = {};
      let valueMap = {};

      let keys = Object.keys(group);

      // do swap so that we call on ourselves at the very end
      let localIndex = keys.indexOf(util.id.getSID(global.nodeConfig));
      if (localIndex > -1) {
        let temp = keys[localIndex];
        keys[localIndex] = keys[keys.length - 1];
        keys[keys.length - 1] = temp;
      }

      for (let i = 0; i < keys.length; i++) {
        let node = group[keys[i]];
        let nodeID = util.id.getSID(node);

        const commCallback = (err, value) => {
          if (err) {
            errorMap[nodeID] = err;
          } else {
            valueMap[nodeID] = value;
          }
        };

        let newRemote = remote;
        newRemote.node = node;

        global.distribution.local.comm.send(payload, newRemote, console.log);
      }

      callback(errorMap, valueMap);
    },
  };
};


module.exports = comm;
