// pages/signature/setting/bankcarsetting.js
import lodash from '../../../utils/lodash.js' //../../util切换成你存放lodash.js的路径 
import util from '../../../utils/util.js'

var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
      _token: '',
      banklist:undefined,
      selectedBank:undefined,
      cardNo:undefined,
      cardName:undefined,
      phone:undefined,
      idCardNo:undefined,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.queryCanBindBankCard()
    this.getOcrToken()
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

  carNoInput:function(e){
    this.setData({
      cardNo:e.detail.value
    })
  },

  carNameInput:function(e){
    this.setData({
      cardName:e.detail.value
    })
  },

  phoneInput:function(e){
    this.setData({
      phone:e.detail.value
    })
  },

  //获取ocr tocke
  getOcrToken:function(){
    // 获取获取Access Token
    var API_Key = 'xfL8VlHVjY1ubdZU8tpyhzoN';
    var Secret_Key = '4u8FDsdEUE2PPazEOSvyrfLZvmapPpky';
    var url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_Key}&client_secret=${Secret_Key}`;
    wx.request({
      url: url,
      success: res => {
        this.setData({
          _token: res.data.access_token
        })
        console.log(this.data._token)
      }
    })
  },
  
  // 银行卡ocr
  bankCardOcr() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0];

        var imgBase64 = wx.getFileSystemManager().readFileSync(tempFilePaths, "base64")
        wx.request({
          url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/bankcard?access_token=' + this.data._token,
          method: 'POST',
          data: {
            "image": imgBase64
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          success: res => {
            console.log(res)
            if (res.errMsg != "request:ok" || res.data.result.bank_card_number == "") {
              wx.showModal({
                title: '提示',
                content: '银行卡无法识别，请重新上传！或者手动输入银行卡号！',
              })
              return
            }

            const type = res.data.result.bank_card_type
            const name = res.data.result.bank_name
            if (type != 1){
              wx.showToast({
                title: '请绑定借记卡',
                icon:'none'
              })
              return
            }

            var hasContainerBank = false
            var message = ""
            if(that.data.banklist != undefined){
              that.data.banklist.forEach(function(item,index){
                  console.log(item)
                  if(item.sn.indexOf(name) >= 0){
                    that.setData({
                      selectedBank: item
                    })
                    hasContainerBank = true
                    return
                  }

                  if(name.indexOf("邮") >= 0 && name.indexOf("储") >= 0  && item.sc == "PSBC"){
                    that.setData({
                      selectedBank: item
                    })
                    hasContainerBank = true
                    return
                  }

                  message += item.sn + ","
              })

              if(!hasContainerBank){
                wx.showModal({
                  title:"提示",
                  content:'不支持该银行，请更换支持的银行卡再进行绑卡操作。支持的银行有:' + message,
                  showCancel:false,
                  confirmText:'确定'
                })
              }else{
                that.setData({
                  cardNo: res.data.result.bank_card_number.replace(/\s+/g,""),
                })
              }
             
            }

          }
        })
      }
    })
  },

  // 银行卡ocr
  idCardOcr() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0];
        var imgBase64 = wx.getFileSystemManager().readFileSync(tempFilePaths, "base64")
        wx.request({
          url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/idcard?access_token=' + this.data._token,
          method: 'POST',
          data: {
            "image": imgBase64,
            "id_card_side": "front"
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          success: res => {
            console.log(res)
            if (res.data.error_msg || res.data.words_result.公民身份号码.words == "") {
              wx.showModal({
                title: '提示',
                content: '身份证无法识别，请重新上传！或者手动输入身份证号！',
              })
              return
            }
            this.setData({
              idCardNo: res.data.words_result.公民身份号码.words,
              cardName: res.data.words_result.姓名.words
            })
            // console.log(res.data)
          }
        })
      }
    })
  },

  idCardNoInput:function(e){
    this.setData({
      idCardNo:e.detail.value
    })
  },

  addCardCheck:lodash.throttle(function(e) {

    if(this.data.cardNo == undefined){
      wx.showToast({
        title: '请输入银行卡号',
        icon:"none"
      })
      return
    }

    if(this.data.selectedBank == undefined){
      wx.showToast({
        title: '请选择银行卡归属银行',
        icon:'none'
      })
      return
    }

    if(this.data.cardName == undefined){
      wx.showToast({
        title: '请输入银行账户姓名',
        icon:'none'
      })
      return
    }

    if(this.data.phone == undefined){
      wx.showToast({
        title: '请输入银行留存电话',
        icon:'none'
      })
      return
    }

    if(this.data.idCardNo == undefined){
      wx.showToast({
        title: '请输入银行卡开户身份证号',
        icon:'none'
      })
      return
    }

    if(!util.checkIdCard(this.data.idCardNo)){
      wx.showToast({
        title: '请输入有效的身份证号',
        icon:'none'
      })
      return
    }

    this.addCardQuery()
  },1000),

  addCardQuery:function(){
    var bdinfo = { "tid": app.globalData.tid,
    "ban":this.data.cardName,
    "idc":this.data.idCardNo,
    "at":2,
    "bcd":"ABC",
    "bac":this.data.cardNo,
    "bm":this.data.phone,
    "bn":this.data.selectedBank.bcd,
    "ct":1}

    const cryptoString = app.emQueryInfo(JSON.stringify(bdinfo))
    var queryInfo =  { "hd": { "pi": "41005", "si": app.globalData._si }, "bd": cryptoString}

    wx.showLoading({
      title: '请稍等...',
    })
    
     var myself = this
     app.func.req('41005', queryInfo, function (rest) {
       wx.hideLoading({
         complete: (res) => {},
       })
       
       if (rest.hd.rid == 0) {
          wx.showToast({
            title: "绑卡成功"
          })

          let pages = getCurrentPages()
          let prevPage = pages[pages.length - 2]
          prevPage.setData({
            needRefreash:true
          })
          wx.navigateBack({
            complete: (res) => {({
              delta:1
            })},
          })
       }else{
        myself.queryFaield(rest)
      }
     }); 
  },

  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      selectedBank: this.data.banklist[e.detail.value]
    })
  },
  
  /**
   * 获取绑定的银行卡
   */
  queryCanBindBankCard: function(){
    var bdinfo = { "tid": app.globalData.tid}
    const cryptoString = app.emQueryInfo(JSON.stringify(bdinfo))
    var queryInfo =  { "hd": { "pi": "30050", "si": app.globalData._si }, "bd": cryptoString}
   
    var myself = this
    app.func.req('30050', queryInfo, function (rest) {
      wx.stopPullDownRefresh({
        complete: (res) => {},
      })
      
      if (rest.hd.rid == 0) {
        var infoString =app.emDecrptInfo(rest.bd)
        const info = JSON.parse(infoString)
        myself.setData({
          banklist:info.olst
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