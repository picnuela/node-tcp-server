
const Fn = require('./node_modules/utilities/fn-utilities').Fn;
const Tp = require('./node_modules/topics/topic_common').Tp;
var TopicPath = require('./node_modules/topics/topic_path').TopicPath;
var TopicDriver = require('./node_modules/topics/topic_driver').TopicDriver;
var IOStream = require('./node_modules/iostreams/iostream').IOStream;

/**
 * Topic Driver with basic commands.
 */
class TopicDriver207 extends TopicDriver {
  /**
   * Command request from device
   * @param {IOStream} device The sensder
   * @param {Object} request  The request 
   */
  deviceCommand(device, request) {
    let driver = this;
    switch (request.action) {
      case 'send':
      case 'client.send':
        cmmdSendToDevice(driver, device, request);
        break;

      case 'client.close':
        cmmdCloseDevice(driver, device, request);
        break;

      case 'clients':
      case 'client.list':
        cmmdClientList(driver, device, request);
        break;

      case 'sockets':
      case 'socket.list':
        cmmdSocketList(driver, device, request);
        break;

      case 'topics':
      case 'topic.list':
        cmmdTopicList(driver, device, request);
        break;

      case 'server.close.request':
        cmmdServerClose(driver, device, request);
        break;
    }
    return driver;
  }
}
/**
 * Command Close Server Request
 * @param {TopicDriver} driver  The Driver
 * @param {IOStream} device     Who send the request
 * @param {Object} request      Received Request 
 */
function cmmdServerClose(driver, device, request) {
  if (driver.localServer) {
    driver.localServer.close();
  }
}
/**
 * Command get Devices List
 * @param {TopicDriver} driver  The Driver
 * @param {IOStream} device     Who send the request
 * @param {Object} request      Received Request 
 */
function cmmdSocketList(driver, device, request) {
  let tlist = driver.localServer
    ? Fn.parseToArray(driver.localServer.children)
    : []
  tlist.sort();
  device.send({
    'action': 'socket.list',
    'clients': tlist
  });
  return driver;
}
/**
 * Command get Devices List
 * @param {TopicDriver} driver  The Driver
 * @param {IOStream} device     Who send the request
 * @param {Object} request      Received Request 
 */
function cmmdClientList(driver, device, request) {
  let tlist = Fn.parseToArray(driver.devices);
  tlist.sort();
  device.send({
    'action': 'client.list',
    'clients': tlist
  });
  return driver;
}
/**
 * Command get Topic List
 * @param {TopicDriver} driver  The Driver
 * @param {IOStream} device     Who send the request
 * @param {Object} request      Received Request 
 */
function cmmdTopicList(driver, device, request) {
  let tlist = Fn.parseToArray(driver.topics);
  tlist.sort();
  device.send({
    'action': 'topic.list',
    'topics': tlist
  });
  return driver;
}
/**
 * Command Send message to specific Device
 * @param {TopicDriver} driver  The Driver
 * @param {IOStream} device     Who send the request
 * @param {Object} request      Received Request 
 */
function cmmdSendToDevice(driver, device, request) {
  let message = Tp.getRequestData(request);
  /** @type {TopicPath} */
  let topic = driver.getTopic(request);
  /** @type {IOStream} */
  let remote = driver.getDevice(request);
  if (remote) {
    if (topic) {
      /** @type {TopicDevice} */
      let topicDevice = Tp.deviceGetTopic(remote, topic.name);
      let tname = topicDevice
        ? topicDevice.getName()
        : topic.name
      remote.send({
        'action': 'publish',
        'topic': tname,
        'data': message
      });
    } else {
      if (Fn.isString(message)) message += "\r\n";
      remote.send(message);
    }
    driver.sendToMonitor(device, {
      'action': 'publish',
      'id': device.getName(),
      'ip': device.getAddress(),
      'to': remote.getName(),
      'data': message
    });
    return driver;
  }
  if (topic) {
    topic.distribute(device, message);
    driver.sendToMonitor(device, {
      'action': 'publish',
      'id': device.getName(),
      'ip': device.getAddress(),
      'data': message
    });
    return driver;
  }
  device.send({
    'action': 'command.error',
    'message': 'Bad arguments'
  });
}
/**
 * Command Close an Specific Device Request 
 * @param {TopicDriver} driver  The Driver
 * @param {IOStream} device     Who send the request
 * @param {Object} request      Received Request 
 */
function cmmdCloseDevice(driver, device, request) {
  /** @type {IOStream} */
  let remote = driver.getDevice(request);
  if (remote) {
    driver.removeDevice(remote);
    remote.close({
      'action': 'disconnect',
      'reason': KIO.closed_by_request,
      'message': 'Closed by request'
    });
    return driver;
  }
  device.send({
    'action': 'command.error',
    'message': 'Bad arguments'
  });
  return driver;
}

module.exports = {
  TopicDriver207
}
