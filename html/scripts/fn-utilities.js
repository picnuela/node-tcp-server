
/** Utilities Functions
 * @returns {FnUtil}    */
function FnUtil() {
  return this;
}

(function () {
  /** Extends arguments. last have more priority.
   * @returns {Object}                          */
  FnUtil.prototype.extends = function () {
    var fn = this;
    var rsp;
    rsp = arguments.length > 0 ? arguments[0] : {};
    for (var i1 = 1; i1 < arguments.length; i1++) {
      var a = arguments[i1];
      if (fn.isArray(a)) {
        for (var i2 = 0; i2 < a.length; i2++) {
          var m = a[i2];
          if (fn.isObject(m)) {
            for (var n in m) {
              rsp[n] = m[n];
            }
          }
        }
      } else if (fn.isObject(a)) {
        for (var n in a) {
          rsp[n] = a[n];
        }
      }
    }
    return rsp;
  };
  /** Checks if Object is instance of String
   * @param {type} obj Object to evaluate.
   * @returns {Boolean} true if argument is instance of String */
  FnUtil.prototype.isString = function (obj) {
    return obj ? typeof (obj) === 'string' : false;
  };
  /**
   * As Key Name equals text in lower case.
   * @param {String|Number} obj
   * @returns {String} */
  FnUtil.prototype.asKeyName = function (obj) {
    return (obj && typeof (obj) === 'string')
      ? obj.trim().toLowerCase()
      : "";
  };
  /**
   * Copy the Object keys.
   * @param {Object} obj
   * @returns {Array} */
  FnUtil.prototype.copyObject = function (obj) {
    var pv = this;
    var ls = [];
    if (pv.isObject(obj)) {
      for (var k in obj)
        ls.push(k);
    }
    return ls;
  };
  /** Checks if Object is instance of Number
   * @param {type} obj Object to evaluate.
   * @returns {Boolean} true if argument is instance of Number */
  FnUtil.prototype.isNumber = function (obj) {
    return obj ? typeof (obj) === 'number' && !isNaN(obj) : false;
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
    return obj ? typeof (obj) === 'object' && !obj.length : false;
  };
  /** Checks if Object is instance of JSON
   * @param {type} obj Object to evaluate.
   * @returns {Boolean} true if argument is instance of JSON  */
  FnUtil.prototype.isJSON = function (obj) {
    return ((obj) &&
      (typeof (obj.toString) === 'function') &&
      (obj.toString() === '[object Object]'));
  };
  /** Gets the object length.
   * @param {Array|Object} obj
   * @returns {Number} The Object lenght (-1 if null).          */
  FnUtil.prototype.lengthOf = function (obj) {
    var len = -1;
    if (obj) {
      var tpe = typeof (obj);
      if (tpe === 'string')
        return obj.length;
      if (tpe === 'object') {
        len = 0;
        for (var v0 in obj)
          len++;
      }
    }
    return len;
  };
  /** Checks if Object if empty
   * @param {type} obj
   * @returns {Boolean} true if empty     */
  FnUtil.prototype.isEmpty = function (obj) {
    return lengthOf(obj) <= 0;
  };
  /**
   * Check if Object is Null or Undefined.
   * @param {type} obj
   * @returns {Boolean}
   */
  FnUtil.prototype.isNull = function (obj) {
    return ((obj === null) ||
      (obj === undefined));
  };
  /** Parse argument to Boolean 
   * @returns {Boolean} */
  FnUtil.prototype.asBool = function () {
    let fn = this;
    let arg = arguments[0];
    if (arg) {
      var t = fn.trim(arg).toLowerCase();
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
    var fn = this;
    var arg = arguments[0];
    if (!arg) return "";
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
    var arg = 0;
    if (arguments[0] !== undefined) {
      arg = parseFloat(arguments[0]);
      if (isNaN(arg))
        arg = 0;
    }
    return arg;
  };
  /** Parse to JSON Object
   * @param {type} obj
   * @returns {Object}                   */
  FnUtil.prototype.parseToJSon = function (obj) {
    var pv = this;
    var response;
    if (obj) {
      if (!pv.isObject(obj)) {
        obj = "" + obj; /* be sure string*/
        try {
          response = JSON.parse(obj);
        } catch (e) {
          console.log(e.toString());
        }
      } else
        response = obj;
    }
    if (!response) response = {};
    return response;
  };
  /** From a Object get its key names as Array
   * @param {Object} obj
   * @returns {Array}     */
  FnUtil.prototype.parseToArray = function (obj) {
    var list = [];
    if (typeof (obj) === 'object') {
      for (var a in obj) {
        list.push(a);
      }
    }
    return list;
  };
  /** Gets the last Path.<br>
   * The text after last '/' character into path string.
   * @param {String} path
   * @returns {String} */
  FnUtil.prototype.lastPath = function (path) {
    var fx = this;
    var r = "";
    if (fx.isString(path) && path.length > 0) {
      var q = path.split("/");
      r = q[q.length - 1];
    }
    return r;
  };
  /** Checks if WebSocket is available for Browser.
   * @returns {Boolean}   */
  FnUtil.prototype.isWebServiceAvailable = function () {
    try {
      if (('WebSocket' in window) || ('MozWebSocket' in window)) {
        return true;
      }
    } catch (e) {
    }
    return false;
  };
  /** Numero con ancho fijo.
   * @param {String|Number} v
   * @param {Number} z
   * @returns {String} */
  FnUtil.prototype.fixLength = function (v, z) {
    let fn = this;
    let nb = fn.isNumber(v);
    let t = fn.asString(v);
    nb = nb ? '0' : ' ';
    while (t.length < z) t = nb + t;
    return t;
  };
  /** Gets Current TimeStamp as String.
   * @returns {String} */
  FnUtil.prototype.timeStamp = function () {
    var fn = this;
    var dt = arguments.length > 0
      ? arguments[0]
      : new Date();
    return fn.dateString(dt, 'H:m:s.S');
  };
  /**
   * Gets Date as String
   * @returns {String}  */
  FnUtil.prototype.dateString = function () {
    var fn = this;
    var fmt, dt;
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
    var txt = "";
    var ix = 0;
    while (ix < fmt.length) {
      var c0 = fmt.charAt(ix++);
      var cp = false;
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
  /** Remove Index from Array
   * @param {Array} a
   * @param {Number} x
   * @returns {Array}     */
  FnUtil.prototype.removeIndex = function (a, x) {
    var fn = this;
    if (fn.isArray(a)) {
      var b = [];
      for (var j = 0; j < a.length; j++) {
        if (j !== x) b.push(a[j]);
      }
      a = b;
    }
    return a;
  };
  /** Gets current time in milliseconds.
   * @returns {Number}   */
  FnUtil.prototype.millis = function () {
    return new Date().getTime();
  };

  /** Gets TimeStamp Text to be sufixed at
   * clientId when specified. 
   * @returns {String}   */
  FnUtil.prototype.addTimeStamp = function () {
    var tm = new Date().getTime();
    tm = (tm % 100000) + 100000;
    return tm.toString();
  };

})();

/** Contains Base64 functions.
 * @returns {Base64} */
function Base64() {
  return this;
}

(function () {
  /** Parse ByteArray to String.
   * @param {Array} bytes
   * @returns {String} */
  Base64.prototype.byteToString = function (bytes) {
    var text = "";
    for (var ix = 0; ix < bytes.length; ix++) {
      var c0 = bytes[ix] & 255;
      if (c0 > 0) {
        text += String.fromCharCode(c0);
      } else break;
    }
    return text;
  };
  /** Decode Base64 String to ByteArray.
   * @param {String} text
   * @returns {Array} */
  Base64.prototype.decodeToByte = function (text) {
    /* Encode Matrix */
    var BASE64_DECODE = [
      0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80,
      0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80,
      0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80,
      0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80,
      0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80,
      0x80, 0x80, 0x80, 0x3e, 0x80, 0x80, 0x80, 0x3f,
      0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x3b,
      0x3c, 0x3d, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80,
      0x80, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06,
      0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e,
      0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16,
      0x17, 0x18, 0x19, 0x80, 0x80, 0x80, 0x80, 0x80,
      0x80, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20,
      0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28,
      0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f, 0x30,
      0x31, 0x32, 0x33, 0x80, 0x80, 0x80, 0x80, 0x80
    ];
    var ix, c0, r0, r1, v0, dne;
    var bytes = [];
    dne = false;
    ix = 0;
    while (!dne && (ix < text.length)) {
      r0 = 0;
      v0 = 0;
      while ((r0 < 4) && (ix < text.length)) {
        c0 = text.charCodeAt(ix++) & 127;
        c0 = BASE64_DECODE[c0];
        if ((c0 & 0x80) === 0) {
          v0 = (v0 << 6) | c0;
        } else {
          dne = true;
          break;
        }
        r0++;
      }
      if (r0 > 1) {
        r1 = r0;
        while (r1 < 4) {
          v0 = (v0 << 6);
          r1++;
        }
        r0 -= 1;
        r1 = 0;
        while ((r1 < 3) && (r0 > 0)) {
          c0 = (v0 >> ((2 - r1) * 8)) & 255;
          bytes.push(c0);
          r1++;
          r0--;
        }
      } else dne = true;
    }
    return bytes;
  };

  /** Parse to clear String from a Base64 String.
   * @param {String} text Base64 String.
   * @returns {String}  */
  Base64.prototype.decodeToString = function (text) {
    var base64 = this;
    var bytes = base64.decodeToByte(text);
    return base64.byteToString(bytes);
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

  /** Iterate into Map to get specified key
   * @returns {String} */
  FnUtil.prototype.getKey = function () {
    let fn = this;
    let m = arguments[0];
    let klist = arguments[1].split(",");
    for (let k in klist) {
      k = fn.trim(klist[k]);
      if (m[k] !== undefined) {
        k = fn.trim("" + m[k]);
        if (k.length > 0) return k;
      }
    }
    return "";
  };
})();

/** Global Utilities Function
 * @type {FnUtil}     */
const Fn = new FnUtil();
