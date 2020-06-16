// pages/moneyoutlist/moneyoutlist.js
import cryptoJs from '../../utils/encryptUtil.js'
var app = getApp()
var page = 1

Page({

  /**
   * 页面的初始数据
   */
  data: {
    items:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadData()
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
    wx.navigateBack()
  },

  onPullDownRefresh:function(){
    page = 1
    this.loadData()
  },
  
  onReachBottom:function(){
    page += 1
    this.loadData()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  loadData:function(){
    const bdinfo = { "tid": app.globalData.tid, "pg": page, "sz": 20}
    const cryptoString = app.emQueryInfo(JSON.stringify(bdinfo))
    var queryInfo =  { "hd": { "pi": "33002", "si": app.globalData._si }, "bd": cryptoString} 
     var myself = this
     app.func.req('33002', queryInfo, function (rest) {
       wx.stopPullDownRefresh({
         complete: (res) => {},
       })
       console.log(rest)
       if (rest.hd.rid == 0) {
        var info =app.emDecrptInfo(rest.bd)
        var json = JSON.parse(info)
         var list = []
         if (page != 1){
           if (json.olst.length == 0){
             page -= 1;
             return;
           }
           list = myself.data.items
         }
         for (let i = 0; i < json.olst.length; i++){
           var item = json.olst[i]
           item.dis = parseInt(item.dis)
           item.ctm = myself.turnTimeToString(item.ctm)
           list.push(item)
         }
         myself.setData({
             items: list
           })
       }else{
         myself.queryFaield(rest)
       }
     }); 
   },
   turnTimeToString:function(time){
      return time.substring(5,16)
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