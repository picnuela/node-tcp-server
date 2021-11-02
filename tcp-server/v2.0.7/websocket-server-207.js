
var fs = require('fs');
const Tp = require('./node_modules/iostreams/iocommon').Tp;
const Fn = require('./node_modules/utilities/fn-utilities').Fn;
const IOCOMMON = require('./node_modules/iostreams/iocommon');
const KIO = IOCOMMON.KIO;

var IOStream = require('./node_modules/iostreams/iostream').IOStream;
var IOBridge = require('./node_modules/iostreams/iobridge').IOBridge;
var TCPSocket = require('./node_modules/iostreams/tcp_socket').TCPSocket;
var IOWebServer = require('./node_modules/iostreams/ws_server').IOWebServer;
/**
 * WebSocket Server.<br>Connection with Web Pages
 * @type {IOWebServer}
 */
 var localServer;
 /**
  * Connection with Remote TCP Server.<br>
  * Control from Server.
  * @type {IOStream}
  */
 var controlSocket;
 /**
  * Control to keep connection open.
  */
 var reopen = {
   counter: 0,
   timeId: 0
 };
/** 
 * Application Arguments
 */
var args = process.argv.slice(2);
args = Fn.getArguments(args);
if (args.config) {
  fs.readFile(args.config, 'utf8', (err, data) => {
    if (err) {
      console.log(Fn.timeStamp(), "Config File Error:", err);
    }
    if (data) {
      args = Fn.parseToJSon(data);
      if (args && args.local && args.remote) {
        console.log(Fn.timeStamp(), "Starting Websoket Server:", args);
        //---------------------------------------------------
        // LAUNCH Application
        reopen.timeId = setInterval(function () {
          if (!controlSocket ||
            controlSocket.isClosed()) {
            if (reopen.counter < 1) {
              reopen.counter = 5;
              createRemoteControl();
            }
            reopen.counter -= 1;
          }
        }, 1000);
        return true;
      }
    }
    console.log(Fn.timeStamp(), "Config File Error:", "Bad arguments");
    console.log(Fn.timeStamp(), "Application ends");
    return false;
  });
} else {
  console.log(Fn.timeStamp(), "Config File Error:", "Bad arguments");
  console.log(Fn.timeStamp(), "Application ends");
}

/**
 * Remote Control Reception Event.
 * @param {IOStream} device Who sends the request
 * @param {*} request Recived request
 */
function controlReception(device, request) {
  if (!request) return;
  switch (request.action) {
    case "conack":
      device.setIOState(KIO.attached);
      break;

    case "disconnect":
      device.close();
      break;

    case "bridge.closed":
      break;

    case "publish":
      break;

    case "suback":
      break;

    case "unsuback":
      break;
  }
}
/**
 * Create a bridge into Web Page and Remote Control.
 * @param {IOStream} device The new WebSocket 
 * @returns {IOStream}
 */
function createBridge(device) {
  /** @type {IOStream} */
  let bridge;
  if (controlSocket && controlSocket.isOpen()) {
    bridge = new IOBridge({
      address: device.address,
      bridge: device,
      parent: controlSocket,
      stream: controlSocket,
      /**
       * @param {IOStream} tdevice 
       * @param {Number} state 
       */
      onchange: function (tdevice, state) {
        switch (state) {
          case KIO.connected:
            console.log(Fn.timeStamp(), "BR-BIND", tdevice.getAddress());
            break;

          case KIO.closed:
            console.log(Fn.timeStamp(), "BR-CLOSED", tdevice.getAddress());
            break;
        }
      },
      /**
       * @param {Object} data 
       * @param {IOStream} tdevice 
       */
      ondata: function (data, tdevice) {
        let ping = false;
        if (Fn.isString(data)) {
          let cdata = Fn.textDecode(data);
          ping = ((cdata.charAt(0)) == '~' && (cdata.length < 4));
        }
        if (!ping) {
          console.log(
            Fn.timeStamp(),
            "BR-DATA",
            tdevice.getName(),
            tdevice.getAddress(),
            data);
        }
        /** @type {IOStream} */
        let bridge = tdevice.bridge;
        if (bridge) {
          bridge.send(data);
        }
      },
      /**
       * @param {Object} err
       * @param {IOStream} tdevice 
       */
      onerror: function (err, tdevice) {
        console.log(Fn.timeStamp(), "BR-ERROR", tdevice.getName(), tdevice.getAddress(), err);
      },
      /**
       * @param {IOStream} tdevice 
       */
      onAliveResponse: function (tdevice) {
        /** @type {IOStream} */
        let tbridge = tdevice.bridge;
        if (tbridge) tbridge.send("~\r\n");
      }
    });
    bridge.open();
  }
  return bridge;
}
/**
 * Close the bridge into Web Page and Remote Control.
 * @param {IOStream} device The new WebSocket 
 */
