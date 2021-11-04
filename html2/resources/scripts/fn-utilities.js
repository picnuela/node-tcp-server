
/** 
 * Utilities Functions
 * @returns {FnUtil}    
 */
function FnUtil() {
  return this;
}
/** 
 * Extends arguments.<br>Last have more priority.
 * @returns {Object}
 */
FnUtil.prototype.extends = function () {
  let fn = this;
  let resp = arguments[0];
  if (!fn.isObject(resp)) resp = {};
  for (let i1 = 1; i1 < arguments.length; i1++) {
    let arg1 = arguments[i1];
    if (fn.isObject(arg1)) {
      for (let k in arg1) resp[k] = arg1[k];
    } else if (fn.isArray(arg1)) {
      for (let i2 = 0; i2 < arg1.length; i2++) {
        let arg2 = arg1[i2];
        if (fn.isObject(arg2)) {
          for (let k in arg2) resp[k] = arg2[k];
        }
      }
    }
  }
  return resp;
};
/** 
 * Checks if Object is instance of String
 * @param {type} obj Object to evaluate.
 * @returns {Boolean} true if argument is instance of String 
 */
FnUtil.prototype.isString = function (obj) {
  return obj ? typeof (obj) === 'string' : false;
};
/** 
 * Checks if Object is instance of Number
 * @param {type} obj Object to evaluate.
 * @returns {Boolean} true if argument is instance of Number 
 */
FnUtil.prototype.isNumber = function (obj) {
  return obj ? ((typeof (obj) === 'number' && !isNaN(obj)) || obj === 0) : false;
};
/** Checks if Object is instance of Array
 * @param {type} obj Object to evaluate.
 * @returns {Boolean} true if argument is instance of Array  */
FnUtil.prototype.isArray = function (obj) {
  return obj ? typeof (obj.push) === 'function' : false;
};
/** Checks if Object is instance of Date
 * @param {type} obj Object to evaluate.
 * @returns {Boolean} true if argument is instance of Date    */
FnUtil.prototype.isDate = function (obj) {
  return obj ? typeof (obj.getTime) === 'function' : false;
};
/** Checks if Object is instance of Function
 * @param {type} obj Object to evaluate.
 * @returns {Boolean} true if argument is instance of Function */
FnUtil.prototype.isFunction = function (obj) {
  return obj ? typeof (obj) === 'function' : false;
};
/** Checks if Object is instance of Object
 * @param {type} obj Object to evaluate.
 * @returns {Boolean} true if argument is instance of Object */
FnUtil.prototype.isObject = function (obj) {
  return ((obj) &&
    (typeof (obj.toString) === 'function') &&
    (obj.toString() === '[object Object]'));
};
/** Checks if Object is instance of JSON
 * @param {type} obj Object to evaluate.
 * @returns {Boolean} true if argument is instance of JSON  */
FnUtil.prototype.isJSON = function (obj) {
  return ((obj) &&
    (typeof (obj.toString) === 'function') &&
    (obj.toString() === '[object Object]'));
};
/** 
 * Gets the object length.
 * @param {Array|Object} obj
 * @returns {Number} The Object lenght (-1 if null).          
 */
FnUtil.prototype.lengthOf = function (obj) {
  let len = -1;
  if (obj) {
    let tpe = typeof (obj);
    if (tpe === 'string') return obj.length;
    if (tpe === 'object') {
      if (obj.length) return obj.length;
      len = 0;
      for (let v0 in obj) len++;
    }
  }
  return len;
};
/** 
 * Checks if Object if empty
 * @param {type} obj
 * @returns {Boolean} true if empty
 */
FnUtil.prototype.isEmpty = function (obj) {
  return lengthOf(obj) <= 0;
};
/**
 * Check if Object is Null or Undefined.
 * @param {type} obj Objecto to evaluate
 * @returns {Boolean}
 */
FnUtil.prototype.isNull = function (obj) {
  return ((obj === null) || (obj === undefined));
};
/** 
 * Parse argument to Boolean 
 * @param {type} obj Objecto to evaluate
 * @returns {Boolean} 
 */
FnUtil.prototype.asBool = function (obj) {
  let fn = this;
  if (obj) {
    let t = fn.trim(obj).toLowerCase();
    switch (t) {
      case 'true':
      case '1':
      case 'yes':
      case 'si':
        return true;
    }
  }
  return false;
};
/** Parse argument to String.
 * @returns {String}                    */
FnUtil.prototype.asString = function () {
  let fn = this;
  let arg = arguments[0];
  if (!arg) return "";
  if (fn.isString(arg)) return arg;
  if (fn.isJSON(arg)) {
    try {
      arg = JSON.stringify(arg);
      return arg;
    } catch (e) {
      arg = e;
    }
  }
  return (typeof (arg.toString) === 'function')
    ? arg.toString() : "" + arg;
};
/** Parse argument to String.
 * @returns {String}                    */
