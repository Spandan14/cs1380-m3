// const distribution = require('../../distribution');
const id = require('../util/id');
// const allGossip = require('../all/gossip');

let groups = {};

global.groupMapping = {};

groups.get = function(groupName, callback) {
  callback = callback || function() {};

  if (groupName in global.groupMapping) {
    callback(null, global.groupMapping[groupName]);
  } else {
    callback(Error('group not found, groups.get', null));
  }
};

groups.put = function(groupName, group, callback) {
  callback = callback || function() {};

  if (groupName in global.groupMapping) {
    callback(Error('group already exists', null));
    return;
  }

  global.groupMapping[groupName] = group;
  if (!('all' in global.groupMapping)) {
    global.groupMapping['all'] = {};
  }

  for (const [sid, node] of Object.entries(group)) {
    global.groupMapping['all'][sid] = node;
  }
  // add services
  distribution[groupName] = {};
  distribution[groupName].comm = require('../all/comm')({gid: groupName});
  distribution[groupName].groups = require('../all/groups')({gid: groupName});
  distribution[groupName].status = require('../all/status')({gid: groupName});
  distribution[groupName].routes = require('../all/routes')({gid: groupName});
  distribution[groupName].gossip = require('../all/gossip')({gid: groupName});

  callback(null, global.groupMapping[groupName]);
};

groups.del = function(groupName, callback) {
  callback = callback || function() {};

  if (groupName in global.groupMapping) {
    let group = global.groupMapping[groupName];
    delete global.groupMapping[groupName];
    delete distribution[groupName];
    callback(null, group);
  } else {
    callback(Error('group not found, groups.del', null));
  }
};

groups.add = function(groupName, node, callback) {
  callback = callback || function() {};

  if (groupName in global.groupMapping) {
    global.groupMapping[groupName][id.getSID(node)] = node;
    callback(null, 'node added');
  } else {
    callback(Error('group not found, groups.add', null));
  }
};

groups.rem = function(groupName, sid, callback) {
  callback = callback || function() {};

  if (groupName in global.groupMapping) {
    delete global.groupMapping[groupName][sid];
    if (!global.groupMapping[groupName]) {
      global.groupMapping[groupName] = {};
    }
    callback(null, 'node removed');
  } else {
    callback(Error('group not found, groups.rem', null));
  }
};

module.exports = groups;
