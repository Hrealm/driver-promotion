// pages/qutation/qutation.js
import cryptoJs from '../../utils/encryptUtil.js'
import area from '../region_picker/area.js';
var app = getApp()
var page = 1
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
    isQueryDataInit:false,
    isRegister:false,
    items:[],
    carLong:app.globalData.carLongDict,
    carType:app.globalData.carTypeDict,
    tabTxt: [
      {
          'text': '起始地',
          'position':0,
          'originalText': '起始地',
          'active': false,
          'type': 0
      },
      {
          'text': '目的地',
          'position':1,
          'originalText': '目的地',
          'active': false,
          'type': 0
      }
    ],
    activeIndex:-1,
    startItem:undefined,
    endItem:undefined,
    provinces: area,
    startmultiArray: [area, area[0].childs, area[0].childs[0].childs],
    endmultiArray: [area, area[0].childs, area[0].childs[0].childs],
    startmultiIndex: [0, 0, 0],
    endmultiIndex: [0, 0, 0],
  },

  onLoad: function(options) {
    console.log(options.scene)
    if (options.scene) {
      app.globalData.inviter =  options.scene
    }
  },

  onShow: function () {
    console.log("onshow qutation")
    if(app.isRegister()){
      if(!this.data.isQueryDataInit){
        this.loadData()
      }
      this.setData({
        isQueryDataInit:true,
        isRegister:true  
      })

      this.queryQualificationInfo()

    }else{
      this.setData({
        isQueryDataInit:false,
        isRegister:false
      })
    }
  },
  
  toLogin:function(){
    wx.navigateTo({
      url:  '../login/login'
    })
  },

  turnToCertificate:function(){
    wx.navigateTo({
      url:  '../certification/certification'
    })
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

      if(info.iscq == 2 ){
        wx.hideLoading({
          complete: (res) => {},
        })
        myself.setData({
          show: false    
        })
      }else{
        myself.queryCarAuthList()
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
      return
    }

    if (rest.hd.rid == 0) {
      var infoString =app.emDecrptInfo(rest.bd)
      const info = JSON.parse(infoString)
      if(info.olst.length == 0 || info.olst[0].st == 0||info.olst[0].st == 3){
        myself.setData({
          show: true    
        })
      }else{
        myself.setData({
          show: false    
        })
      }
    }

  }); 
},

  loadData:function(){
    const bdinfo = { "tid": app.globalData.tid, "pg": page, "sz": 20,"zid":this.data.startItem == undefined ? "":this.data.startItem.id , "xid":this.data.endItem == undefined ? "":this.data.endItem.id}
    const cryptoString = app.emQueryInfo(JSON.stringify(bdinfo))
    var queryInfo =  { "hd": { "pi": "30068", "si": app.globalData._si }, "bd": cryptoString}
    var myself = this
    // console.log(queryInfo)
    app.func.req('30068', queryInfo, function (rest) {
      wx.stopPullDownRefresh({
        complete: (res) => {},
      })

      // console.log(rest)
  
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

  turnBase: function(){
    wx.switchTab({
      url: '../logs/logs',
    })
  },

  filterTab: function (e) {
    var that = this;
    var data = JSON.parse(JSON.stringify(that.data.tabTxt));
    var index = e.currentTarget.dataset.index;
    var newTabTxt = data.map(function (e) {
        e.active = false;
        return e;
    });
    newTabTxt[index].active = !that.data.tabTxt[index].active;
    this.setData({
        tabTxt: data,
        activeIndex:index
    })

  },
  filterTabChild: function (e) {
    //我需要切换选中项 修改展示文字 并收回抽屉  
    var that = this;
    var index = e.currentTarget.dataset.index;
    var data = JSON.parse(JSON.stringify(that.data.tabTxt));
    if (typeof (e.target.dataset.id) == 'undefined' || e.target.dataset.id == '') {
        data[index].active = !that.data.tabTxt[index].active;
    }
    else {
        data[index].type = e.target.dataset.id;
        data[index].active = !that.data.tabTxt[index].active;
        if (e.target.dataset.id=='0'){
            data[index].text = that.data.tabTxt[index].originalText;
            //不限删除条件
            delete that.data.searchParam[index];
        }
        else{
            data[index].text = e.target.dataset.txt;
            //更改删除条件
            that.data.searchParam[index] = data[index].text;
        }
        
        
    }

    that.setData({
        tabTxt: data
    })
    // console.log(that.data.searchParam);

  },
  bindcancel:function(e){
    var that = this;
    var data = JSON.parse(JSON.stringify(that.data.tabTxt));
    var newTabTxt = data.map(function (e) {
        e.active = false;
        return e;
    });
    this.setData({
        tabTxt: newTabTxt
    })
  },
  //点击确定
  bindMultiPickerChange: function (e) {
    var that = this;
    var data = JSON.parse(JSON.stringify(that.data.tabTxt));
    const indexs = e.detail.value
    const item = this.data.provinces[indexs[0]].childs[indexs[1]].childs[indexs[2]]
    if(this.data.activeIndex == 0){
      data[0].active = false
      data[0].text = item.names
      this.setData({
        startmultiIndex: e.detail.value,
        tabTxt: data,
        startItem:item
      })
    }else{
      data[1].active = false
      data[1].text = item.names
      this.setData({
        endmultiIndex: e.detail.value,
        tabTxt: data,
        endItem:item
      })
    }

    page = 1
    this.loadData()
  },
  //滑动
  bindMultiPickerColumnChange: function(e){
    // console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      multiArray: this.data.activeIndex == 0 ? this.data.startmultiArray:this.data.endmultiArray,
      multiIndex: this.data.activeIndex == 0 ? this.data.startmultiIndex:this.data.endmultiIndex
    };
    
    //更新滑动的第几列e.detail.column的数组下标值e.detail.value
    data.multiIndex[e.detail.column] = e.detail.value;
    //如果更新的是第一列“省”，第二列“市”和第三列“区”的数组下标置为0
    if (e.detail.column == 0){
      data.multiIndex = [e.detail.value,0,0];
    } else if (e.detail.column == 1){
      //如果更新的是第二列“市”，第一列“省”的下标不变，第三列“区”的数组下标置为0
      data.multiIndex = [data.multiIndex[0], e.detail.value, 0];
    } else if (e.detail.column == 2) {
      //如果更新的是第三列“区”，第一列“省”和第二列“市”的值均不变。
      data.multiIndex = [data.multiIndex[0], data.multiIndex[1], e.detail.value];
    }
    var temp = this.data.provinces;
    data.multiArray[0] = temp;
    if ((temp[data.multiIndex[0]].childs).length > 0){
      //如果第二列“市”的个数大于0,通过multiIndex变更multiArray[1]的值
      data.multiArray[1] = temp[data.multiIndex[0]].childs;
      var areaArr = (temp[data.multiIndex[0]].childs[data.multiIndex[1]]).childs;
      //如果第三列“区”的个数大于0,通过multiIndex变更multiArray[2]的值；否则赋值为空数组
      data.multiArray[2] = areaArr.length > 0 ? areaArr : [];
    }else{
      //如果第二列“市”的个数不大于0，那么第二列“市”和第三列“区”都赋值为空数组
      data.multiArray[1] = [];
      data.multiArray[2] = [];
    }
    //data.multiArray = [temp, temp[data.multiIndex[0]].citys, temp[data.multiIndex[0]].citys[data.multiIndex[1]].areas];
    //setData更新数据

    if(this.data.activeIndex == 0){
      this.setData({
        startmultiArray: data.multiArray,
        startmultiIndex: data.multiIndex
      });
    }else{
      this.setData({
        endmultiArray: data.multiArray,
        endmultiIndex: data.multiIndex
      });
    }
    
  }
 
})