FnUtil.prototype.trim = function () {
  let fn = this;
  let txt = fn.asString(arguments[0]);
  let i0 = 0;
  let z0 = txt.length;
  while (z0 > 0) {
    if (txt.charAt(z0 - 1) > ' ') break;
    z0 -= 1;
  }
  while (i0 < z0) {
    if (txt.charAt(i0) > ' ') break;
    i0 += 1;
  }
  let rsp = txt.substring(i0, z0);
  return rsp;
};
/** Parse To Number. 
 * @returns {Number}  */
FnUtil.prototype.asNumber = function () {
  let arg = 0;
  if (arguments[0] !== undefined) {
    arg = parseFloat(arguments[0]);
    if (isNaN(arg)) arg = 0;
  }
  return arg;
};
/** 
 * Parse to JSON Object
 * @param {type} obj
 * @returns {Object}                   
 */
FnUtil.prototype.parseToJSon = function (obj) {
  let fn = this;
  let response;
  if (obj) {
    if (!fn.isObject(obj)) {
      obj = fn.trim(obj);
      try {
        response = JSON.parse(obj);
      } catch (e) {
        console.log(e.toString());
      }
    } else response = obj;
  }
  if (!response) response = {};
  return response;
};
/** 
 * From a Object get its key names as Array
 * @param {Object} obj
 * @returns {Array}     
 */
FnUtil.prototype.parseToArray = function (obj) {
  let list = [];
  if (typeof (obj) === 'object') {
    for (let a in obj) {
      list.push(a);
    }
  }
  return list;
};
/** 
 * Gets the last Path.<br>
 * The text after last '/' character into path string.
 * @param {String} path
 * @returns {String} 
 */
FnUtil.prototype.lastPath = function (path) {
  let fn = this;
  let r = "";
  if (fn.isString(path) && path.length > 0) {
    let q = path.split("/");
    r = q[q.length - 1];
  }
  return r;
};
/** 
 * Checks if WebSocket is available for Browser.
 * @returns {Boolean}   
 */
FnUtil.prototype.isWebServiceAvailable = function () {
  try {
    return (('WebSocket' in window) || ('MozWebSocket' in window));
  } catch (e) {
  }
  return false;
};
/** 
 * Numero con ancho fijo.
 * @param {String|Number} value
 * @param {Number} size
 * @returns {String} 
 */
FnUtil.prototype.fixLength = function (value, size) {
  let fn = this;
  let cfill = fn.isNumber(value);
  let ctext = fn.asString(value);
  cfill = (cfill || (value == 0)) ? '0' : ' ';
  while (ctext.length < size) ctext = cfill + ctext;
  return ctext;
};
/** 
 * Gets Current TimeStamp as String.
 * @returns {String} 
 */
FnUtil.prototype.timeStamp = function () {
  let fn = this;
  let dt = arguments.length > 0
    ? arguments[0]
    : new Date();
  return fn.dateString(dt, 'H:m:s.S');
};
/**
 * Gets Date as String
 * @returns {String}  
 */
FnUtil.prototype.dateString = function () {
  let fn = this;
  let fmt, dt;
  if (fn.isDate(arguments[0])) {
    dt = arguments[0];
    fmt = fn.asString(arguments[1]);
  } else if (fn.isNumber(arguments[0])) {
    dt = new Date(arguments[0]);
    fmt = fn.asString(arguments[1]);
  } else if (arguments.length > 1) {
    dt = new Date(arguments[0]);
    fmt = fn.asString(arguments[1]);
  } else {
    dt = new Date();
    fmt = fn.asString(arguments[0]);
  }
  if (!dt) dt = new Date();
  if (!fmt || fmt.length === 0) fmt = "d/M/y H:m:s";
  let txt = "";
  let ix = 0;
  while (ix < fmt.length) {
    let c0 = fmt.charAt(ix++);
    let cp = false;
    switch (c0) {
      case 'd':
        txt += fn.fixLength(dt.getDate(), 2);
        cp = true;
        break;
      case 'M':
        txt += fn.fixLength(dt.getMonth() + 1, 2);
        cp = true;
        break;
      case 'y':
        txt += fn.fixLength(dt.getFullYear(), 2);
        cp = true;
        break;
      case 'h':
      case 'H':
        txt += fn.fixLength(dt.getHours(), 2);
        cp = true;
        break;
      case 'm':
        txt += fn.fixLength(dt.getMinutes(), 2);
        cp = true;
        break;
      case 's':
        txt += fn.fixLength(dt.getSeconds(), 2);
        cp = true;
        break;
      case 'S':
        txt += fn.fixLength(dt.getMilliseconds(), 3);
        cp = true;
        break;
      default:
        txt += c0;
        break;
    }
    if (cp) {
      while (ix < fmt.length) {
        if (fmt.charAt(ix) === c0) {
          ix++;
        } else break;
      }
    }
  }
  return txt;
};
/** 
 * Remove Index from Array
 * @param {Array} a
 * @param {Number} x
 * @returns {Array}     
 */
