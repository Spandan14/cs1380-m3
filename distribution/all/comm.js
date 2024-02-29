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

      let nodes = [];
      for (let i = 0; i < keys.length; i++) {
        let node = group[keys[i]];
        nodes.push(node);
      }

      let i = 0;
      const loopingCaller = (err, value) => {
        let node = nodes[i]; // get old node to assign from
        let key = util.id.getSID(node);
        if (err) {
          console.log('ERROR', err, key, node);
          errorMap[key] = err;
        }
        if (value) {
          valueMap[key] = value;
        }

        i++; // move onto next node
        if (i >= nodes.length) {
          callback(errorMap, valueMap);
          return; // we're done
        }
        node = nodes[i];
        let newRemote = remote;
        newRemote.node = node;

        global.distribution.local.comm.send(payload, newRemote, loopingCaller);
      };

      let node = nodes[i];
      let newRemote = remote;
      newRemote.node = node;
      global.distribution.local.comm.send(payload, newRemote, loopingCaller);
    },
  };
};


module.exports = comm;
