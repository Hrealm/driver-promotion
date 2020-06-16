//app.js
import cryptoJs from 'utils/encryptUtil.js'
var http = require('/utils/request.js')
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },

  emQueryInfo:function(str){
    if(this.globalData._em == 1){
      const cryptoString = cryptoJs.encrypt(str,this.globalData._sessionkey)
      return cryptoString
    }else{
      return str
    }
  },

  emDecrptInfo:function(str){
    if(this.globalData._em == 1){
      const decryptInfo = cryptoJs.decrypt(str,this.globalData._sessionkey)
      return decryptInfo
    }else{
      return str
    }
  },

  isRegister:function(){
    if(this.globalData.tid == '' || this.globalData._sessionkey == '' || this.globalData.ph == ''){
      return false
    }
    return true
  },

  globalData: {
    userInfo: null,
    carLongDict:{1:"4.2米",2:"5.0米",3:"6.2米",4:"6.8米",5:"7.2米",6:"7.7米",7:"7.8米",8:"8.2米",9:
    "8.7米",10:"9.6米",11:"12.5米",12:"13.0米",13:"14.6米",14:"15.0米",15:"16.5米",16:"17.5米",17:"其他"},
    carTypeDict:{1:"平板",2:"高栏",3:"中栏",4:"低栏",5:"高低板",6:"厢式",7:"自卸",8:"保温",9:"冷藏",10:
    "危险品",11:"集装箱",12:"特种",13:"其他"},
    tid:'',
    ph:'',
    old_code: '',
    _ct: '',
    _si: '',
    _em: '',
    _sessionkey: '',
    imagePath:'',
    inviter: '', //邀請人
    posterConfig : {
      jdConfig: {
          width: 750,
          height: 1334,
          backgroundColor: '#fff',
          debug: false,
          pixelRatio: 1,
          texts: [
              {
                  x: 360,
                  y: 1065,
                  baseLine: 'top',
                  text: '长按识别小程序码',
                  fontSize: 38,
                  color: '#080808',
              },
              {
                  x: 360,
                  y: 1123,
                  baseLine: 'top',
                  text: '超值好货一起拼',
                  fontSize: 28,
                  color: '#929292',
              },
          ],
          images: [
              {
                  width: 750,
                  height: 1334,
                  x: 0,
                  y: 0,
                  url: '../../../img/post.png',
              },
              {
                width: 220,
                height: 220,
                x: 92,
                y: 1020,
                url: 'https://lc-I0j7ktVK.cn-n1.lcfile.com/d719fdb289c955627735.jpg',
            },
          ]
    
      },
    }
  },
  
  func:{
    req:http.req
  }

})