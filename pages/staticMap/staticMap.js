// pages/staticMap/staticMap.js
const amapFile = require('../../3rds/amap-wx.js');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: '',
    dfImg: '/resources/login_bg.jpg',
    userImg: '',
    weather: {},
    address: {},
    location: {},
    checkboxGroup: {}
  },
  // 更换背景图
  toChangeBgImg() {
    wx.chooseImage({
      count: 1,
      success: (tempFilePaths) => {

      }
    })
  },
  getFromStorage() {
    let param = {
      weather: wx.getStorageSync('weather'),
      address: wx.getStorageSync('address'),
      location: wx.getStorageSync('location'),
      checkboxGroup: wx.getStorageSync('checkboxGroup'),
    }
    this.setData(param)
  },
  canvasMaker() {
    
  },
  // 画画开始了
  setCanvans() {
    let ctx = wx.createCanvasContext('canvas')
    wx.downloadFile({
      url: this.data.src,
      success: ({ tempFilePath }) => {
        ctx.drawImage(tempFilePath, 0, 0, this.data.systemInfo.width, this.data.systemInfo.height)
        ctx.setGlobalAlpha(0.45)
        ctx.drawImage(this.data.dfImg, 0, 0, this.data.systemInfo.width, this.data.systemInfo.height)
        ctx.draw()
      }
    })
    
  },
  // 设置静态图
  setStaticMap() {
    let apmap = new amapFile.AMapWX({ key: app.globalData.appKey });
    let { longitude, latitude } = this.data.location
    wx.getSystemInfo({
      success: (data) => {
        var height = data.windowHeight;
        var width = data.windowWidth;
        var size = width + "*" + height;
        this.setData({
          systemInfo: {
            height,
            width
          }
        })
        apmap.getStaticmap({
          zoom: 14,
          size: size,
          scale: 2,
          location: `${longitude},${latitude}`,
          success: (data) => {
            this.setData({ src: data.url })
            this.setCanvans()
          },
          fail: (info) => {
            wx.showModal({ title: info.errMsg })
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    this.getFromStorage()
    this.setStaticMap()
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