let gossip = {};

global.gossipMessages = new Map();

gossip.recv = function(payload, remote, timestamp, groupGID, callback) {
  console.log('Gossip received', payload, remote, timestamp, groupGID);

  if (global.gossipMessages.has(timestamp)) {
    // don't call the callback
    // callback(Error('duplicate message'), null);
    return;
  }

  global.gossipMessages.set(timestamp, {
    payload: payload,
    remote: remote,
    timestamp: timestamp,
  });

  if (remote.node) {
    console.log('Error: remote.node is already set', remote);
    callback(Error('remote.node is already set'), null);
    return;
  }

  let error = undefined;
  let value = undefined;
  // locally process first
  distribution.local[remote.service][remote.method](...payload, (e, v) => {
    error = e;
    value = v;
    callback(error, value); // will we return from this?

    // gossip it over
    console.log('Starting gossip from node ', global.nodeConfig);
    distribution[groupGID].gossip.send(payload, remote, timestamp, (e, v) => {
      console.log('Gossiping done from node ', global.nodeConfig);
    });
  });
};

module.exports = gossip;
