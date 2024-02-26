let routes = (config) => {
  return {
    'put': function(route, name, callback) {
      callback = callback || function() {};

      let payload = [route, name];
      let remote = {
        service: 'routes',
        method: 'put',
      };

      distribution[context.gid].comm.send(payload, remote, (e, v) =>
        callback(e, v));
    },
  };
};

module.exports = routes;
