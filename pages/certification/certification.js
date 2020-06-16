// pages/certification/certification.js
import cryptoJs from '../../utils/encryptUtil.js'
import lodash from '../../utils/lodash.js' //../../util切换成你存放lodash.js的路径 
var http = require('../../utils/request.js')

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    textBtn: '认证',
    type: '',
    _token: '',
    idCard_img: './img/idCard.png',
    driverCard_img: './img/driverCard.png',
    transportation_img: './img/transportation.png',
    vehicleHomepage_img: './img/vehicleHomepage.png',
    vehicleVicepage_img: './img/vehicleVicepage.png',
    lpc_Array: ['请输入车牌颜色', '黄牌', '蓝牌', '绿牌', '黄绿牌'],
    lpc_index: 0,
    multiArray: [
      [{
          'title': '请输入车型',
          'id': 0
        },
        {
          'title': '平板',
          'id': 1
        },
        {
          'title': '高栏',
          'id': 2
        },
        {
          'title': '中栏',
          'id': 3
        },
        {
          'title': '低栏',
          'id': 4
        },
        {
          'title': '厢式',
          'id': 5
        },
        {
          'title': '自卸',
          'id': 6
        },
        {
          'title': '保温',
          'id': 7
        },
        {
          'title': '冷藏',
          'id': 8
        },
        {
          'title': '危险品',
          'id': 9
        },
        {
          'title': '集装箱',
          'id': 10
        },
        {
          'title': '特种',
          'id': 11
        },
        // {
        //   'title': '其他',
        //   'id': 12
        // }
      ],
      [{
          'title': '车长',
          'id': 0
        },
        {
          'title': '4.2米',
          'id': 1
        },
        {
          'title': '5.0米',
          'id': 2
        },
        {
          'title': '6.2米',
          'id': 3
        },
        {
          'title': '6.8米',
          'id': 4
        },
        {
          'title': '7.2米',
          'id': 5
        },
        {
          'title': '7.7米',
          'id': 6
        },
        {
          'title': '7.8米',
          'id': 7
        },
        {
          'title': '8.2米',
          'id': 8
        },
        {
          'title': '8.7米',
          'id': 9
        },
        {
          'title': '9.6米',
          'id': 10
        },
        {
          'title': '12.5米',
          'id': 11
        },
        {
          'title': '13.0米',
          'id': 12
        },
        // {
        //   'title': '13.5米',
        //   'id': 18
        // },
        {
          'title': '14.6米',
          'id': 13
        },
        {
          'title': '15.0米',
          'id': 14
        },
        {
          'title': '16.5米',
          'id': 15
        },
        {
          'title': '17.5米',
          'id': 16
        },
        // {
        //   'title': '其他',
        //   'id': 17
        // }
      ]

    ],
    multiIndex: [0, 0],
    nameInput: '', //姓名
    idInput: '', //身份证
    licenseInput: '', //道路运输证号
    numberPlate: '', //车牌号
    total: '', //总质量
    idCard_url: '',
    driverCard_url: '',
    transportation_url: '',
    vehicleHomepage_url: '',
    vehicleVicepage_url: '',
    oil: '', //燃油类型
    vin: '', //车辆识别代号
    cwn: '', //车辆所有人
    cad: '', //注册地址
    wl: '', //核定载质量
    ctds: '', //车辆描述
    old_code: '',
    rne: '', //业户名称
    rop: '', //道路运输经营许可证编号
  },

  // 身份证
  idCard() {
    var that = this;
    var __token = this.data._token;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0];



        // that.setData({
        //   idCard_img: tempFilePaths
        // })

        wx.showLoading({
          title: '正在识别..',
        })

        var imgBase64 = wx.getFileSystemManager().readFileSync(tempFilePaths, "base64")

        wx.request({
          url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/idcard?access_token=' + __token,
          method: 'POST',
          data: {
            "image": imgBase64,
            "id_card_side": "front"
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          success: res => {
            
            if (res.data.error_msg || res.data.words_result.姓名.words == "") {
              wx.hideLoading({
                complete: (res) => {},
              })
              wx.showModal({
                title: '提示',
                content: '身份证无法识别，请重新上传！',
              })
              return
            }
            wx.hideLoading({
              complete: (res) => {},
            })
            this.setData({
              nameInput: res.data.words_result.姓名.words,
              idCard_img: tempFilePaths
            })
            
            // console.log(res.data)
          },
          fail: e=>{
            wx.hideLoading({
              complete: (res) => {},
            });
            wx.showModal({
              title: '识别失败',
              content: e
            })
          }
        })

        wx.request({
          url: http.root + '60002',
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          data: {
            "hd": {
              "pi": 60002,
              "si": '',
              "sq": 59
            },
            "bd": {
              "pte": 5,
              "img": imgBase64,
              "pn": ''
            }
          },
          success: res => {
            this.setData({
              idCard_url: JSON.parse(res.data.bd).url
            })
          },
          fail: e => {
            console.log(e)
          }
        })



      }
    })
  },
  bindNameInput: function(e) {
    this.setData({
      nameInput: e.detail.value
    })
  },
  // 驾驶证
  driverCard() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0];

        // that.setData({
        //   driverCard_img: tempFilePaths
        // })
        wx.showLoading({
          title: '正在识别..',
        })

        var imgBase64 = wx.getFileSystemManager().readFileSync(tempFilePaths, "base64")
        wx.request({
          url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/driving_license?access_token=' + this.data._token,
          method: 'POST',
          data: {
            "image": imgBase64
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          success: res => {
            console.log(res.data)
            if (res.data.error_msg || res.data.words_result.证号.words == "") {
              wx.hideLoading({
                complete: (res) => {},
              })
              wx.showModal({
                title: '提示',
                content: '驾驶证无法识别，请重新上传！',
              })
              return
            }
            wx.hideLoading({
              complete: (res) => {},
            })
            this.setData({
              idInput: res.data.words_result.证号.words,
              driverCard_img: tempFilePaths
            })

          },
          fail:e=>{
            wx.hideLoading({
              complete: (res) => {},
            });
            wx.showModal({
              title: '识别失败',
              content: e
            })
          }
        })

        wx.request({
          url: http.root + '60002',
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          data: {
            "hd": {
              "pi": 60002,
              "si": '',
              "sq": 59
            },
            "bd": {
              "pte": 6,
              "img": imgBase64,
              "pn": ''
            }
          },
          success: res => {
            this.setData({
              driverCard_url: JSON.parse(res.data.bd).url
            })
          },
          fail: e => {
            console.log(e)
          }
        })

      }
    })
  },
  bindIdInput: function(e) {
    this.setData({
      idInput: e.detail.value
    })
  },
  // 道路运输证
  transportationCard() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0];

        // that.setData({
        //   transportation_img: tempFilePaths
        // })
        wx.showLoading({
          title: '正在识别..',
        })

        var imgBase64 = wx.getFileSystemManager().readFileSync(tempFilePaths, "base64")

        new Promise((resolve, reject)=>{
          wx.request({
            // url: 'http://vtrade.gdzxjy.net/60002',
            url: http.imgUrl + '60002',
            method: 'POST',
            header: {
              'content-type': 'application/json'
            },
            data: {
              "hd": {
                "pi": 60002,
                "si": '',
                "sq": 59
              },
              "bd": {
                "pte": 6,
                "img": imgBase64,
                "pn": ''
              }
            },
            success: res => {
              this.setData({
                transportation_url: JSON.parse(res.data.bd).url
              });
              resolve();
            },
            fail: e => {
              wx.hideLoading({
                complete: (res) => {},
              })
              wx.showModal({
                title: '识别失败',
                content: e
              })
              // console.log(e)
            }
          })
        }).then(()=>{
          wx.request({
            url: http.root + '11017',
            method: 'POST',
            header: {
              'content-type': 'application/json'
            },
            data: {
              "hd": {
                "pi": 11017,
                "sq": 59
              },
              "bd": {
                "url": this.data.transportation_url
              }
            },
            success: res => {
              // console.log(res.data)
              if((typeof res.data.bd) == 'undefined'){
                wx.hideLoading({
                  complete: (res) => {},
                })
                wx.showModal({
                  title: '提示',
                  content: '道路运输证无法识别，请重新上传！',
                })
                return
              }
              if (JSON.parse(res.data.bd)){
                var obj = JSON.parse(res.data.bd)
                console.log(obj)
                if(obj.ownerName == ''){
                  wx.hideLoading({
                    complete: (res) => {},
                  })
                  wx.showModal({
                    title: '提示',
                    content: '道路运输证中 "业户名称" 无法识别，请重新拍照上传！',
                    showCancel: false
                  })
                  return
                }
                // if(obj.businessCertificate == ''){
                //   wx.hideLoading({
                //     complete: (res) => {},
                //   })
                //   wx.showModal({
                //     title: '提示',
                //     content: '道路运输证中 "道路运输经营许可证编号" 无法识别，请重新拍照上传！',
                //     showCancel: false
                //   })
                //   return
                // }

                this.setData({
                  licenseInput: obj.licenseNumber,
                  rne: obj.ownerName,
                  rop: obj.businessCertificate,
                  transportation_img: tempFilePaths
                })
                wx.hideLoading({
                  complete: (res) => {},
                })
              }else{
                wx.hideLoading({
                  complete: (res) => {},
                })
                wx.showModal({
                  title: '识别失败',
                  content: '识别超时，请重试。'
                })
              }

            },
            fail: e => {
              wx.hideLoading({
                complete: (res) => {},
              })
              wx.showModal({
                title: '识别失败',
                content: e
              })
            }
          })
        })

      }
    })
  },
  bindLicenseInput: function(e) {
    this.setData({
      licenseInput: e.detail.value
    })
  },

  // 行驶证-主
  vehicleHomepage() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0];
        // that.setData({
        //   vehicleHomepage_img: tempFilePaths
        // })
        wx.showLoading({
          title: '正在识别..',
        })

        var imgBase64 = wx.getFileSystemManager().readFileSync(tempFilePaths, "base64")
        wx.request({
          url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/vehicle_license?access_token=' + this.data._token,
          method: 'POST',
          data: {
            "image": imgBase64,
            "vehicle_license_side": "front"
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          success: res => {
            if (JSON.stringify(res.data.words_result) == '{}' || res.data.error_msg || res.data.words_result.号牌号码.words == "") {
              wx.hideLoading({
                complete: (res) => {},
              })
              wx.showModal({
                title: '提示',
                content: '行驶证主页无法识别，请重新上传！',
              })
              return
            }
            // console.log(res.data.words_result)
            if(!res.data.words_result.车辆识别代号){
              wx.hideLoading({
                complete: (res) => {},
              })
              wx.showModal({
                title: '提示',
                content: '行驶证主页无法识别，请重新上传行驶证主页！',
                showCancel: false
              })
              return
            }

            if(res.data.words_result.住址.words == ''){
              wx.hideLoading({
                complete: (res) => {},
              })
              wx.showModal({
                title: '提示',
                content: '行驶证主页无法识别，请重新上传！',
                showCancel: false
              })
              return
            }

            this.setData({
              numberPlate: res.data.words_result.号牌号码.words,
              vin: res.data.words_result.车辆识别代号.words,
              cwn: res.data.words_result.所有人.words,
              cad: res.data.words_result.住址.words,
              ctds: res.data.words_result.车辆类型.words,
              vehicleHomepage_img: tempFilePaths
            })
            wx.hideLoading({
              complete: (res) => {},
            })
            // console.log(this.data.vin);
          },
          fail: e =>{
            wx.hideLoading({
              complete: (res) => {},
            })
            wx.showModal({
              title:'识别失败',
              cancelColor: e
            })
          }
        })

        wx.request({
          url: http.root + '60002',
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          data: {
            "hd": {
              "pi": 60002,
              "si": '',
              "sq": 59
            },
            "bd": {
              "pte": 7,
              "img": imgBase64,
              "pn": ''
            }
          },
          success: res => {
            this.setData({
              vehicleHomepage_url: JSON.parse(res.data.bd).url
            })
          },
          fail: e => {
            console.log(e)
          }
        })

      }
    })
  },
  bindNumberPlate: function(e) {
    this.setData({
      numberPlate: e.detail.value
    })
  },
  // 行驶证-副
  vehicleVicepage() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0];
        // that.setData({
        //   vehicleVicepage_img: tempFilePaths
        // })
        wx.showLoading({
          title: '正在识别..',
        })

        var imgBase64 = wx.getFileSystemManager().readFileSync(tempFilePaths, "base64")
        wx.request({
          url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/vehicle_license?access_token=' + this.data._token,
          method: 'POST',
          data: {
            "image": imgBase64,
            "vehicle_license_side": "back"
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          success: res => {
            // if (res.data.error_msg || res.data.words_result.总质量.words == "") {
            //   wx.hideLoading({
            //     complete: (res) => {},
            //   })
            //   wx.showModal({
            //     title: '提示',
            //     content: '行驶证副页无法识别，请重新上传！',
            //   })
            //   return
            // }

            // if(res.data.words_result.核定载质量.words == ""){
            //   wx.hideLoading({
            //     complete: (res) => {},
            //   })
            //   wx.showModal({
            //     title: '提示',
            //     content: '行驶证副页 "核定载质量" 无法识别，请重新拍照上传！',
            //     showCancel: false
            //   })
            //   return
            // }

            this.setData({
              total: res.data.words_result.总质量.words,
              oil: res.data.words_result.燃油类型.words,
              wl: res.data.words_result.核定载质量.words,
              vehicleVicepage_img: tempFilePaths
            })
            wx.hideLoading({
              complete: (res) => {},
            })
            // console.log(res.data)
          },
          fail: e=>{
            wx.hideLoading({
              complete: (res) => {},
            })
            wx.showModal({
              title:'识别失败',
              cancelColor: e
            })
          }
        })

        wx.request({
          url: http.root + '60002',
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          data: {
            "hd": {
              "pi": 60002,
              "si": '',
              "sq": 59
            },
            "bd": {
              "pte": 7,
              "img": imgBase64,
              "pn": ''
            }
          },
          success: res => {
            this.setData({
              vehicleVicepage_url: JSON.parse(res.data.bd).url
            })
          },
          fail: e => {
            console.log(e)
          }
        })

      }
    })
  },
  bindtotal: function(e) {
    this.setData({
      total: e.detail.value
    })
  },
  //车辆类型 
  bindctds: function(e){
    this.setData({
      ctds: e.detail.ctds
    })
  },
  //核定载质量 
  bindwl: function(e){
    this.setData({
      wl: e.detail.wl
    })
  },
  //车辆识别代号 
  bindvin: function(e){
    this.setData({
      vin: e.detail.vin
    })
  },
  //车辆所有人 
  bindcwn: function(e){
    this.setData({
      cwn: e.detail.cwn
    })
  },

  // 车牌颜色
  bindColorChange(e) {
    this.setData({
      lpc_index: e.detail.value
    })
  },
  // 车型车长
  bindMultiPickerChange: function(e) {
    this.setData({
      multiIndex: e.detail.value
    })
    // console.log(this.data.multiIndex)
  },
  // 注册
  submit: lodash.throttle(function(e) {

    // console.log('submit=' + this.data.vin)

    if (this.data.idCard_url == '') {
      wx.showModal({
        title: '提示',
        content: '请选择上传身份证正面。',
        showCancel: false
      })
      return
    }

    if (this.data.driverCard_url == '') {
      wx.showModal({
        title: '提示',
        content: '请选择上传驾驶证正面。',
        showCancel: false
      })
      return
    }

    // if (this.data.transportation_url == '') {
    //   wx.showModal({
    //     title: '提示',
    //     content: '请选择上传道路运输证。',
    //     showCancel: false
    //   })
    //   return
    // }

    if (this.data.vehicleHomepage_url == '') {
      wx.showModal({
        title: '提示',
        content: '请选择上传行驶证主页。',
        showCancel: false
      })
      return
    }

    if (this.data.vehicleVicepage_url == '') {
      wx.showModal({
        title: '提示',
        content: '请选择上传行驶证副页。',
        showCancel: false
      })
      return
    }

    if (this.data.nameInput == '') {
      wx.showModal({
        title: '提示',
        content: '姓名不能为空，请输入姓名。',
        showCancel: false
      })
      return
    }
    if (this.data.idInput == '') {
      wx.showModal({
        title: '提示',
        content: '身份证号码不能为空，请输入。',
        showCancel: false
      })
      return
    }

    // if (this.data.licenseInput == '') {
    //   wx.showModal({
    //     title: '提示',
    //     content: '道路运输证号不能为空，请输入。',
    //     showCancel: false
    //   })
    //   return
    // }

    // if(this.data.rne == ''){
    //   wx.showModal({
    //     title: '提示',
    //     content: '道路运输证中 "业户名称" 无法识别，请重新拍照上传！',
    //     showCancel: false
    //   })
    //   return
    // }

    // if(this.data.rop == ''){
    //   wx.showModal({
    //     title: '提示',
    //     content: '道路运输证中 "道路运输经营许可证编号" 无法识别，请重新拍照上传！',
    //     showCancel: false
    //   })
    //   return
    // }

    if (this.data.numberPlate == '') {
      wx.showModal({
        title: '提示',
        content: '车牌号不能为空，请输入。',
        showCancel: false
      })
      return
    }

    if (!(/[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}/.test(this.data.numberPlate))) {
      wx.showModal({
        title: '提示',
        content: '请输入有效的车牌号',
        showCancel: false
      })
      return
    }

    if(this.data.vin == ''){
      wx.showModal({
        title: '提示',
        content: '行驶证主页 "车辆识别代号" 无法识别，请重新拍照上传或者手动输入！',
        showCancel: false
      })
      return
    }

    if(this.data.cwn == ''){
      wx.showModal({
        title: '提示',
        content: '行驶证主页 "车辆所有人" 无法识别，请重新拍照上传或者手动输入！',
        showCancel: false
      })
      return
    }

    if(this.data.cad == ''){
      wx.showModal({
        title: '提示',
        content: '行驶证主页 "注册地址" 无法识别，请重新拍照上传！',
        showCancel: false
      })
      return
    }

    if(this.data.ctds == ''){
      wx.showModal({
        title: '提示',
        content: '行驶证主页 "车辆描述" 无法识别，请重新拍照上传或者手动输入！',
        showCancel: false
      })
      return
    }


    if (this.data.total == '') {
      wx.showModal({
        title: '提示',
        content: '总质量不能为空，请输入。',
        showCancel: false
      })
      return
    }

    if(this.data.wl == ''){
      wx.showModal({
        title: '提示',
        content: '行驶证副页 "核定载质量" 无法识别，请重新拍照上传或者手动输入！',
        showCancel: false
      })
      return
    }


    if (this.data.lpc_index == 0) {
      wx.showModal({
        title: '提示',
        content: '请选择车牌颜色',
        showCancel: false
      })
      return
    }
    if (this.data.multiIndex[0] == 0 || this.data.multiIndex[1] == 0) {
      wx.showModal({
        title: '提示',
        content: '请选择车型车长',
        showCancel: false
      })
      return
    }

    wx.showLoading({
      title: this.data.textBtn == '注册' ? '正在注册...' : '正在认证...',
    })

    wx.request({
      url: http.root + '11011',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        "hd": {
          "pi": 11011,
          "si": '',
          "sq": 59
        },
        "bd": {
          "tid": app.globalData.tid,
          "ne": this.data.nameInput,
          "idc": this.data.idInput,
          "cu": this.data.idCard_url,
          "jpc": this.data.driverCard_url,
          "xpcf": this.data.vehicleHomepage_url,
          "xpcb": this.data.vehicleVicepage_url,
          "cn": this.data.numberPlate,
          "ct": this.data.multiArray[0][this.data.multiIndex[0]].id,
          "cl": this.data.multiArray[1][this.data.multiIndex[1]].id,
          "ctds": this.data.ctds,
          "cc": this.data.lpc_Array[this.data.lpc_index],
          "oil": this.data.oil,
          "vin": this.data.vin,
          "cwn": this.data.cwn,
          "cad": this.data.cad,
          "ws": this.data.total,
          "wl": this.data.wl,
          "rpc": this.data.transportation_url,
          "rne": this.data.rne,
          "rcd": this.data.licenseInput,
          "rop": this.data.rop
        }
      },
      success: res => {

        if (res.data.hd.rid >= 0) {
          if (this.data.textBtn == '注册') {
            wx.request({
              url: http.root + '11015',
              method: 'POST',
              header: {
                'content-type': 'application/json'
              },
              data: {
                "hd": {
                  "pi": 11015,
                  "sq": 59
                },
                "bd": {
                  "ls": 32,
                  "an": app.globalData.ph,
                  "code": app.globalData.old_code
                }
              },
              success: res => {
                console.log(res)
                wx.hideLoading()
                if (res.data.hd.rid >= 0) {
                  var obj = JSON.parse(res.data.bd);
                  var key = cryptoJs.md5(app.globalData.ph + '_' + app.globalData.old_code, 3)
                  var _sk = cryptoJs.decrypt(obj.ct, key).split("|")[0];
                  // console.log(_sk);
                  // app.globalData._ct = cryptoJs.decrypt(obj.ct, key);
                  app.globalData._sessionkey = _sk;
                  app.globalData._si = obj.si;
                  app.globalData._em = obj.em;
                  // console.log(app.globalData)
                  wx.switchTab({
                    url: '../qutation/qutation',
                  })
                } else {
                  wx.showModal({
                    title: '提示',
                    content: res.data.hd.rmsg,
                    showCancel: false,
                  })
                  return
                }
              }
            })
          } else {
            if (this.data.type == 'login') {
              wx.switchTab({
                url: '../qutation/qutation',
              })
            } else {
              wx.showModal({
                title: '认证成功',
                showCancel: false,
                success(res) {
                  wx.navigateBack({
                    complete: (res) => {},
                  })
                }
              })
            }

          }
        } else {
          wx.hideLoading()
          wx.showModal({
            title: '认证失败',
            content: res.data.hd.rmsg,
            showCancel: false
          })
          return
        }

        // console.log(res.data)
        // wx.switchTab({
        //   url: '../qutation/qutation',
        // })
      },
      fail: e => {
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: e,
          showCancel: false
        })
      }
    })
    // wx.switchTab({
    //   url: '../qutation/qutation',
    // })

  }, 1000),

  // 图片识别
  recognition: function(type, data) {
    // wx.request({
    //   // url: `https://aip.baidubce.com/rest/2.0/ocr/v1/driving_license?access_token=${this._token}`,
    //   url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/' + type + '?' + 'access_token=' + this.data._token,
    //   method: 'POST',
    //   data: data,
    //   header: {
    //     'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    //   },
    //   success: res => {
    //     return res.data;
    //   }
    // })
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
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
        // console.log(this.data._token)
      }
    })

    if (options.register_txt) {
      this.setData({
        textBtn: options.register_txt,
        old_code: options.old_code
      })
    }
    if (options.certification_txt) {
      this.setData({
        textBtn: options.certification_txt
      })
    }

    if (options.type) {
      this.setData({
        type: options.type
      })
    }

    console.log(app.globalData.ph)

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})