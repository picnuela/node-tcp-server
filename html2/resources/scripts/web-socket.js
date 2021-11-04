/* 
 * WebSocker Driver
 */

/* global argument, Fn, ArrayBuffer, WebSocket, Buffer */

/** IO States Enumeration     */
const KIO = {
  /** IO closed inicial state */
  closed: 0,
  /** IO connected            */
  connected: 1,
  /** IO attached to Remote   */
  attached: 2,
  /** IO connecting           */
  connecting: 3,
  /** IO closing              */
  closing: 4,
  /** IO close lock           */
  close_lock: 5,
  /** IO ERROR Server ShutDown      */
  'server_shutdown': 200,
  /** IO ERROR Server Timeout       */
  'server_timeout': 201,
  /** IO ERROR Socket Timeout       */
  'socket_timeout': 202,
  /** IO ERROR Previous Name exists */
  'name_exist': 203,
  /** IO ERROR Closed by request    */
  'closed_by_request': 204,
  /** IO ERROR Bad Protocol         */
  'bad_protocol': 205,
  /** IO ERROR Socket is closed     */
  'socket_closed': 206,
  /** Map Key to denote bridged Address */
  bridgedIPKey: '@ip',
  /** Map Key to denote bridged Data    */
  bridgedDataKey: '@data'
};

function WsUtil() {
  return this;
}
/**
 * Gets DeviceId field from specified request
 * @param {Object} request 
 * @returns {String}
 */
WsUtil.prototype.getDeviceId = function (request) {
  let nme = "";
  if (!request) return nme;
  if (Fn.isString(request)) {
    nme = request;
  } else {
    let nkey = 'id,name,clientId,client_id,client-id,client.id' +
      'deviceId,device_id,device-id,device.id';
    nme = Fn.getKey(request, nkey);
  }
  nme = Fn.trim(nme);
  nme = nme.toLowerCase();
  return nme;
};
/**
 * Gets DeviceType field from specified request
 * @param {Object} request 
 * @returns {String}
 */
WsUtil.prototype.getDeviceType = function (request) {
  let nme = "";
  if (!request) return nme;
  if (Fn.isString(request)) {
    nme = request;
  } else {
    let nkey = 'type,device_type,device-type,device.type';
    nme = Fn.getKey(request, nkey);
  }
  nme = Fn.trim(nme);
  nme = nme.toLowerCase();
  return nme;
};
/**
 * Gets KeepAlive field from specified request
 * @param {Object} request 
 * @returns {Number}
 */
WsUtil.prototype.getKeepAlive = function (request) {
  let nme = "";
  if (!request) return 0;
  if (Fn.isString(request)) {
    nme = request;
  } else {
    let nkey = 'keepAlive,keepalive,alive';
    nme = Fn.getKey(request, nkey);
  }
  nme = Fn.trim(nme);
  let ta = Fn.asNumber(nme);
  if (ta < 0) ta = 0;
  if (ta > 3600) ta = 3600;
  return ta;
};
/**
 * Gets UserName field from specified request
 * @param {Object} request 
 * @returns {String}
 */
WsUtil.prototype.getUserName = function (request) {
  let nme = "";
  if (!request) return nme;
  if (Fn.isString(request)) {
    nme = request;
  } else {
    let nkey = 'user,userName,username,user-name,user.name' +
      'group,groupName,group_name,group.name';
    nme = Fn.getKey(request, nkey);
  }
  nme = Fn.trim(nme);
  nme = nme.toLowerCase();
  return nme;
};
/**
 * Gets TopicName field from specified request
 * @param {Object} request 
 * @returns {String}
 */
WsUtil.prototype.getTopicName = function (request) {
  let nme = "";
  if (!request) return nme;
  if (Fn.isString(request)) {
    nme = request;
  } else {
    let nkey = 'topic,name,topicName,topicname';
    nme = Fn.getKey(request, nkey);
  }
  nme = Fn.trim(nme);
  nme = nme.toLowerCase();
  return nme;
};
/**
 * Gets Data field from specified request
 * @param {Object} request
 * @returns {Object}
 */
WsUtil.prototype.getData = function(request) {
  let fn = this;
  while (request && request.action === 'publish') {
    request = fn.getKey(request,'data,payload');
  }
  return request;
};

/**
 * Utilities to WsSocket
 */
const Wn = new WsUtil();

/** Frame Receptor.
 * @param {Object} options
 * @returns {FrameReceptor} */
