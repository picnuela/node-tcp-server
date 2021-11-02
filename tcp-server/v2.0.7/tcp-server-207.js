
var Tp = require('./node_modules/topics/topic_common').Tp;
const Fn = require('./node_modules/utilities/fn-utilities').Fn;
const IOCOMMON = require('./node_modules/iostreams/iocommon');
const KIO = IOCOMMON.KIO;

var IOStream = require('./node_modules/iostreams/iostream').IOStream;
var IOServer = require('./node_modules/iostreams/ioserver').IOServer;
var TcpServer = require('./node_modules/iostreams/tcp_server').TcpServer;
var TopicDriver = require('./node_modules/topics/topic_driver').TopicDriver;
var TopicDriver207 = require('./topic-driver-207').TopicDriver207;

/**
 * @type {IOServer}
 */
var tcpServer;

/**
 * @type {TopicDriver}
 */
var topicDriver;

/** Input Arguments   */
var args = Fn.getArguments(process.argv.slice(2));
args.host = "iot.home.com";
args.port = 1887;

console.log(Fn.timeStamp(), 'TCP Server 2021-11-01');
console.log(Fn.timeStamp(), 'Arguments:', { host: args.host, port: args.port });

if (args.host && args.port) {
  console.log(Fn.timeStamp(), 'Application starts');
  createTCPServer();

} else {
  console.log(Fn.timeStamp(), 'Bad arguments');
  console.log(Fn.timeStamp(), 'Application ends');
}

function createTCPServer() {
  let options = Fn.extends({
    /**
     * @param {IOServer} tserver 
     * @param {Number} state 
     */
    'onchange':
      function (tserver, state) {
        switch (state) {
          case KIO.connected:
            console.log(Fn.timeStamp(), "SERVER-OPEN", tserver.getAddress());
            break;

          case KIO.closed:
            console.log(Fn.timeStamp(), "SERVER-CLOSED", tserver.getAddress());
            setTimeout(function () {
              createTCPServer();
            }, 1000);
            break;
        }
      },
    /**
     * @param {Object} err 
     * @param {IOServer} tserver 
     */
    'onerror':
      function (err, tserver) {
        console.log(Fn.timeStamp(), "SERVER-ERROR", tserver.getAddress(), err);
      },
    'clientListener': {
      /**
       * Client Connection Changed
       * @param {IOStream} scket The Client Connection
       * @param {Number} state   Connection State 
       */
      'onchange': function (scket, state) {
        switch (state) {
          case KIO.connected:
            console.log(Fn.timeStamp(), "SC-BIND", scket.getAddress());
            topicDriver.sendToMonitor(scket, {
              'action': 'client.bind',
              'ip': scket.getAddress()
            });
            break;

          case KIO.attached:
            console.log(Fn.timeStamp(), "SC-ATTACH", scket.getName(), scket.getAddress());
            topicDriver.sendToMonitor(scket, {
              'action': 'client.attached',
              'device_id': scket.getName(),
              'device_type': scket.type,
              'ip': scket.getAddress()
            });
            break;

          case KIO.closed:
            topicDriver.removeDevice(scket);
            console.log(Fn.timeStamp(), "SC-CLOSE", scket.getName(), scket.getAddress());
            topicDriver.sendToMonitor(scket, {
              'action': 'client.closed',
              'ip': scket.getAddress()
            });
            break;
        }
      },
      /**
       * Client Data Reception Event.
       * @param {Object} data     Data Received
       * @param {IOStream} scket  The Sender
       */
      'ondata': function (data, scket) {
        console.log(Fn.timeStamp(), "SC-DATA", scket.getName(), scket.getAddress(), data);
        topicDriver.deviceReception(scket, data);
      },
      /**
       * Client Error Event.
       * @param {Object} data Data Received
       * @param {IOStream} scket The Sender
       */
      'onerror': function (err, scket) {
        console.log(Fn.timeStamp(), "SC-ERROR", scket.getName(), scket.getAddress(), err);
      }
    }
  }, args);
  //...............................................
  tcpServer = new TcpServer(options);
  topicDriver = new TopicDriver207({
    'localServer': tcpServer
  });
  //...............................................
  tcpServer.listen(args);
}
