const distribution = require('../../distribution');

let groups = (config) => {
  let context = {};
  context.gid = config.gid || 'all';

  return {
    'get': function(groupName, callback) {
      callback = callback || function() {};

      let payload = [groupName];
      let remote = {
        service: 'groups',
        method: 'get',
      };

      distribution[context.gid].comm.send(payload, remote, (e, v) =>
        callback(e, v));
    },
    'put': function(groupName, nodes, callback) {
      callback = callback || function() {};

      global.groupMapping[groupName] = nodes;

      distribution[context.gid] = {};
      distribution[context.gid].comm = require('../all/comm')({gid: groupName});
      distribution[context.gid].groups =
        require('../all/groups')({gid: groupName});
      distribution[context.gid].status =
        require('../all/status')({gid: groupName});
      distribution[context.gid].routes =
        require('../all/routes')({gid: groupName});

      let payload = [groupName, nodes];
      let remote = {
        service: 'groups',
        method: 'put',
      };

      // WARN: this will return an error on current node, but we MUST
      // call put() locally first so that we can use this syntax
      distribution[context.gid].comm.send(payload, remote, (e, v) =>
        callback(e, v));
    },
    'del': function(groupName, callback) {
      callback = callback || function() {};

      let payload = [groupName];
      let remote = {
        service: 'groups',
        method: 'del',
      };

      // WARN: may not work, but lets try
      distribution[context.gid].comm.send(payload, remote, (e, v) =>
        callback(e, v));
    },
    'add': function(groupName, node, callback) {
      // WARN: adding to a group randomly will not just work,
      // this group would have to be PUT on the added node,
      // and then the node would have to be added to the group,
      // and then a parity check would have to be made
      callback = callback || function() {};

      let payload = [groupName, node];
      let remote = {
        service: 'groups',
        method: 'add',
      };

      distribution[context.gid].comm.send(payload, remote, (e, v) =>
        callback(e, v));
    },
    'rem': function(groupName, sid, callback) {
      callback = callback || function() {};

      let payload = [groupName, sid];
      let remote = {
        service: 'groups',
        method: 'rem',
      };

      distribution[context.gid].comm.send(payload, remote, (e, v) =>
        callback(e, v));
    },
  };
};

module.exports = groups;