function FrameReceptor(options) {
  /** <b>FrameReceptor</b> Who wraps me.
   * @type {WSocket} */
  this.parent;
  /** <b>FrameReceptor</b> Reception Buffer.
   * @type {String} */
  this.rxString = "";
  /** <b>FrameReceptor</b> Bracket counter.
   * @type {Number} */
  this.proof = 0;
  /** <b>FrameReceptor</b> Last Character received
   * @type {String} */
  this.lastChar = ' ';
  /** <b>FrameReceptor</b> Reception Flag.
   * @type {Boolean} */
  this.onFrame = false;
  /** <b>FrameReceptor</b> Reception timestamp.
   * @type {Number} */
  this.lastRead = Fn.millis();
  /** <b>FrameReceptor</b> Reception timestamp.
   * @type {Number} */
  this.interval = 2500;
  /** <b>FrameReceptor</b> Frame complete call back.
   * @type {Function} */
  this.oncomplete;

  Fn.extends(this, options);
  return this;
}
/** 
 * <b>FrameReceptor</b> parse received Data.
 * @param {Object/Buffer/String} data
 * @returns {String} 
 */
FrameReceptor.prototype.parseData = function (data) {
  let text = "";
  if (data instanceof ArrayBuffer) {
    let b0 = new Uint8Array(data);
    for (let c0 in b0) {
      text += String.fromCharCode(b0[c0]);
    }
    return text;
  }
  text = Fn.asString(data);
  return text;
};
/** 
 * <b>FrameReceptor</b> Clear Frame.
 * @returns {FrameReceptor} 
 */
FrameReceptor.prototype.clear = function () {
  let frame = this;
  frame.onFrame = false;
  frame.proof = 0;
  frame.rxString = '';
  frame.lastRead = Fn.millis();
  return frame;
};
/** 
 * <b>FrameReceptor</b> Launch message call back. 
 * @returns {FrameReceptor} 
 */
FrameReceptor.prototype.launch = function () {
  let frame = this;
  frame.onFrame = false;
  let data = arguments.length > 0
    ? arguments[0]
    : frame.rxString;

  console.log(Fn.timeStamp(), "WS-RX", data);
  if (Fn.isFunction(frame.oncomplete)) {
    frame.oncomplete(data, frame.parent);
  }
  return true;
};
/** 
 * <b>FrameReceptor</b> Load data and checks frame.
 * @param {Object/Buffer/String} data
 * @returns {FrameReceptor} 
 */
FrameReceptor.prototype.receive = function (data) {
  let frame = this;
  data = frame.parseData(data);
  for (let k in data) {
    let c0, c1;
    c0 = data[k];
    c1 = frame.lastChar;
    frame.lastChar = c0;
    if (!frame.onFrame) {
      if (c0 <= ' ') continue;
    }
    frame.rxString += c0;
    frame.lastRead = Fn.millis();
    frame.onFrame = true;
    switch (c0) {
      case '{':
        if (frame.proof === 0) {
          frame.rxString = c0;
        }
        frame.proof += 1;
        break;

      case '}':
        if (frame.proof < 1) break;
        frame.proof -= 1;
        if (frame.proof === 0) {
          let json = Fn.parseToJSon(frame.rxString);
          frame.launch(json);
          frame.clear();
        }
        break;

      case '\r':
        if (frame.proof > 0) break;
        if (c1 === '~') {
          frame.clear();
          let ws = frame.parent;
          if (Fn.isFunction(ws.onalive)) {
            ws.onalive(ws);
          }
        }
        break;

      case '\n':
        if (frame.proof > 0) break;
        if (c1 === '\r') {
          let text = Fn.trim(frame.rxString);
          if (text.length > 0) frame.launch(text);
          frame.clear();
        }
        break;
    }
  }
  return frame;
};

/** 
 * WebSocket Driver
 * @param {Object} options
 * @returns {WSocket}   
 */
