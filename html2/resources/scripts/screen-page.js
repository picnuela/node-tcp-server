
/* global Fn, Wn */

/**
 * Device Reception
 * @param {WSocket} wsocket
 * @param {Object} data
 */
function deviceReception(wsocket, data) {
  let request = data;
  request = Wn.getData(request);
  if (!request) return;
  switch (request.action) {
    case 'suback':
      break;
      
    case 'device.status':
      wsocket.publish(wsocket.topics[0], {
        'device_id': Wn.getDeviceId(wsocket),
        'device_type': Wn.getDeviceType(wsocket),
        'connection_id': wsocket.name,
        'ip': wsocket.address,
        status: 1
        
      });
      break;
      
    case 'screen.load.page':
      let h0 = document.getElementById('div_iframe');
      h0[0].src = request.data;
      break;
  }
}

function pageResize() {
  
}

function pageInit(settings) {
 
  var acounter = 0;
  
  settings = Fn.extends({
    /**
     * @param {Object} data
     * @param {WSocket} wsocket
     */
    onmessage: function(data, wsocket) {
      deviceReception(wsocket, data);
    },
    /**
     * @param {WSocket} wsocket
     */
    onopen: function(wsocket) {
      let h0, h1;
      h0 = `<label>${wsocket.address}</label>`;
      h0 += `<span>${wsocket.connectionId}</span>`;
      h1 = document.getElementById('div_cnx_address');
      if (h1) h1.innerHTML = h0;
    },
    /**
     * @param {WSocket} wsocket
     */
    onclose: function (wsocket) {
      let h1 = document.getElementById('div_cnx_address');
      h1.innerHTML = '<label>disconnect</label>';
      h1 = document.getElementById('div_cnx_status');
      h1.innerHTML = '<label></label>';
      
      setTimeout(function() {
        webSocket.open();
      }, 1000);
    },
    /**
     * @param {Object} err
     * @param {WSocket} wsocket
     */
    onerror: function (err, wsocket) {
      
    },
    onalive: function() {
      const atext=['|', '/', '-', '\\', '|', '/', '-', '\\'];
      acounter = (acounter + 1) & 7;
      let c0 = atext[acounter];
      let h1 = document.getElementById('div_cnx_status');
      if (h1) h1.innerHTML = `<label>&nbsp;[&nbsp;${c0}&nbsp;]&nbsp;</label>`;
    }
    
  }, settings);
  webSocket = new WSocket(settings);
  setTimeout(function() {
    console.log("Starting websocket");
    webSocket.open();
  }, 500);
}

/**
 * WebSocket Connection
 * @type WSocket
 */
var webSocket;
