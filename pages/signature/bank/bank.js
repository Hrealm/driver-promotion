// pages/signature/bank/bank.js

import cryptoJs from '../../../utils/encryptUtil.js'

var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    needRefreash:false,
    bindBank:'',
    bindCarNo:'',
    bindBankCode:'',
    bankitems:{
      "ICBC":{
          "iconnormal":"driver_ic_bank_gs_logo_normal.png",
          "iconwhite":"driver_ic_bank_gs_logo_normal_white.png",
          "bgcolor":"#cf585e"
      },
      "ABC":{
        "iconnormal":"driver_ic_bank_cbc_logo_normal.png",
        "iconwhite":"driver_ic_bank_cbc_logo_normal_white.png",
        "bgcolor":"#008566"
      },
      "CCB":{
        "iconnormal":"driver_ic_bank_js_logo_normal.png",
        "iconwhite":"driver_ic_bank_js_logo_normal_white.png",
        "bgcolor":"#005BAB"
      },
      "COMM":{
        "iconnormal":"driver_ic_bank_jt_logo_normal.png",
        "iconwhite":"driver_ic_bank_jt_logo_normal_white.png",
        "bgcolor":"#005BAB"
      },
      "CITIC":{
        "iconnormal":"driver_ic_bank_zx_logo_normal.png",
        "iconwhite":"driver_ic_bank_zx_logo_normal_white.png",
        "bgcolor":"#cf585e"
      },
      "CEB":{
        "iconnormal":"driver_ic_bank_gd_logo_normal.png",
        "iconwhite":"driver_ic_bank_gd_logo_normal_white.png",
        "bgcolor":"#6A1684"
      },
      "SPABANK":{
        "iconnormal":"driver_ic_bank_pa_logo_normal.png",
        "iconwhite":"driver_ic_bank_pa_logo_normal_white.png",
        "bgcolor":"#FF6100"
      },
      "SHBANK":{
        "iconnormal":"driver_ic_bank_sh_logo_normal.png",
        "iconwhite":"driver_ic_bank_sh_logo_normal_white.png",
        "bgcolor":"#005BAB"
      },
      "PSBC":{
        "iconnormal":"driver_ic_bank_yzcx_logo_normal.png",
        "iconwhite":"driver_ic_bank_yzcx_logo_normal_white.png",
        "bgcolor":"#007D3E"
      },
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("onLoad")
    this.queryBindBankCard()
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
    console.log("onShow")
    if(this.data.needRefreash){
      this.queryBindBankCard()
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
    wx.navigateBack()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.queryBindBankCard()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  deleteCard:function(){

    if(this.data.bindBank == ''){
      wx.navigateTo({
        url: '../setting/bankcarsetting',
        success: function() {},
        fail: function() {},
        complete: function() {}
      })
    }else{
      var myself = this
      wx.showModal({
        title:"温馨提示",
        content:"是否确认解绑银行卡",
        cancelText:"取消",
        cancelColor: '#000000',
        confirmText:"确定",
        confirmColor:"#FF0000",
        success:function(res){
          if(res.confirm){
            myself.cancelBindCard()
          }
        }
      })
    }
  },

  /**
   * 获取绑定的银行卡
   */
  queryBindBankCard: function(){
    const bdinfo = { "tid": app.globalData.tid}
    const cryptoString = app.emQueryInfo(JSON.stringify(bdinfo))
    var queryInfo =  { "hd": { "pi": "30051", "si": app.globalData._si }, "bd": cryptoString}

    var myself = this
    app.func.req('30051', queryInfo, function (rest) {
      wx.stopPullDownRefresh({
        complete: (res) => {},
      })
      
      if (rest.hd.rid == 0) {
        var infoString =app.emDecrptInfo(rest.bd)
        const info = JSON.parse(infoString)
        console.log(rest)
        if(info.olst.length != 0 ){
          var carNo = ""
          const bankInfo = info.olst[0]
          if (bankInfo.bac.length == 16) {
            carNo = "**** **** **** " + bankInfo.bac.substring(12,16)
          }else{
            carNo = "**** "+bankInfo.bac.substring(bankInfo.bac.length - 4,bankInfo.bac.length)
          }

          var bankcode = ''
          if (bankInfo.bn.indexOf("农业") != -1){
            bankcode = 'ABC'
          }else if (bankInfo.bn.indexOf("工商") != -1){
            bankcode = 'ICBC'
          }else if (bankInfo.bn.indexOf("建设") != -1){
            bankcode = 'CCB'
          }else if (bankInfo.bn.indexOf("平安") != -1){
            bankcode = 'SPABANK'
          }else if (bankInfo.bn.indexOf("上海")!= -1) {
            bankcode = 'SHBANK'
          }else if (bankInfo.bn.indexOf("邮政") != -1){
            bankcode = 'PSBC'
          }else if (bankInfo.bn.indexOf("中信") != -1){
            bankcode = 'CITIC'
          }else if (bankInfo.bn.indexOf("交通") != -1){
            bankcode = 'COMM'
          }else if (bankInfo.bn.indexOf("光大") != -1){
            bankcode = 'CEB'
          }
          
          myself.setData({
            bindBank:bankInfo,
            bindCarNo:carNo,
            bindBankCode:bankcode
          })
        }else{
          myself.setData({
            bindBank:'',
            bindCarNo:'',
            bindBankCode:''
          })
        }
      }else{
        myself.queryFaield(rest)
      }

    }); 
  },


  /**
   * 银行卡解绑
   */
  cancelBindCard:function(){

    wx.showLoading({
      title: '正在加载...',
    })
    const bdinfo = { "tid": app.globalData.tid,"at":2,"bcd":this.data.bindBank.bcd}
    const cryptoString = app.emQueryInfo(JSON.stringify(bdinfo))
    var queryInfo =  { "hd": { "pi": "41003", "si": app.globalData._si }, "bd": cryptoString}
 
     var myself = this
     app.func.req('41003', queryInfo, function (rest) {
       wx.stopPullDownRefresh({
         complete: (res) => {},
       })
       
       wx.hideLoading({
         complete: (res) => {},
       })

       console.log(rest)
       if (rest.hd.rid == 0) {
        wx.showToast({
          title: "解约成功",
        })
        myself.queryBindBankCard()
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