let status = (config) => {
  let context = {};
  context.gid = config.gid || 'all';

  return {
    'get': function(configuration, callback) {
      callback = callback || function() {};

      let payload = [configuration];
      let remote = {
        service: 'status',
        method: 'get',
      };

      distribution[context.gid].comm.send(payload, remote, (e, v) => {
        if (configuration === 'heapTotal' || configuration === 'heapUsed') {
          // add up all the values for these configs, then callback
          let keys = Object.keys(v);
          let total = 0;
          for (let i = 0; i < keys.length; i++) {
            total += v[keys[i]];
          }
          callback(e, total);
        } else {
          callback(e, v);
        }
      });
    },
    'stop': function(callback) {
      callback = callback || function() {};

      let payload = [];
      let remote = {
        service: 'status',
        method: 'stop',
      };

      distribution[context.gid].comm.send(payload, remote, (e, v) =>
        callback(e, v));
    },
    'spawn': function(configuration, callback) {
      callback = callback || function() {};

      distribution.local.status.spawn(configuration, (err, value) => {
        if (err) {
          callback(err, null);
          return;
        }

        distribution.local.groups.add(context.gid, configuration, (e, v) => {
          distribution[context.gid].groups.add(context.gid, configuration,
              (e, v) => {
                callback(null, value);
              });
        });
      });
    },
  };
};


module.exports = status;
