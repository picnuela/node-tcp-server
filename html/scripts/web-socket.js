/* 
 * WebSocker Driver
 */

/* global argument, Fn, ArrayBuffer, WebSocket, Buffer */

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
  /** <b>FrameReceptor</b> Frame complete call back.
   * @type {Function} */
  this.oncomplete;

  Fn.extends(this, options);
  return this;
}

(function () {

  /** <b>FrameReceptor</b> parse received Data.
   * @param {Object/Buffer/String} data
   * @returns {String} */
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

  /** <b>FrameReceptor</b> Clear Frame.
   * @returns {FrameReceptor} */
  FrameReceptor.prototype.clear = function () {
    let frame = this;
    frame.onFrame = false;
    frame.proof = 0;
    frame.rxString = '';
    frame.lastRead = Fn.millis();
    return frame;
  };

  /** <b>FrameReceptor</b> Launch message call back. 
   * @returns {FrameReceptor} */
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

  /** <b>FrameReceptor</b> Load data and checks frame.
   * @param {Object/Buffer/String} data
   * @returns {FrameReceptor} */
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
})();

/** WebSocket Driver
 * @param {Object} options
 * @returns {WSocket}   */
function WSocket(options) {
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
  /** <b>WSocket</b><br>Assigned Address
   * @type {String}     */
  this.address = "";
  /** <b>WSocket</b><br>WebSocket Connector
   * @type {WebSocket}  */
  this.wsocket;
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
  Fn.extends(this, options);

  /** <b>WSocket</b><br>Frame Receptor
   * @type {FrameReceptor}  */
  this.wreceptor = new FrameReceptor({
    parent: this,
    oncomplete: function (data, _socket) {
      return socketReception(_socket, data);
    }
  });
  return this;
}

(function () {
  /** <b>WSocket</b> Open Connection
   * @param {Object} options
   * @returns {WSocket}     */
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
        ws.wreceptor.receive(event.data);
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

  /** <b>WSocket</b> Send Data<br>
   * @param {Object/String} data
   * @returns {WSocket} */
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
      }
    }
    return ws;
  };

  /** <b>WSocket</b> Close Connection
   * @param {Object/String} reason
   * @returns {WSocket} */
  WSocket.prototype.close = function (reason) {
    let ws = this;
    if (ws.wsocket) {
      ws.send(reason);
      try {
        ws.wsocket.close();
      } catch (e) {
      }
      ws.wsocket = undefined;
      ws.iostate = 0;
      clearInterval(ws.timerId);
      console.log(ws.address, "closed by request");
      if (Fn.isFunction(ws.onclose)) {
        ws.onclose();
      }
    }
    return ws;
  };
})();

/** Send connection Message
 * @param {WSocket} ws
 * @param {Object} data
 * @returns {Boolean} */
function connectMessage(ws, data) {
  let tpe, nme, ta;
  tpe = Fn.getKey(ws, 'type,device_type,device-type,device.type');
  nme = Fn.getKey(ws, 'name,clientId,client_id,client-id,client.id,device_id,device-id,,device.id');
  ta = Fn.asNumber(ws.keepAlive);
  ws.send({
    'action': 'connect',
    'id': (nme.length > 0 ? nme : 'web.page') + '::' + Fn.addTimeStamp(),
    'type': tpe.length > 0 ? tpe : 'web.page',
    'keepAlive': ta,
    'topics': ws.topics
  });
  return true;
}

/** Connection was Accepted
 * @param {WSocket} ws
 * @returns {Boolean} */
function connectionAccepted(ws) {
  ws.iostate = 2;
  ws.timerId = setInterval(function() {
    let ta, tm, t0, t1;
    ta = Fn.asNumber(ws.keepAlive);
    if (ta > 2) {
      tm = Fn.millis();
      t0 = tm - ws.lastWrite;
      t1 = ta * 350;
      if (t0 > t1) {
        ws.lastWrite = tm;
        ws.send("~\r\n");
      }
      //.......................................
      tm = Fn.millis();
      t0 = tm - ws.lastRead;
      t1 = ta * 1250;
      if (t0 > t1) {
        ws.lastRead = tm;
        if (Fn.isFunction(ws.onerror)) {
          ws.onerror("Server timeout", ws);
        }
        ws.close({
          'action': 'disconnect',
          'message': 'Server timeout'
        });
      }
    }
  }, 250);
  if (Fn.isFunction(ws.onopen)) {
    ws.onopen(ws);
  }
  return true;
}

/** Reception Event
 * @param {WSocket} ws
 * @param {Object} data
 * @returns {Boolean}   */
function socketReception(ws, data) {
  if (!data || !ws) return false;
  switch (data.action) {
    case "@open":
      ws.address = data.ip;
      return connectMessage(ws, data);
      
    case "conack":
      ws.iostate = 2;
      return connectionAccepted(ws);
      
    case "disconnect":
      ws.close();
      return true;
  }
  if (Fn.isFunction(ws.onmessage)) {
    ws.onmessage(data, ws);
  }
  return true;
}