function closeBridge(device) {
  /** @type {IOStream} */
  let bridge = device.bridge;
  if (bridge) {
    bridge.close();
  }
}
/**
 * Creates the WebSocket Server.<br>
 * Listen Web Pages and bridge with Remote Control
 */
function createWebServer() {
  let options = Fn.extends({
    /**
    * @param {IOWebServer} tserver 
    * @param {Number} state 
    */
    onchange: function (tserver, state) {
      switch (state) {
        case KIO.connected:
          console.log(Fn.timeStamp(), "WSERVER-CONNECTED", tserver.getAddress());
          break;
        case KIO.closed:
          console.log(Fn.timeStamp(), "WSERVER-CLOSED", tserver.getAddress());
          if (controlSocket && controlSocket.isAttached()) {
            setTimeout(function () {
              createWebServer();
            }, 1000);
          }
          break;
      }
    },
    /**
     * @param {Object} err 
     * @param {IOWebServer} tserver 
     */
    onerror: function (err, tserver) {
      console.log(Fn.timeStamp(), "WSERVER-ERROR", tserver.getAddress(), err);
    },
    clientListener: {
      /**
       * @param {IOStream} tdevice 
       * @param {Number} state 
       */
      onchange: function (tdevice, state) {
        switch (state) {
          case KIO.connected:
            console.log(Fn.timeStamp(), "WS-BIND", tdevice.getAddress());
            tdevice.bridge = createBridge(tdevice);
            break;

          case KIO.closed:
            console.log(Fn.timeStamp(), "WS-CLOSED", tdevice.getAddress());
            closeBridge(tdevice);
            break;
        }
      },
      /**
       * @param {Object} data 
       * @param {IOStream} tdevice 
       */
      ondata: function (data, tdevice) {
        console.log(Fn.timeStamp(), "WS-DATA", tdevice.getName(), tdevice.getAddress(), data);
        /** @type {IOStream} */
        let bridge = tdevice.bridge;
        if (bridge) {
          bridge.send(data);
        }
      },
      /**
       * @param {Object} err
       * @param {IOStream} tdevice 
       */
      onerror: function (err, tdevice) {
        console.log(Fn.timeStamp(), "WS-ERROR", tdevice.getName(), tdevice.getAddress(), err);
      },
      /**
       * @param {IOStream} device 
       */
      onAliveResponse: function (device) {
        /** @type {IOStream} */
        let bridge = device.bridge;
        if (bridge) bridge.send("~\r\n");
      }
    }
  }, args.local);
  //..........................................
  localServer = new IOWebServer(options);
  localServer.listen(args.local);
}

function createRemoteControl() {
  let options = Fn.extends({
    "name": "remote",
    /**
     * 
     * @param {IOStream} tdevice 
     * @param {Number} state 
     */
    onchange: function (tdevice, state) {
      switch (state) {
        case KIO.connected:
          reopen.counter = 0;
          console.log(Fn.timeStamp(), "CONTROL-BIND", tdevice.getAddress());
          tdevice.send(Fn.extends({
            'action': 'connect'
          }, args.remote));
          break;

        case KIO.attached:
          console.log(Fn.timeStamp(), "CONTROL-ATTACHED", tdevice.getName(), tdevice.getAddress());
          if (!localServer || !localServer.isOpen()) {
            createWebServer();
          }
          break;

        case KIO.closed:
          console.log(Fn.timeStamp(), "CONTROL-CLOSED", tdevice.getAddress());
          if (localServer) {
            localServer.close();
          }
          break;
      }
    },
    /**
     * @param {Object} data 
     * @param {IOStream} tdevice 
     */
    ondata: function (data, tdevice) {
      console.log(Fn.timeStamp(), "CONTROL-DATA", tdevice.getAddress(), data);
      controlReception(tdevice, data);
    },
    /**
     * @param {Object} err
     * @param {IOStream} tdevice 
     */
    onerror: function (err, tdevice) {
      console.log(Fn.timeStamp(), "CONTROL-ERR", tdevice.getAddress(), err);
    }
  }, args.remote);
  //.......................................................
  controlSocket = new TCPSocket(options);
  controlSocket.open(args.remote);
}
