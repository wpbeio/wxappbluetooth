// pages/ble/ble.js
// const app = getApp()
var bleOk = false
var devices_list = []
var connectedDeviceId
var err = ''
Page({

  /**
   * 页面的初始数据
   */

  data: {
    // resdata: 'wushuju',
    devices_list: [],
    searching: false

  },
  //buffer转字符串
  ab2hex: function (buffer) {
    var hexArr = Array.prototype.map.call(
      new Uint8Array(buffer),
      function (bit) {
        return ('00' + bit.toString(16)).slice(-2)
      }
    )
    return hexArr.join('');
  },
  unionarray: function (array1, array2) {
    var newarray = array1.concat(array2)
    return Array.from(new Set(newarray))
  },
  searchBle: function () {
    var that = this;

    if (!that.data.searching) {
      // 
      wx.closeBluetoothAdapter({//防止错误先进行关闭
        complete: function (res) {
          wx.openBluetoothAdapter({//开启蓝牙
            success: function (res) {
              wx.onBluetoothAdapterStateChange(function (res) {//监听蓝牙状态
                console.log(res)

                if (!res.available) {
                  that.setData({
                    devices_list: [],
                    searching: false
                  })
                }
                else {
                  that.setData({
                    searching: res.discovering
                  })
                }
              });
              wx.startBluetoothDevicesDiscovery({
                success: function (res) { },
              })
              // wx.getBluetoothAdapterState({//获取蓝牙适配器状态
              // success: function (res) {
              console.log("是否可用：" + res.available + '\n' + '是否在搜索：' + res.discovering);
              // if (res.available)//如果可用
              // {
              //   if (!res.discovering) //且不处于搜索状态，开始进行搜索
              //   {

              // wx.showLoading({
              //   title: '正在搜索',
              // });
              wx.onBluetoothDeviceFound(function (res) {//每次出现的新设备为一台
                console.log('new device list has founded');
                console.dir(res["devices"]);
                // console.log(that.ab2hex(res["devices"][0].advertisData));
                var devices = res["devices"];
                //var len = devices.length;
                //取出不同的设备
                devices_list = that.unionarray(devices_list, devices)
                for (var i = 0; i < devices_list.length; i++) {
                  devices_list[i].advertisData = that.ab2hex(devices_list[i].advertisData)
                }
                // if (devices.length > 0) {
                //   for (y in devices) {
                //     if (devices_list.length == 0) {
                //       y.advertisData = that.ab2hex(y.advertisData)
                //       devices_list.push(y)
                //     }
                //     else {
                //       for (x in devices_list) {
                //         if (x.deviceId == y.devideId) {

                //         }
                //         else {
                //           y.advertisData = that.ab2hex(y.advertisData)
                //           devices_list.push(y)
                //         }
                //       }
                //     }
                //   }
                // }
                that.setData({
                  devices_list: devices_list
                });
              });
              // wx.getBluetoothDevices({//获取新设备
              //   success: function (res) {
              //     console.log('new device list has founded');
              //     console.dir(res["devices"]);
              //     console.log(that.ab2hex(res["devices"][0].advertisData));
              //     var devices = res["devices"];
              //     var len = devices.length;
              //     if (len) {
              //       for (var i = 0; i < len; i++) {
              //         devices_list = devices;
              //         devices_list.advertisData = that.ab2hex(devices_list.advertisData)
              //       }
              //     }
              //     that.setData({
              //       devices_list: devices_list
              //     });
              //   },
              //   fail: function (res) {
              //     wx.showModal({
              //       title: '提示',
              //       content: '搜索错误',
              //     });
              //   },
              // });
              wx.startBluetoothDevicesDiscovery({
                allowDuplicatesKey: false,
                success: function (res) {
                  console.log(res)
                  that.setData({
                    searching: true,
                    devices_list: []
                  })
                }
              });
              //   }
              // }
              // },
              // })

            },
            fail: function (res) {
              that.setData({
                resdata: res.errMsg
              })
            }
          })
        },
      })

    }
  },
  bindcloseble: function () {
    var that = this
    wx.closeBluetoothAdapter({
      success: function (res) {
        that.setData({
          resdata: res.errMsg
        })
      },
      fail: function (res) {
        that.setData({
          resdata: res.errMsg
        })
      }

    })

  },
  // verA版本比verB版本大返回true
  versionCompare: function (verA, verB) {
    var versionA = verA.split('.');
    var versionB = verB.split('.');
    var flag = true
    // 优先比较大版本号
    for (var i = 0; i <= versionA.length - 1; i++) {
      if (parseInt(versionA[i]) > parseInt(versionB[i])) {
        flag = true
        break
      }
      else
        flag = false
    }
    return flag
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取微信运行信息，手机版本，微信版本

    var platform;
    var wxversion;
    wx.getSystemInfo({
      success: function (res) {
        // console.log(res.model)
        // console.log(res.pixelRatio)
        // console.log(res.windowWidth)
        // console.log(res.windowHeight)
        // console.log(res.language)
        platform = res.platform;
        wxversion = res.version;
      }
    })
    console.log(wxversion + platform);
    if (!this.versionCompare(wxversion, '6.5.7') && platform == 'android') {
      wx.showModal({
        title: '错误',
        content: '微信版本号过低，请升级微信至最新版本',
      })
    }
    else if (!this.versionCompare(wxversion, '6.5.6') && platform == 'ios') {
      wx.showModal({
        title: '错误',
        content: '微信版本号过低，请升级微信至最新版本',
      });
    }
    else {
      bleOk = true
      wx.showModal({
        title: '成功',
        content: '该版本可以使用蓝牙',
      })
    }
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
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.log(res.errMsg)
      }
    })

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

  }
})