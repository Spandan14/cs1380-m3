let gossip = (config) => {
  let context = {};
  context.gid = config.gid || 'all';
  context.subset = config.subset || function(lst) {
    return Math.min(lst.length, 3);
  };

  let util = distribution.util;

  return {
    'send': function(payload, remote, callback, timestamp) {
      callback = callback || function() {};
      timestamp = timestamp || Date.now();

      // first locally handle the gossip
      let group = global.groupMapping[context.gid];

      // select a subset of the nodes
      let keys = Object.keys(group);
      let numNodes = context.subset(keys);

      let nodes = [];
      // randomly pick nodes from group
      for (let i = 0; i < numNodes; i++) {
        let randomIndex = Math.floor(Math.random() * keys.length);
        let node = group[keys[randomIndex]];

        while (nodes.includes(node)) {
          randomIndex = Math.floor(Math.random() * keys.length);
          node = group[keys[randomIndex]];
        }

        nodes.push(node);
      }

      let errorMap = {};
      let valueMap = {};

      // do the actual sending here
      let i = 0;
      const loopingGossiper = (err, value) => {
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
        let gossipRemote = {service: 'gossip', method: 'recv', node: node};
        let gossipPayload = [payload, remote, timestamp, context.gid];

        global.distribution.local.comm.send(gossipPayload, gossipRemote,
            loopingGossiper);
      };

      let node = nodes[i];
      let gossipRemote = {service: 'gossip', method: 'recv', node: node};
      let gossipPayload = [payload, remote, timestamp, context.gid];

      global.distribution.local.comm.send(gossipPayload, gossipRemote,
          loopingGossiper);
    },
    'at': function(delay, method, callback) {
      callback = callback || function() {};

      // run method every delay milliseconds
      let intervalID = setInterval(method, delay);
      callback(null, intervalID);
    },
    'del': function(intervalID, callback) {
      callback = callback || function() {};

      clearInterval(intervalID);
      callback(null, intervalID);
    },
  };
};

module.exports = gossip;