function WSocket(options) {
  /** <b>WSocket</b><br>WebSocket Connector
   * @type {WebSocket}  */
  this.wsocket;
  /** <b>WSocket</b><br>Remote Server URL
   * @type {String}     */
  this.url = "ws://iot.home.com:8080";
  /** <b>WSocket</b><br>Connection UNIQUE Identity
   * @type {String}     */
  this.clientId = "";
  /** <b>WSocket</b><br>Adds or no timestamp to connection id.
   * @type {String}     */
  this.addTimestamp = true;
  /** <b>WSocket</b><br>Connection User/Group
   * @type {String}     */
  this.username = "";
  /** <b>WSocket</b><br>Connection Security
   * @type {String}     */
  this.password = "****";
  /** <b>WSocket</b><br>Connection Topic names by default.
   * @type {Array}     */
  this.topics = [];
  /** <b>WSocket</b><br>Assigned Address
   * @type {String}     */
  this.address = "";
  /** <b>WSocket</b><br>Assigned Connection Id
   * @type {String}     */
  this.connectionId = "";
  /** <b>WSocket</b><br>Device type name.
   * @type {String}     */
  this.type = "";
  /** <b>WSocket</b><br>Connection State
   * @type {Number}     */
  this.iostate = 0;
  /** <b>WSocket</b><br>reception timestamp
   * @type {Number}     */
  this.lastRead = Fn.millis();
  /** <b>WSocket</b><br>transmission timestamp
   * @type {Number}     */
  this.lastWrite = Fn.millis();
  /** <b>WSocket</b><br>keep alive time (seconds)
   * @type {Number}     */
  this.keepAlive = 60;
  /** <b>WSocket</b><br>Default protocol
   * @type {String}     */
  this.protocol = "json";
  /** <b>WSocket</b><br>Interval function ID.
   * @type {String}     */
  this.timerId = 0;
  /** <b>WSocket</b><br>Internal Topic objects.
   * @type {Array}     */
  this.wstopics = {};
  /**  <b>WSocket</b><br>Connection Open Listener
   * @type {Function}   */
  this.onopen;
  /**  <b>WSocket</b><br>Connection Close Listener
   * @type {Function}   */
  this.onclose;
  /**  <b>WSocket</b><br>Connection Reception Listener
   * @type {Function}   */
  this.onmessage;
  /**  <b>WSocket</b><br>Connection Error Listener
   * @type {Function}   */
  this.onerror;
  Fn.extends(this, options);

  /** <b>WSocket</b><br>Frame Receptor
   * @type {FrameReceptor}  */
  this.receptor = new FrameReceptor({
    parent: this,
    /**
     * @param {Object} data
     * @param {WSocket} wsocket
     * @returns {Boolean}
     */
    oncomplete: function (data, wsocket) {
      if (!data || !wsocket) return false;
      if (!_wsFrameComplete(data, wsocket)) {
        if (Fn.isFunction(wsocket.onmessage)) {
          wsocket.onmessage(data, wsocket);
        }
      }
      return true;
    }
  });
  return this;
}
/**
 * Reception inspection
 * @param {Object} data
 * @param {WSocket} wsocket
 * @returns {Boolean}
 */
function _wsFrameComplete(data, wsocket) {
  switch (data.action) {
    case '@open':
      wsocket.address = Fn.getKey(data, '@ip,ip');
      let uid = Wn.getDeviceId(wsocket);
      uid += "::" + Fn.addTimeStamp();
      wsocket.connectionId = uid;
      wsocket.send({
        'action': 'connect',
        'id': uid,
        'user': Wn.getUserName(wsocket),
        'password': Fn.asString(wsocket.password),
        'type': Wn.getDeviceType(wsocket),
        'keepAlive': Wn.getKeepAlive(wsocket),
        'topics': wsocket.topics
      });
      return true;

    case 'conack':
      wsocket.iostate = 2;
      if (Fn.isFunction(wsocket.onopen)) {
        wsocket.onopen(wsocket);
      }
      if (wsocket.timerId !== 0) return true;
      wsocket.timerId = setInterval(function () {
        let ta, tm, t0, t1;
        ta = 10;// Wn.getKeepAlive(wsocket);
        if (ta > 1) {
          tm = Fn.millis();
          t0 = tm - wsocket.lastWrite;
          t1 = ta * 350;
          if (t0 > t1) {
            wsocket.lastWrite = tm;
            wsocket.send("~\r\n");
          }
          tm = Fn.millis();
          t0 = tm - wsocket.lastRead;
          t1 = ta * 1250;
          if (t0 > t1) {
            wsocket.lastRead = tm;
            wsocket.setError('Server timeout');
            wsocket.close({
              'action': 'disconnect',
              'reason': KIO.server_timeout,
              'message': 'Server timeout'
            });
          }
        }
        if (wsocket.receptor.onFrame) {
          let receptor = wsocket.receptor;
          tm = Fn.millis();
          t0 = tm - receptor.lastRead;
          t1 = receptor.interval;
          if (t0 > t1) {
            receptor.onFrame = false;
            wsocket.setError('Frame timeout');
            let text = receptor.rxString;
            text = Fn.trim(text);
            if (text.length > 0) {
              receptor.launch(text);
            }
            receptor.clear();
          }
        }
      });
      return true;

    case 'disconnect':
      wsocket.close();
      return true;
  }
  return false;
}