FnUtil.prototype.removeIndex = function (a, x) {
  let fn = this;
  if (fn.isArray(a)) {
    let b = [];
    for (let j = 0; j < a.length; j++) {
      if (j !== x) b.push(a[j]);
    }
    a = b;
  }
  return a;
};
/** 
 * Gets current time in milliseconds.
 * @returns {Number}   
 */
FnUtil.prototype.millis = function () {
  return new Date().getTime();
};
/** 
 * Gets TimeStamp Text to be sufixed at
 * clientId when specified. 
 * @returns {String}   
 */
FnUtil.prototype.addTimeStamp = function () {
  let fn = this;
  let tm = new Date().getTime();
  tm = (tm % 86400000);
  tm = fn.fixLength(tm, 8);
  return tm;
};
/** Gets Arguments from s String Array.<br>
 *  Used to capture application input arguments
 * @param {Array} args
 * @returns {Object} */
FnUtil.prototype.getArguments = function (args) {
  let list = {};
  for (let k in args) {
    k = args[k];
    if (k.charAt(0) === '-') {
      k = k.substr(1);
      k = k.split('=');
      k[0] = k[0].trim().toLowerCase();
      if (k[0].length > 0) {
        if (k.length < 2) k[1] = "true";
        k[1] = k[1].trim();
        list[k[0]] = k[1];
      }
    }
  }
  return list;
};
/** 
 * Iterate into Map to get specified key
 * @returns {String} 
 */
FnUtil.prototype.getKey = function () {
  let fn = this;
  let val;
  let m = arguments[0];
  let klist = arguments[1].split(",");
  for (let k in klist) {
    k = fn.trim(klist[k]);
    if (m[k] !== undefined) {
      val = m[k];
      break;
    }
  }
  return val;
};

/** 
 * Contains Base64 functions.
 * @returns {Base64} 
 */
function Base64() {
  return this;
}
/** 
 * Parse ByteArray to String.
 * @param {Array} bytes
 * @returns {String} 
 */
Base64.prototype.byteToString = function (bytes) {
  let text = "";
  for (let ix = 0; ix < bytes.length; ix++) {
    let c0 = bytes[ix] & 255;
    if (c0 > 0) {
      text += String.fromCharCode(c0);
    } else break;
  }
  return text;
};
/**
 * Internal function into base64 decode function
 * @param {Number} c 
 * @returns {Number}
 */
Base64.prototype.tableValue = function (c) {
  if ((c >= 'A') && (c <= 'Z')) return (c - 'A');
  if ((c >= 'a') && (c <= 'z')) return (c - 'a') + 26;
  if ((c >= '0') && (c <= '9')) return (c - '0') + 52;
  if ((c == '+') || (c == '-')) return 62;
  if ((c == '/') || (c == '_')) return 63;
  return -1;
}
/** Decode Base64 String to ByteArray.
 * @param {String} text
 * @returns {Array} */
Base64.prototype.decodeToByte = function (text) {
  let b64 = this;
  let bytes = [];
  text = Fn.asString(text);
  let ix, c0, r0, r1, v0;
  ix = 0;
  while (ix < text.length) {
    r0 = 0;
    v0 = 0;
    while ((r0 < 4) && (ix < text.length)) {
      c0 = text.charAt(ix++);
      if (c0 <= ' ') continue;
      c0 = b64.tableValue(c0);
      if (c0 != -1) {
        v0 = (v0 << 6) | c0;
      } else break;
      r0++;
    }
    r1 = r0;
    while (r1 < 4) {
      v0 = (v0 << 6);
      r1++;
    }
    r1 = 1;
    while (r1 < r0) {
      c0 = (v0 >> 16) & 255;
      v0 = (v0 << 8);
      bytes.push(c0);
    }
    if (r0 !== 4) break;
  }
  return bytes;
};
/** 
 * Parse to clear String from a Base64 String.
 * @param {String} text Base64 String.
 * @returns {String}  
 */
Base64.prototype.decodeToString = function (text) {
  let base64 = this;
  let bytes = base64.decodeToByte(text);
  return base64.byteToString(bytes);
};

/** 
 * Global Utilities Function
 * @type {FnUtil}     
 */
const Fn = new FnUtil();
