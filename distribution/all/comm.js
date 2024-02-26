const localComm = require('../local/comm');
const id = require('../util/id');

let comm = (config) => {
  let context = {};
  context.gid = config.gid || 'all';

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
      let localIndex = keys.indexOf(id.getSID(global.nodeConfig));
      if (localIndex > -1) {
        let temp = keys[localIndex];
        keys[localIndex] = keys[keys.length - 1];
        keys[keys.length - 1] = temp;
      }

      for (let i = 0; i < keys.length; i++) {
        let node = group[keys[i]];

        const commCallback = (err, value) => {
          console.log('test callback??')
          err ? errorMap[id.getSID(node)] = err :
                valueMap[id.getSID(node)] = value;
        };

        let newRemote = remote;
        newRemote.node = node;

        localComm.send(payload, newRemote, commCallback);
      }

      callback(errorMap, valueMap);
    },
  };
};


module.exports = comm;
