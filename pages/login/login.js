// pages/login/login.js
import cryptoJs from '../../utils/encryptUtil.js'
import lodash from '../../utils/lodash.js' //../../util切换成你存放lodash.js的路径 
var http = require('../../utils/request.js')
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hid_ph: '',
    _code: ''
  },

  // 获取手机号码
  getPhoneNumber: function (e) {
    // console.log(e.detail.errMsg)
    // console.log(e.detail.iv)
    // console.log(e.detail.encryptedData)

    if (e.detail.errMsg == 'getPhoneNumber:fail user deny' || e.detail.errMsg == 'getPhoneNumber:fail:user deny' || e.detail.errMsg == 'getPhoneNumber:fail:user cancel' || e.detail.errMsg == 'getPhoneNumber:fail user cancel') {
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
      }
      wx.showLoading({
        title: '正在加载...',
      })
      app.func.req('11013', data, rest => {
        wx.hideLoading({
          complete: (res) => {},
        })
        console.log(rest);
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

  bindKeyInput: function (e) {
    this.setData({
      hid_ph: e.detail.value
    })
  },

  //登录
  formSubmit: lodash.throttle(function (e) {
    // console.log(this.data.hid_ph)

    if (this.data.hid_ph == '') {
      wx.showModal({
        title: '提示',
        content: '手机号码不能为空！',
        showCancel: false
      })
      return
    }

    wx.showLoading({
      title: '正在登录...',
    })

    var data = {
      "hd": {
        "pi": 11015,
        "sq": 59
      },
      "bd": {
        "ls": 32,
        "an": this.data.hid_ph,
        "code": app.globalData.old_code
      }
    };
    app.func.req('11015', data, rest => {
      if (rest == false) {
        wx.hideLoading({
          complete: (res) => {},
        })
        wx.showToast({
          title: '请求失败，请稍后再试',
          icon: 'none'
        })
        return
      }

      if (rest.hd.rid >= 0) {
        app.globalData.tid = JSON.parse(rest.bd).tid;
        var obj = JSON.parse(rest.bd);

        var key = cryptoJs.md5(this.data.hid_ph + '_' + app.globalData.old_code, 3);
        var _sk = cryptoJs.decrypt(obj.ct, key).split("|")[0];
        // console.log(_sk);
        // app.globalData._ct = cryptoJs.decrypt(obj.ct, key);
        app.globalData._sessionkey = _sk;
        app.globalData._si = obj.si;
        app.globalData._em = obj.em;
        app.globalData.ph = this.data.hid_ph;
        wx.switchTab({
          url: '../qutation/qutation',
        })
        // this.queryQualificationInfo();
      } else {
        wx.hideLoading({
          complete: (res) => {},
        })
        wx.showModal({
          title: '提示',
          content: rest.hd.rmsg,
          showCancel: false
        })
        return
      }
    })
  }, 1000),

  queryQualificationInfo: function () {
    const bdinfo = {
      "tid": app.globalData.tid
    }
    const cryptoString = app.emQueryInfo(JSON.stringify(bdinfo))
    var queryInfo = {
      "hd": {
        "pi": "30040",
        "si": app.globalData._si
      },
      "bd": cryptoString
    }

    var myself = this
    app.func.req('30040', queryInfo, function (rest) {
      if (rest == false) {
        wx.hideLoading({
          complete: (res) => {},
        })
        wx.showToast({
          title: '请求失败，请稍后再试',
          icon: 'none'
        })
        return
      }

      console.log(rest)
      if (rest.hd.rid == 0) {
        var bdinfo = app.emDecrptInfo(rest.bd)
        var info = JSON.parse(bdinfo)
        if (info.iscq == 2) {
          wx.hideLoading({
            complete: (res) => {},
          })
          wx.switchTab({
            url: '../qutation/qutation',
          })
        } else {
          myself.queryCarAuthList()
        }
      } else {
        wx.hideLoading({
          complete: (res) => {},
        })
        wx.showModal({
          title: '提示',
          content: rest.hd.rmsg,
          showCancel: false
        })
        return
        // myself.queryFaield(rest)
      }

    });
  },

  /*
   * 获取车辆认证审核列表
   */
  queryCarAuthList: function () {
    const bdinfo = {
      "tid": app.globalData.tid
    }
    const cryptoString = app.emQueryInfo(JSON.stringify(bdinfo))
    var queryInfo = {
      "hd": {
        "pi": "30034",
        "si": app.globalData._si
      },
      "bd": cryptoString
    }

    var myself = this
    app.func.req('30034', queryInfo, function (rest) {
      wx.hideLoading({
        complete: (res) => {},
      })
      if (rest == false) {
        wx.showToast({
          title: '请求失败，请稍后再试',
          icon: 'none'
        })
        return
      }

      if (rest.hd.rid == 0) {
        var infoString = app.emDecrptInfo(rest.bd)
        const info = JSON.parse(infoString)
        if (info.olst.length == 0 || info.olst[0].st == 0 || info.olst[0].st == 3) {
          wx.showModal({
            title: "温馨提示",
            content: "您还未进行资质认证。",
            cancelText: "先不认证",
            confirmText: "去认证",
            confirmColor: "#FF0000",
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/certification/certification?certification=认证&type=login',
                  success: function () {},
                  fail: function () {},
                  complete: function () {}
                })
              } else {
                wx.switchTab({
                  url: '../qutation/qutation',
                })
              }
            }
          })
        } else if (info.olst[0].st == 1) {
          wx.switchTab({
            url: '../qutation/qutation',
          })
        }
      } else {
        myself.queryFaield(rest)
      }

    });
  },


  //register
  register() {
    wx.redirectTo({
      url: '../register/register',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log('code='+ app.globalData.old_code)

    if(options.re_ph){
      this.setData({
        hid_ph: options.re_ph
      })
    }

    if (app.globalData.old_code) {
      this.setData({
        _code: app.globalData.old_code
      })
    } else {
      wx.login({
        success: res => {
          app.globalData.old_code = res.code;
          console.log(res.code)
          this.setData({
            _code: res.code
          })
          wx.request({
            url: http.root + '11012',
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
              // var obj = JSON.parse(res.data.bd)
              // this.setData({
              //   _sessionkey: obj.sessionKey
              // })
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
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})