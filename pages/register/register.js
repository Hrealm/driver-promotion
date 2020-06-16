// pages/register/register.js
import lodash from '../../utils/lodash.js' //../../util切换成你存放lodash.js的路径 
import cryptoJs from '../../utils/encryptUtil.js'
var http = require('../../utils/request.js') 

//获取应用实例
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    _sessionkey: "",
    _code: '',
    hid_ph: '',
    inviter: '', //邀請人
    userInfo:'',
    submit: false,
    v_pwd: '',
    user_name: ''
  },

  // 获取手机号码
  getPhoneNumber: function(e) {
    // console.log(e.detail.errMsg)
    // console.log(e.detail.iv)
    // console.log(e.detail.encryptedData)

    console.log(e);
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny' || e.detail.errMsg == 'getPhoneNumber:fail:user deny'  || e.detail.errMsg == 'getPhoneNumber:fail:user cancel' || e.detail.errMsg == 'getPhoneNumber:fail user cancel') {
      wx.showToast({
        title: '未授权，无法获取手机号码',
        icon: 'none'
      })
    } else {
      var data = {
        "hd": {
          "pi": 11013,
          "sq": 59
        },
        "bd": {
          "code": this.data._code,
          "enData": e.detail.encryptedData,
          "iv": e.detail.iv
        }
      };
      app.func.req('11013', data, rest => {
        // var obj = JSON.parse(rest.bd)
        // this.setData({
        //   hid_ph: obj.ph
        // })
        if (rest == false) {
          wx.showToast({
            title: '请求失败，请重新尝试',
            icon: 'none'
          })
        } else {
          if (rest.hd.rid == 0) {
            var obj = JSON.parse(rest.bd)
            this.setData({
              hid_ph: obj.ph
            })
          } else {
            wx.showToast({
              title: rest.hd.rmsg,
              icon: 'none'
            })
          }
        }
      })
    }

  },


  getUserInfo: function (e) {
    // console.log(e)
    self = this;
    wx.getUserInfo({
      success: res=>{
        console.log(e.detail);
        self.setData({
          userInfo: e.detail.userInfo,
          // submit: true,
          user_name: e.detail.userInfo.nickName
        })
        // this.nextSubmit();
      },
      fail: res=> {
        wx.showToast({
          title: '未获取微信昵称，请手动输入。',
          icon: 'none'
        })
      }
    })

  },

  

  bindKeyInput: function (e) {
    this.setData({
      hid_ph: e.detail.value
    })
  },

  bindNameInput: function(e){
    this.setData({
      user_name: e.detail.value
    })
  },

  bindPwdInput: function(e){
    this.setData({
      v_pwd: e.detail.value
    })
  },

  
  // 下一步
  formSubmit:lodash.throttle(function(e) {
    // console.log(this.data.hid_ph);
    // if (!isIdGot){
    //   return
    // }
    console.log(e);
    if (this.data.hid_ph == '' || e.detail.value.pwd == ''){
      wx.showModal({
        title: '提示',
        content: '手机号码或者密码不能为空！',
        showCancel:false
      })
      return
    }

    if(this.data.user_name == ''){
      wx.showModal({
        title: '提示',
        content: '名称不能为空，请输入或者获取微信昵称！',
        showCancel:false
      })
      return
    }

    if(e.detail.value.pwd.length < 6){
      wx.showModal({
        title: '提示',
        content: '密码长度不能小于6位',
        showCancel:false
      })
      return
    }

    
    if (!(/^[a-zA-Z0-9_]+$/.test(e.detail.value.pwd))) {
      wx.showModal({
        title: '提示',
        content: '请输入6~16位包含数字、字母及下划线格式的密码',
        showCancel:false
      })
      return
    }

    // this.getUserInfo();

    wx.showLoading({
      title: '正在处理...',
    })
    // console.log(111);
    wx.request({
      url: http.root +'11010',
      header: {
        'content-type': 'application/json'
      },
      method: 'POST',
      data: {
        "hd": {
          "pi": 11010,
          "sq": 59
        },
        "bd": {
          "ph": this.data.hid_ph,
          "sc": '',
          "ic": this.data.inviter,
          "pwd": cryptoJs.md5(this.data.hid_ph+'_'+e.detail.value.pwd,3),
          "wxpc":this.data.userInfo == '' ? '':this.data.userInfo.avatarUrl,
          "wxne":this.data.userInfo == '' ? this.data.user_name : this.data.userInfo.nickName,
        }
      },
      success: res => {
        // console.log(2222);
        wx.hideLoading({
          complete: (res) => {},
        })
        console.log(res)
        if (res.data.hd.rid >= 0) {
          var obj = JSON.parse(res.data.bd);
          var _st = obj.st;
          if(_st == 0){
            app.globalData.tid = obj.tid;
            app.globalData.ph = this.data.hid_ph;
            wx.navigateTo({
              url: '../certification/certification?register_txt=注册&old_code=' + this.data._code,
              success: function () { },
              fail: function () { },
              complete: function () { }
            })
          }
          if(_st == 1){
            wx.showModal({
              title: '提示',
              content: '已注册为货主',
              showCancel:false
            })
            return
          }
          if (_st == 2) {
            // app.globalData.ph = this.data.hid_ph;
            var that = this;
            wx.showModal({
              title: '提示',
              content: '账号已存在,请登录！',
              confirmText: '去登录',
              success(res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '../login/login?re_ph=' + that.data.hid_ph,
                    success: function () { },
                    fail: function () { },
                    complete: function () { }
                  })
                }
              }
            })
            
            return
          }
          if (_st == 3) {
            wx.showModal({
              title: '提示',
              content: '已注册为调度员',
              showCancel:false
            })
            return
          }
          if (_st == 4) {
            wx.showModal({
              title: '提示',
              content: '已注册为客服',
              showCancel:false
            })
            return
          }
          if (_st == 5) {
            wx.showModal({
              title: '提示',
              content: '已注册为经纪人',
            })
            return
          }

        } else {
          wx.showModal({
            title: '提示',
            content: res.data.hd.rmsg,
            showCancel:false
          })
          return
        }
      },
      fail: e => {
        // console.log(333)
        wx.hideLoading({
          complete: (res) => { },
        })
        wx.showModal({
          title: '提示',
          content: e,
          showCancel: false
        })
      }

    })
    // console.log('form发生了submit事件，携带数据为：', e.detail.value.ph);
  },1000),


  // 提交
  nextSubmit: lodash.throttle(function () {
    // console.log(this.data.hid_ph);
    // if (!isIdGot){
    //   return
    // }
    // console.log(this.data.hid_ph, this.data.v_pwd);
    if (this.data.hid_ph == '' || this.data.v_pwd == '') {
      wx.showModal({
        title: '提示',
        content: '手机号码或者密码不能为空！',
        showCancel: false
      })
      return
    }
    if (this.data.v_pwd.length < 6) {
      wx.showModal({
        title: '提示',
        content: '密码长度不能小于6位',
        showCancel: false
      })
      return
    }


    if (!(/^[a-zA-Z0-9_]+$/.test(this.data.v_pwd))) {
      wx.showModal({
        title: '提示',
        content: '请输入6~16位包含数字、字母及下划线格式的密码',
        showCancel: false
      })
      return
    }

    // this.getUserInfo();

    wx.showLoading({
      title: '正在处理...',
    })
    // console.log(111);
    wx.request({
      url: http.root + '11010',
      header: {
        'content-type': 'application/json'
      },
      method: 'POST',
      data: {
        "hd": {
          "pi": 11010,
          "sq": 59
        },
        "bd": {
          "ph": this.data.hid_ph,
          "sc": '',
          "ic": this.data.inviter,
          "pwd": cryptoJs.md5(this.data.hid_ph + '_' + this.data.v_pwd, 3),
          "wxpc": this.data.userInfo == '' ? '' : this.data.userInfo.avatarUrl,
          "wxne": this.data.userInfo == '' ? '' : this.data.userInfo.nickName,
        }
      },
      success: res => {
        // console.log(2222);
        wx.hideLoading({
          complete: (res) => { },
        })
        console.log(res)
        if (res.data.hd.rid >= 0) {
          var obj = JSON.parse(res.data.bd);
          var _st = obj.st;
          if (_st == 0) {
            app.globalData.tid = obj.tid;
            app.globalData.ph = this.data.hid_ph;
            wx.navigateTo({
              url: '../certification/certification?register_txt=注册&old_code=' + this.data._code,
              success: function () { },
              fail: function () { },
              complete: function () { }
            })
          }
          if (_st == 1) {
            wx.showModal({
              title: '提示',
              content: '已注册为货主',
              showCancel: false
            })
            return
          }
          if (_st == 2) {
            if (obj.cst == 1) {
              var that = this;
              wx.showModal({
                title: '提示',
                content: '已注册,未认证',
                confirmText: '去认证',
                success(res) {
                  if (res.confirm) {
                    app.globalData.tid = obj.tid;
                    app.globalData.ph = that.data.hid_ph;
                    wx.navigateTo({
                      url: '../certification/certification?register_txt=注册&old_code=' + that.data._code,
                      success: function () { },
                      fail: function () { },
                      complete: function () { }
                    })
                    // console.log(app.globalData)
                  }
                }
              })


            } else if (obj.cst == 2) {
              wx.showModal({
                title: '提示',
                content: '账号已存在,请登录！',
                confirmText: '去登录',
                success(res) {
                  if (res.confirm) {
                    wx.navigateTo({
                      url: '../login/login',
                      success: function () { },
                      fail: function () { },
                      complete: function () { }
                    })
                  }
                }
              })
            }

            return
          }
          if (_st == 3) {
            wx.showModal({
              title: '提示',
              content: '已注册为调度员',
              showCancel: false
            })
            return
          }
          if (_st == 4) {
            wx.showModal({
              title: '提示',
              content: '已注册为客服',
              showCancel: false
            })
            return
          }
          if (_st == 5) {
            wx.showModal({
              title: '提示',
              content: '已注册为经纪人',
            })
            return
          }

        } else {
          wx.showModal({
            title: '提示',
            content: res.data.hd.rmsg,
            showCancel: false
          })
          return
        }
      },
      fail: e => {
        // console.log(333)
        wx.hideLoading({
          complete: (res) => { },
        })
        wx.showModal({
          title: '提示',
          content: e,
          showCancel: false
        })
      }

    })
    // console.log('form发生了submit事件，携带数据为：', e.detail.value.ph);
  }, 1000),
  

  //login
  login() {
    wx.redirectTo({
      url: '../login/login',
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    console.log('scene='+ options.scene)
    if (options.scene) {
      this.setData({
        inviter: options.scene
      })
      app.globalData.inviter = options.scene
    }else if(app.globalData.inviter){
      this.setData({
        inviter: app.globalData.inviter
      })
    }

    if(app.globalData.old_code){
      this.setData({
        _code: app.globalData.old_code
      })
    }else{
      wx.login({
        success: res => {
          app.globalData.old_code = res.code;
          this.setData({
            _code: res.code
          })
          wx.request({
            url: http.root +'11012',
            header: {
              'content-type': 'application/json'
            },
            method: 'POST',
            data: {
              "hd": {
                "pi": 11012,
                "sq": 59
              },
              "bd": {
                "ls": 32,
                "code": res.code
              }
            },
            success: res => {
              // console.log(res)
              var obj = JSON.parse(res.data.bd)
              this.setData({
                _sessionkey: obj.sessionKey
              })
            },
            fail: e => {
              console.log(e)
            }
          })
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})