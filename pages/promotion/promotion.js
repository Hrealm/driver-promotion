import cryptoJs from '../../utils/encryptUtil.js'
import util from '../../utils/util.js'
import lodash from '../../utils/lodash.js' //../../util切换成你存放lodash.js的路径 
import Poster from '../miniprogram_dist/poster/poster';

wx.hideLoading({
      complete: (res) => {},
    })
var app = getApp()
var page = 1;

const posterConfig = {
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
              text: '海量货源等你来',
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
              url: 'post.png',
          },
          {
              width: 220,
              height: 220,
              x: 92,
              y: 1020,
              url: '',
          },
         
      ]

  },
}


Page({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false,    //初始化定义show为false
    time: 1,        //定义时间为3秒

    items:[],
    avatarUrl:"",
    posterConfig: posterConfig.jdConfig,
    imagePath:"",
    isLogin:false,
    isFirstLoad:false,
    isCreatedPost:false
  },
  /**
  * 生命周期函数--监听页面显示
  */
 onShow: function () {
   if(app.globalData.ph==''){
      this.setData({
        isLogin:false
      })
    }else{
      this.setData({
        isLogin:true
      })
    }
   if(!this.data.isFirstLoad&&this.data.isLogin){
     this.setData({
      isFirstLoad:true
     })
      this.shareMiniQR()
      this.loadData()

      var that = this
      var interval = setInterval(function () {
        var timenew = that.data.time - 1
        that.setData({
          time: timenew
        })
        if (that.data.time == 0) {
          clearInterval(interval)
            that.setData({
          show: true          //如果time的值为0时，将data里面show的值改为true,图片就可以显示了
          })
        }
      }, 1000)
    }
    
  },
  shareMiniQR:function(){
    wx.getSavedFileList({
      // 获取文件列表
      success (res) {
        res.fileList.forEach((val, key) => {
          // 遍历文件列表里的数据
          // 删除存储的垃圾数据
          wx.removeSavedFile({
              filePath: val.filePath
          });
        })
      }
    })
    
    self=this;
    wx.showLoading({
      title: '正在加载',
      icon: 'none',
    })
    self.generateText();
    self.requestForPost();
  },

  closelaye() {
    this.setData({
      show: false         //bindtap点击事件，点击colse-icon时修改show的值为false,关闭图片。
    })
  },

  turnToRule:function(){
    this.setData({
      show: false         //bindtap点击事件，点击colse-icon时修改show的值为false,关闭图片。
    })
    wx.navigateTo({
      url: '/pages/rules/rules',
    })
  },


  generateText(){
    var width=wx.getSystemInfoSync().windowWidth, height=wx.getSystemInfoSync().windowHeight;
    const qrCodeCanvas = wx.createCanvasContext('qrcodeCanvas');
    qrCodeCanvas.drawImage("../../img/post.png", 0, 0, width, height);
    qrCodeCanvas.setFontSize(util.px2rpx(5));
    qrCodeCanvas.setFillStyle("#000000");
    qrCodeCanvas.setTextAlign('left');
    qrCodeCanvas.fillText("长按识别二维码", width*0.15, height*0.80, util.px2rpx(80));
    qrCodeCanvas.draw(true);
  },
  requestForPost(){
    const width = 390
    const lineColor = {"r":"30","g":"188","b":"113"}
    var queryInfo =  { "hd": { "pi": "11016", "sq":1 }, "bd": {"scene":app.globalData.ph, "ls":"32", "path": "pages/register/register", "width":width,"lineColor":JSON.stringify(lineColor)}}
    console.info(queryInfo);
    self=this
    app.func.req('11016', queryInfo, function (res) {
      console.log(res)
      var json = JSON.parse(res.bd);
      
      util.base64src('data:image/png;base64,'+json.img,imagePath =>{
          console.log(' image path ' +imagePath)
          const name = 'posterConfig.images'
          self.setData({
            isCreatedPost:true
          })
          self.setData({
                    [name]: [
                      {
                          width: 750,
                          height: 1334,
                          x: 0,
                          y: 0,
                          url: 'post.png',
                      },
                      {
                          width: 220,
                          height: 220,
                          x: 92,
                          y: 1020,
                          url: imagePath,
                      },
                  ]
                })
          console.log(self.data.posterConfig)
          wx.hideLoading();
      })
    })
  },
  loadData:function(){
    const bdinfo = { "tid": app.globalData.tid, "pg": page, "sz": 20}
    const cryptoString = app.emQueryInfo(JSON.stringify(bdinfo))
    var queryInfo =  { "hd": { "pi": "30054", "si": app.globalData._si }, "bd": cryptoString}
    var myself = this
    app.func.req('30054', queryInfo, function (rest) {
      wx.stopPullDownRefresh({
        complete: (res) => {},
      })
      console.log(rest.bd)
      var info = ""
      if(app.globalData._em == 1){
        info = cryptoJs.decrypt(rest.bd,app.globalData._sessionkey)
      }else{
        info = rest.bd
      }
      console.info(info)
      var json = JSON.parse(info)
      if (rest.hd.rid == 0) {
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
      }
    }); 
  },

  onPullDownRefresh:function(){
    page = 1
    this.loadData()
  },
  
  onReachBottom:function(){
    page += 1
    this.loadData()
  },

  turnTimeToString:function(time){
    const oldDate = new Date(time)
    var nowTime = new Date().getTime()/1000
    var date  = oldDate.getTime()/1000
    const nowDay = new Date().getDate()
    const oldDay = oldDate.getDate()

    if (nowTime - date <= 60){
      return "刚刚"
    }else if ( nowTime - date <= 1800){
      let min = (nowTime - date)/60
      return parseInt(min) + "分钟前"
    }else if (nowTime - date <= 3600 *24 && nowDay == oldDay ){
      return time.substring(11,16)
    }else{
      return time.substring(5,10)
    }
  },
  navigateToPost: function(){
    wx.showModal({
      title: "温馨提示",
      content: "需要先登录，没有账号的用户请先注册",
      cancelText: "暂不登录",
      confirmText: "去登录",
      success: function(res) {
        if(res.confirm){
          wx.navigateTo({
            url: '/pages/login/login',
            success: function() {},
            fail: function() {},
            complete: function() {}
          })
        }
      }
    })
  },
  onPosterSuccess(e) {
    wx.hideLoading({
      complete: (res) => {},
    })
      const { detail } = e;
      app.globalData.imagePath=detail
      wx.navigateTo({
        url: '/pages/post/post',
        complete:function(){
          wx.hideToast();
        }
      })
  },
  onPosterFail(err) {
    wx.hideLoading({
      complete: (res) => {},
    })
      console.error(err);
  },
  showToast(){
    wx.showToast({
      title:"正在生成海报",
      icon:'none',
      duration:10000
    })
  },
   /**
     * 异步生成海报
     */
    onCreatePoster:lodash.throttle( function(e){
      if(this.data.isCreatedPost){
        if(app.globalData.imagePath==''){
          wx.showLoading({
            title: '正在生成海报',
            icon:'none'
          })
          this.setData({ posterConfig: this.data.posterConfig }, () => {
            Poster.create(true);    // 入参：true为抹掉重新生成
          });
        }else{
          wx.navigateTo({
            url: '/pages/post/post'
          })
        }
      }else{
        wx.showToast({
          title:"生成海报失败，请检查网络",
          icon:'none'
        })
      }
    },3000)
})