/**
 * Informs about some error to application.
 * @returns {WSocket}
 */
WSocket.prototype.setError = function () {
  let ws = this;
  if (Fn.isFunction(ws.onerror)) {
    ws.onerror(arguments[0], ws);
  }
  return ws;
};
/**
 * Publish a message.
 * @param {String} topic    Message URL/Destiny/Theme
 * @param {Object} message  The message
 * @returns {WSocket}
 */
WSocket.prototype.publish = function (topic, message) {
  let ws = this;
  topic = Fn.trim(topic);
  if (topic.length > 1) {
    if (Fn.isNull(message)) message = "";
    ws.send({
      'action': 'publish',
      'topic': topic,
      'data': message
    });
  }
  return ws;
};
/**
 * Subscribe to specified topic
 * @param {String} topic
 * @returns {WSocket}
 */
WSocket.prototype.subscribe = function (topic) {
  let ws = this;
  topic = Fn.trim(topic);
  if (topic.length > 1) {
    ws.send({
      'action': 'subscribe',
      'topic': topic
    });
  }
  return ws;
};
/**
 * Unsubscribe to specified topic
 * @param {String} topic
 * @returns {WSocket}
 */
WSocket.prototype.unsubscribe = function (topic) {
  let ws = this;
  topic = Fn.trim(topic);
  if (topic.length > 1) {
    ws.send({
      'action': 'unsubscribe',
      'topic': topic
    });
  }
  return ws;
};
/** 
 * <b>WSocket</b> Open Connection
 * @param {Object} options
 * @returns {WSocket}     
 */
WSocket.prototype.open = function (options) {
  let ws = this;
  if (options) Fn.extends(ws, options);
  try {
    ws.iostate = 1;
    ws.wsocket = new WebSocket(ws.url);
    ws.wsocket.binaryType = "arraybuffer";
    ws.wsocket.onopen = function () {
      console.log("web socket open event");
    };
    ws.wsocket.onclose = function () {
      ws.wsocket = undefined;
      ws.iostate = 0;
      clearInterval(ws.timerId);
      ws.timerId = 0;
      console.log(ws.address, "closed");
      if (Fn.isFunction(ws.onclose)) {
        ws.onclose(ws);
      }
    };
    ws.wsocket.onerror = function (err) {
      console.log(ws.address, "error", err);
      if (Fn.isFunction(ws.onerror)) {
        ws.onerror(err, ws);
      }
    };
    ws.wsocket.onmessage = function (event) {
      ws.lastRead = Fn.millis();
      ws.receptor.receive(event.data);
    };
  } catch (e) {
    ws.iostate = 0;
    console.log("web socket open error", e);
    if (Fn.isFunction(ws.onerror)) {
      ws.onerror(e, ws);
    }
  }
  return ws;
};
/** 
 * <b>WSocket</b> Send Data<br>
 * The data must to be accord with protocol used.<br>
 * Use <b>.publish</b>(topic, data) to assure the protocol
 * @param {Object/String} data
 * @returns {WSocket} 
 */
WSocket.prototype.send = function (data) {
  let ws = this;
  if (ws.wsocket) {
    let wdata = data;
    if (!wdata) return ws;
    wdata = Fn.asString(wdata);
    try {
      ws.wsocket.send(wdata);
      ws.lastWrite = Fn.millis();
    } catch (e) {
      ws.setError(e);
    }
  }
  return ws;
};
/** 
 * <b>WSocket</b> Close Connection.<br>
 * Usage: <b>.close</b>([{Object/String} reason]);
 * @returns {WSocket} 
 */
WSocket.prototype.close = function () {
  let ws = this;
  let reason = arguments[0];
  if (ws.wsocket) {
    ws.send(reason);
    try {
      ws.wsocket.close();
    } catch (e) {
    }
    ws.wsocket = undefined;
    ws.iostate = 0;
    clearInterval(ws.timerId);
    ws.timerId = 0;
    console.log(ws.address, "closed by request");
    if (Fn.isFunction(ws.onclose)) {
      ws.onclose(ws);
    }
  }
  return ws;
};
