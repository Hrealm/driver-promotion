var app=getApp()

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
    items:[],
    imagePath:"",
    userInfo:{},
    hasUserInfo: false,
    avatarUrl:"",
  },
  onLoad: function () {
    this.setData({
      srcPath:app.globalData.imagePath,
      
      imagePath:app.globalData.imagePath
    })
  },
  //从canvas上生成图片
  createImageFromCanvas : function(){
    let self = this;
    let filePath=self.data.imagePath
    var openStatus=true;
    wx.getSetting({
      success(res) {
        // 如果没有则获取授权
        if (!res.authSetting['scope.writePhotosAlbum']) {
          if (result) {
            if (result.authSetting["scope.writePhotosAlbum"] === true){
              openStatus=true;
            }else{
              openStatus=false;
            }
          }
        }
      }
    })
    console.log("OpenStatus:"+openStatus);
     if (!openStatus) {
       wx.openSetting({
         success: (result) => {
           if (result) {
             if (result.authSetting["scope.writePhotosAlbum"] === true) {
               openStatus = true;
               wx.saveImageToPhotosAlbum({
                 filePath: filePath,
                 success() {
                   wx.showToast({
                     title: '图片保存成功，快去分享到朋友圈吧~',
                     icon: 'none',
                     duration: 2000
                   })
                 },
                 fail() {
                   wx.showToast({
                     title: '保存失败',
                     icon: 'none'
                   })
                 }
               })
             }
           }
         },
         fail: () => { },
         complete: () => { }
       });
     } else {
       wx.getSetting({
         success(res) {
           // 如果没有则获取授权
           if (!res.authSetting['scope.writePhotosAlbum']) {
             wx.authorize({
               scope: 'scope.writePhotosAlbum',
               success() {
                 openStatus = true
                 wx.saveImageToPhotosAlbum({
                   filePath: filePath,
                   success() {
                     wx.showToast({
                       title: '图片保存成功，快去分享到朋友圈吧~',
                       icon: 'none',
                       duration: 2000
                     })
                   },
                   fail() {
                     wx.showToast({
                       title: '保存失败',
                       icon: 'none'
                     })
                   }
                 })
               },
               fail() {
                 // 如果用户拒绝过或没有授权，则再次打开授权窗口
                 openStatus = false
                 console.log('请设置允许访问相册')
                 wx.showToast({
                   title: '请设置允许访问相册',
                   icon: 'none'
                 })
               }
             })
           } else {
             // 有则直接保存
             openStatus = true
             wx.saveImageToPhotosAlbum({
               filePath: filePath,
               success() {
                 wx.showToast({
                   title: '图片保存成功，快去分享到朋友圈吧~',
                   icon: 'none',
                   duration: 2000
                 })
               },
               fail() {
                 wx.showToast({
                   title: '保存失败',
                   icon: 'none'
                 })
               }
             })
           }
        },
         fail(err) {
           console.log(err)
         }
      })
    }
  },
  onShareAppMessage(res) {
    // 来自页面内转发按钮
    this.setData({
      hideModal:!this.data.hideModal
    })
    return {
        title: '快来，这里有现金红包！邀请司机注册认证就能免费领，邀请越多红包越大！',
        desc: '海量货源、专业客服报价',
        path: '/pages/register/register?scene='+app.globalData.ph, //多个参数拼接使用&连接
        imageUrl: '../../img/share_card.png'
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    self=this;
    wx.getUserInfo({
      success:function(res){   
        app.globalData.userInfo = e.detail.userInfo 
        self.setData({
          userInfo: e.detail.userInfo,
          hasUserInfo: true,
          hiddenCanvas:true
        })
      },
      fail:function(){
        wx.showToast({
          title: '生成海报需要您的信息',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  jumpToRulesPages:function(){
    wx.navigateTo({
      url: '/pages/rules/rules',
    })
  }
}
)