// pages/moneyout/moneyout.js
import lodash from '../../utils/lodash'
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    moneyCanOut:'',
    limitNum:'',
    moneyout:'0.00',
  },
  
  moneyOutChange:function(e){
    var money;
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) { //正则验证，提现金额小数点后不能大于两位数字
      money = e.detail.value;
    } else {
      money = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    this.setData({
      moneyout: money,
    })
  },

  moneyOutAll:function(){
    const moneyCanOut = this.data.moneyCanOut
    console.log(moneyCanOut)
    this.setData({
      moneyout:moneyCanOut
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.queryMoney()
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

  },

  //确认
  moneyoutaction:lodash.throttle(function(){
    wx.showLoading({
      title: '正在加载...'
    })
    if(this.data.moneyout == '' || this.data.moneyout < this.data.limitNum){
      wx.hideLoading({
        complete: (res) => {},
      })
      wx.showToast({
        title: '提现金额需要大于'+this.data.limitNum+'元',
        icon:'none'
      })
    } else if(this.data.moneyout > this.data.moneyCanOut){
      wx.hideLoading({
        complete: (res) => {},
      })
      wx.showToast({
        title: '提现金额不能超过可提现金额',
        icon:'none'
      })
    }else{
      this.moneyOutquery()
    }
  },5000),

  moneyOutquery:function(){
    const bdinfo = { "tid": app.globalData.tid, "amt":this.data.moneyout}
    const cryptoString = app.emQueryInfo(JSON.stringify(bdinfo))
    var queryInfo =  { "hd": { "pi": "43001", "si": app.globalData._si }, "bd": cryptoString}
   

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

       wx.showModal({
         title:'提现申请成功',
         content:'提现审核通过后，将直接提现至您绑定的银行卡中。',
         showCancel:false,
         confirmText:'确定',
         success(res){
           wx.navigateBack({
             complete: (res) => {},
           })
         }
       })
      }else{
        myself.queryFaield(rest)
      }
    }); 
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

  queryFaield:function(json){
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