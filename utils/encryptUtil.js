var CryptoJS = require("../miniprogram_npm/crypto-js/index");
const defaultIv = "JJL2@ys5xs0^99N!"

/**
 * 加密方法
 * @param: str 需要加密的字符
 * @param: key 密钥
 * @param: iv 密钥偏移量
 */
function encrypt(str, key) {
  const hexKey = HexString2Bytes(key)
  const newKey = byteToString(hexKey)
  const keyStr = CryptoJS.enc.Latin1.parse(newKey);
  const ivStr =   CryptoJS.enc.Utf8.parse(defaultIv);
  const encryptedStr = CryptoJS.AES.encrypt( CryptoJS.enc.Utf8.parse(str), keyStr, {
    iv: ivStr,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Iso10126
  });

  // 直接toString()是base64格式的字符串
  return encryptedStr.toString();
}
/**
 * 解密方法
 * @param: str 需要解密的字符
 * @param: key 密钥
 * @param: iv 密钥偏移量
 */
function decrypt(str, key) {
  const hexKey = HexString2Bytes(key)
  const newKey = byteToString(hexKey)
  const keyStr = CryptoJS.enc.Latin1.parse(newKey);
  const ivStr =  CryptoJS.enc.Utf8.parse(defaultIv);

  const encryptedStr = CryptoJS.AES.decrypt(str, keyStr, {
    iv: ivStr,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Iso10126
  });
  return CryptoJS.enc.Utf8.stringify(encryptedStr).toString()
}
/**
 * 处理密钥字符格式
 * @param: key 需要转格式的字符
 */
function encParse(key) {
  // key = CryptoJS.enc.Utf8.parse(key);
  // return key
  return CryptoJS.enc.Latin1.parse(key);
}
/**
 * 使用MD5 hash字符串
 * @param: str 需要加密的字符串
 * @param: times 需要hash的次数
 */
function md5(str, times = 1) {
  for (let i = 0; i < times; i++) {
    str = CryptoJS.MD5(str).toString();
  }
  return str;
}



/**
 * 判断是否是Base64格式的字符串
 */
function isBase64(str) {
  let reg = /^(([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=))|(([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==))$/;
  return reg.test(str);
}

function HexString2Bytes(str) {
    var len = str.length;
    if (len % 2 != 0) {
      return null;
    }
    len /= 2;
    var arrBytes = new Array();
    for (var i = 0; i < len; i++) {
      var s = str.substr(i*2, 2);
      var v = parseInt(s, 16);
      if(v >=127) v = v-255-1
      arrBytes.push(v);
    }
    return arrBytes;
  }

  function byteToString(arr) {
    if(typeof arr === 'string') {
      return arr;
    }
    var str = '',
      _arr = arr;
    for(var i = 0; i < _arr.length; i++) {
      var one = _arr[i].toString(2),
        v = one.match(/^1+?(?=0)/);
      if(v && one.length == 8) {
        var bytesLength = v[0].length;
        var store = _arr[i].toString(2).slice(7 - bytesLength);
        for(var st = 1; st < bytesLength; st++) {
          store += _arr[st + i].toString(2).slice(2);
        }
        str += String.fromCharCode(parseInt(store, 2));
        i += bytesLength - 1;
      } else {
        str += String.fromCharCode(_arr[i]);
      }
    }
    return str;
  }

  function stringToBytes(str) {  
    var ch, st, re = []; 
    for (var i = 0; i < str.length; i++ ) { 
        ch = str.charCodeAt(i);  // get char  
        st = [];                 // set up "stack"  

       do {  
            st.push( ch & 0xFF );  // push byte to stack  
            ch = ch >> 8;          // shift value down by 1 byte  
        }    

        while ( ch );  
        // add stack contents to result  
        // done because chars have "wrong" endianness  
        re = re.concat( st.reverse() ); 
    }  
    // return an array of bytes  
    return re;  
} 

function Bytes2Str(arr){
    var str = "";
    for(var i=0; i<arr.length; i++)
    {
       var tmp = arr[i].toString(16);
       if(tmp.length == 1){
        tmp = "0" + tmp;
       }
       str += tmp;
    }
    return str;
}


export default {
  decrypt,
  encrypt,
  md5,
  Bytes2Str,
  stringToBytes
}