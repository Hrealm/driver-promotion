
//测试环境
var rootDocment = "http://192.168.0.231:9010/"
var mimicPanelUrl = "http://vtrade.gdzxjy.net/"  //测试使用模拟盘图片路径

//实盘环境
// var rootDocment = "https://trade.gdzxjy.net/"
// var mimicPanelUrl = "https://trade.gdzxjy.net/"


function req(pi,data,cb){
  wx.request({
    url: rootDocment+pi,
    data:data,
    method:'post',
    header:{'Content-Type':'application/json'},
    success: function(res){
      return typeof cb == "function" && cb(res.data)
    },
    fail:function(){
      return typeof cb == "function" && cb(false)
    }
  })
}

module.exports = {
  req:req,
  root:rootDocment,
  imgUrl:mimicPanelUrl
}