const util = require('../../utils/util.js')
const end = 'end'
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    mapCtx: null,
    userInfo: null,
    markers: [],
    controls: [],
    scale: 14,
    location: {
      longitude: 0,   // 经度
      latitude: 0,    // 纬度
      speed: 0,       // 速度
      altitude: 0     // 高度
    }
  },
  // 跳转到静态图页面
  toStaticMap() {
    let markers = this.data.markers.map((item, index) => {
      return `${item.longitude},${item.latitude}`
    }).join(';')
    
    // wx.navigateTo({
    //   url: 
    // })
  },
  // 监听拖动地图事件
  regionchange(e) {
    switch(e.type) {
      case end:
        this.mapCtx.getCenterLocation({
          success: (data) => {
            let { longitude, latitude } = data
            let { speed, altitude } = this.data.location
            this.setData({
              location: { speed, altitude, latitude, longitude },
              markers: util.setMarkers({ latitude, longitude })
            })
          }
        })
        break;
    }
  },
  // 设置地理信息
  setLocation() {
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success: (data) => {
        let { longitude, latitude, speed, altitude } = data
        this.setData({
          location: { longitude, latitude, speed, altitude },
          markers: util.setMarkers({ latitude, longitude })
        })
      }
    })
  },
  // 获取并存储用户信息
  setUserInfo() {
    let userInfo = app.globalData.userInfo
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      })
      return;
    }
    wx.getUserInfo({
      withCredentials: true,
      success: (data) => {
        this.setData({
          userInfo: data.userInfo
        })
      }
    })
  },
  onLoad: function (options) {
    // 创建map上下文
    this.mapCtx = wx.createMapContext('map')
    // 获取当前地理位置信息
    this.setLocation()
    // 获取用户信息
    this.setUserInfo()
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
  
  }
})