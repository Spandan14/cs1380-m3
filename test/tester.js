#!/usr/bin/env node

const distribution = require('../distribution');
const id = require('../distribution/util/id');
const n1 = {
  ip: '127.0.0.1',
  port: 9011,
  onStart: () => {
    console.log('started');
  },
};
let remote;
distribution.node.start((server) => {
  console.log('base server started');
  distribution.local.status.spawn(n1, (e, v) => {
    console.log(e, v);
    console.log(`spawned node ${n1.ip}:${n1.port}`);
  });

  setTimeout(() => {
    remote = {node: n1, service: 'status', method: 'get'};
    distribution.local.comm.send(['nid'], remote, (e, v) => {
      console.log('n1', id.getNID(n1));
      remote = {node: n1, service: 'status', method: 'stop'};
      distribution.local.comm.send([], remote, (e, v) => {
        console.log(e, v);
        console.log('stopped');
        server.close();
      });
    });
  }, 3000);

  // remote = {node: n1, service: 'status', method: 'get'};
  // distribution.local.comm.send(['nid'], remote, (e, v) => {
  //   console.log('n1', id.getNID(n1));
  //   remote = {node: n1, service: 'status', method: 'stop'};
  //   distribution.local.comm.send([], remote, (e, v) => {
  //     console.log(e, v);
  //     console.log('stopped');
  //     server.close();
  //   });
  // });
});

