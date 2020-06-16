// pages/mine/mine.js
import lodash from '../../utils/lodash.js' //../../util切换成你存放lodash.js的路径 
var app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isRegister:false,
    moneyCanOut:0,
    bankInfo:undefined,
    qulification:undefined,
    hiddenmodalput:true,
    moneyOut:'',
    limitNum:9999999
  },

  toLogin:function(){
    this.turnLoginShowModal()
  },

  moneyOutAction:lodash.throttle(function(e) {
    this.checkCanOuntMoney()
  },1000),

  checkCanOuntMoney:function(){
    if(this.data.moneyCanOut < this.data.limitNum){
      wx.hideLoading({
        complete: (res) => {},
      })
      wx.showToast({
        title: '满'+this.data.limitNum+'元可提现',
        icon:"none"
      })
    }else{
      this.queryBindedBankCard()
    }
  },

  showMoenyOutAlert:function(){

    wx.navigateTo({
      url: '/pages/moneyout/moneyout',
    })
    // this.setData({
    //   hiddenmodalput:false
    // })
  },

  moneyOutChange:function(e){
    this.setData({
      moneyOut:e.detail.value
    })
  },
  //取消按钮
  cancel: function(){
    this.setData({
       hiddenmodalput: true
    });
  },
  //确认
  confirm: function(){
    this.setData({
      hiddenmodalput: true
    })

    if(this.data.moneyOut == '' || parseInt(this.data.moneyOut) < this.data.limitNum){
      wx.showToast({
        title: '提现金额需要大于'+this.data.limitNum+'元',
        icon:'none'
      })
    }else{
      this.moneyOutquery()
    }
  },

  moneyOutquery:function(){
    const bdinfo = { "tid": app.globalData.tid, "amt":this.data.moneyOut}
    const cryptoString = app.emQueryInfo(JSON.stringify(bdinfo))
    var queryInfo =  { "hd": { "pi": "43001", "si": app.globalData._si }, "bd": cryptoString}
   
    wx.showLoading({
      title: '正在加载...'
    })
    var myself = this
    app.func.req('43001', queryInfo, function (rest) {
      wx.hideLoading({
        complete: (res) => {},
      })

      console.log(rest)
      wx.stopPullDownRefresh({
        complete: (res) => {},
      })
      
      if (rest.hd.rid == 0) {
        myself.setData({
          moneyOut:''
        })

       myself.queryMoney()
       wx.showToast({
         title: '提现申请成功',
         icon:"none"
       })
      }else{
        myself.queryFaield(rest)
      }
    }); 
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  signature:function(){
    if(this.data.isRegister){
      wx.navigateTo({
        url: '../signature/bank/bank',
        success: function() {},
        fail: function() {},
        complete: function() {}
      })
    }else{
      this.turnLoginShowModal()
    }
  },

  moneylist:function(){
    if(this.data.isRegister){
      wx.navigateTo({
        url: '../moneyoutlist/moneyoutlist',
        success: function() {},
        fail: function() {},
        complete: function() {}
      })
    }else{
      this.turnLoginShowModal()
    }
  },

  qulification:function(){
    if(this.data.isRegister){
      this.queryCarQualificationInfo()
    }else{
      this.turnLoginShowModal()
    }

  },

 /*
  * 获取资质认证信息
  */
 queryCarQualificationInfo:function(){
  const bdinfo = { "tid": app.globalData.tid}
  const cryptoString = app.emQueryInfo(JSON.stringify(bdinfo))
  var queryInfo =  { "hd": { "pi": "30040", "si": app.globalData._si }, "bd": cryptoString}
 
  wx.showLoading({
    title: '正在加载...',
  })
  var myself = this
  app.func.req('30040', queryInfo, function (rest) {

    if(rest == false){
      wx.hideLoading({
        complete: (res) => {},
      })
      wx.showToast({
        title: '请求失败，请稍后再试',
        icon:'none'
      })
      return
    }
    

    if (rest.hd.rid == 0) {
      var infoString =app.emDecrptInfo(rest.bd)
      const info = JSON.parse(infoString)

      myself.setData({
        qulification:info
      })

      if(info.iscq == 2 ){
        wx.showToast({
          title: '您已认证',
          icon:'none'
        })
      }else{
        myself.queryCarQuthAuthList()
      }
    }else{
      myself.queryFaield(rest)
    }

  }); 
},

/*
* 获取车辆认证审核列表
*/
queryCarQuthAuthList:function(){
  const bdinfo = { "tid": app.globalData.tid}
  const cryptoString = app.emQueryInfo(JSON.stringify(bdinfo))
  var queryInfo =  { "hd": { "pi": "30034", "si": app.globalData._si }, "bd": cryptoString}
 
  var myself = this
  app.func.req('30034', queryInfo, function (rest) {
    wx.hideLoading({
      complete: (res) => {},
    })
    if(rest == false){
      wx.showToast({
        title: '请求失败，请稍后再试',
        icon:'none'
      })
      return
    }

    if (rest.hd.rid == 0) {
      var infoString =app.emDecrptInfo(rest.bd)
      const info = JSON.parse(infoString)
      if(info.olst.length == 0 || info.olst[0].st == 0||info.olst[0].st == 3){
        wx.navigateTo({
          url: '/pages/certification/certification?certification=认证',
          success: function() {},
          fail: function() {},
          complete: function() {}
        })
      }else if(info.olst[0].st == 1){
        wx.showModal({
          title:"温馨提示",
          content:"您的资质正在审核中。",
          confirmText:"确定",
          confirmColor:"#FF0000",
          showCancel:false
        })
      }
    }else{
      myself.queryFaield(rest)
    }

  }); 
},


  service_phone:function(){
    wx.makePhoneCall({
      phoneNumber: '400-666-7056',
    })
  },

  turnLoginShowModal:function(){
    wx.showModal({
      title:'温馨提示',
      content:'需要先登录，没有账号的用户请先注册',
      confirm:'去登录',
      cancelText:'暂不登录',
      success(res){
        if(res.confirm){
          wx.navigateTo({
            url:  '../login/login'
          })
        }
      }
    })
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
    if(app.isRegister()){
      this.queryMoney()
      this.setData({
        isRegister:true
      })
    }else{
      this.setData({
        isRegister:false
      })
    }
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
    if(app.isRegister()){
      this.queryMoney()
    }
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

  },
  /**
   * 获取可提现金额
   */
  queryMoney: function(){
    const bdinfo = { "tid": app.globalData.tid}
    const cryptoString = app.emQueryInfo(JSON.stringify(bdinfo))
    var queryInfo =  { "hd": { "pi": "30030", "si": app.globalData._si }, "bd": cryptoString}

    var myself = this
    app.func.req('30030', queryInfo, function (rest) {
      wx.stopPullDownRefresh({
        complete: (res) => {},
      })
      
      if (rest.hd.rid == 0) {
        var info =app.emDecrptInfo(rest.bd)
        const dict = JSON.parse(info)
        const pt = dict.pt
        const limit = dict.ptmn
        myself.setData({
          moneyCanOut:pt,
          limitNum:limit
        })
      }else{
        myself.queryFaield(rest)
      }
    }); 
  },
  /**
   * 获取绑定的银行卡
   */
  queryBindedBankCard: function(){
    const bdinfo = { "tid": app.globalData.tid}
    const cryptoString = app.emQueryInfo(JSON.stringify(bdinfo))
    var queryInfo =  { "hd": { "pi": "30051", "si": app.globalData._si }, "bd": cryptoString}
   


    wx.showLoading({
      title: '正在加载...',
    })
    var myself = this
    app.func.req('30051', queryInfo, function (rest) {
      wx.stopPullDownRefresh({
        complete: (res) => {},
      })
      wx.hideLoading({
        complete: (res) => {},
      })
      
      // console.log("queryBindedBankCard " + JSON.stringify(rest))
      if (rest.hd.rid == 0) {
        var infoString =app.emDecrptInfo(rest.bd)
        const info = JSON.parse(infoString)
        if(info.olst.length > 0){
          myself.setData({
            bankInfo:info.olst[0]
          })
          myself.showMoenyOutAlert()
        }else{
          wx.showModal({
            title:"温馨提示",
            content:"绑定银行卡后才能提现，是否立即绑定银行卡？",
            cancelText:"取消",
            cancelColor: '#000000',
            confirmText:"确定",
            confirmColor:"#FF0000",
            success:function(res){
              if(res.confirm){
                wx.navigateTo({
                  url: '../signature/bank/bank',
                  success: function() {},
                  fail: function() {},
                  complete: function() {}
                })
              }
            }
          })
        }
      }else{
        myself.queryFaield(rest)
      }
    }); 
  },

  /*
  * 获取资质认证信息
  */
  queryQualificationInfo:function(){
    const bdinfo = { "tid": app.globalData.tid}
    const cryptoString = app.emQueryInfo(JSON.stringify(bdinfo))
    var queryInfo =  { "hd": { "pi": "30040", "si": app.globalData._si }, "bd": cryptoString}
   
    wx.showLoading({
      title: '正在加载...',
    })
    var myself = this
    app.func.req('30040', queryInfo, function (rest) {

      if(rest == false){
        wx.hideLoading({
          complete: (res) => {},
        })
        wx.showToast({
          title: '请求失败，请稍后再试',
          icon:'none'
        })
        return
      }
      

      if (rest.hd.rid == 0) {
        var infoString =app.emDecrptInfo(rest.bd)
        const info = JSON.parse(infoString)

        myself.setData({
          qulification:info
        })

        if(info.iscq == 2 ){
          myself.checkCanOuntMoney()
        }else{
          myself.queryCarAuthList()
        }
      }else{
        myself.queryFaield(rest)
      }

    }); 
  },

  /*
  * 获取车辆认证审核列表
  */
  queryCarAuthList:function(){
    const bdinfo = { "tid": app.globalData.tid}
    const cryptoString = app.emQueryInfo(JSON.stringify(bdinfo))
    var queryInfo =  { "hd": { "pi": "30034", "si": app.globalData._si }, "bd": cryptoString}
   
    var myself = this
    app.func.req('30034', queryInfo, function (rest) {
      wx.hideLoading({
        complete: (res) => {},
      })
      if(rest == false){
        wx.showToast({
          title: '请求失败，请稍后再试',
          icon:'none'
        })
        return
      }

      if (rest.hd.rid == 0) {
        var infoString =app.emDecrptInfo(rest.bd)
        const info = JSON.parse(infoString)
        if(info.olst.length == 0 || info.olst[0].st == 0||info.olst[0].st == 3){
          wx.showModal({
            title:"温馨提示",
            content:"请先进行资质认证。",
            confirmText:"确定",
            confirmColor:"#FF0000",
            showCancel:false,
            success:function(res){
              wx.navigateTo({
                url: '/pages/certification/certification?certification=认证',
                success: function() {},
                fail: function() {},
                complete: function() {}
              })
            }
          })
        }else if(info.olst[0].st == 1){
          wx.showModal({
            title:"温馨提示",
            content:"您的资质正在审核中，审核通过后才可以提现哦。",
            confirmText:"确定",
            confirmColor:"#FF0000",
            showCancel:false
          })
        }
      }else{
        myself.queryFaield(rest)
      }

    }); 
  },
  
  queryFaield:function(json){
    wx.hideLoading({
      complete: (res) => {},
    })
    if(json.hd.rid == -110014){
      wx.showModal({
        title:"温馨提示",
        content:"账号已下线，请重新登录!",
        confirmText:"确定",
        confirmColor:"#FF0000",
        showCancel:false,
        success:function(res){
          wx.reLaunch({
            url: '/pages/login/login',
          })
        }
      })
    }else{
      wx.showToast({
        title: json.hd.rmsg,
        icon:'none'
      })
    }
  }
})