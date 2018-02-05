// pages/staticMap/staticMap.js
const amapFile = require('../../3rds/amap-wx.js');
const app = getApp()
const map = 'map'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    src: '',
    dfImg: '/resources/login_bg.jpg',
    userImg: '',
    mapImg: '',
    mapInfo: {},
    loading: true
  },
  loading(bool) {
    this.setData({
      loading : bool || false
    })
  },
  // 更换背景图
  toChangeBgImg() {
    wx.chooseImage({
      count: 1,
      success: ({ tempFilePaths }) => {
        this.setData({ userImg: tempFilePaths[0] })
        this.canvasMaker()
      },
      fail: () => {
        // 没选择任何图片时
        this.loading(false)
      }
    })
  },
  // 读取本地缓存数据
  getFromStorage() {
    let mapInfo = wx.getStorageSync('mapInfo')
    this.setData({mapInfo})
  },
  canvasMaker() {
    let img = this.data.userImg || this.data.dfImg
    let ctx = wx.createCanvasContext('canvas')
    let sysWidth = this.data.systemInfo.width
    let sysHeight = this.data.systemInfo.height
    ctx.clearRect(0, 0, sysWidth, sysHeight)
    ctx.drawImage(img, 0, 0, sysWidth, sysHeight)
    // todo-此处用png图修改
    ctx.setGlobalAlpha(0.25)
    const grd = ctx.createCircularGradient(sysWidth / 2, sysHeight / 2, sysHeight / 2)
    grd.addColorStop(0, 'white')
    grd.addColorStop(1, 'black')
    ctx.setFillStyle(grd)
    ctx.fillRect(0, 0, sysWidth, sysHeight)
    // --
    ctx.setGlobalAlpha(0.75)
    ctx.drawImage(this.data.mapImg, 0, 0, sysWidth, sysHeight)
    ctx.draw()
    this.loading(false)
  },
  // 画画开始了
  setCanvans() {
    wx.downloadFile({
      url: this.data.src,
      success: ({ tempFilePath }) => {
        this.setData({ mapImg: tempFilePath })
        this.canvasMaker()
      }
    })
  },
  // 设置静态图
  setStaticMap() {
    let apmap = new amapFile.AMapWX({ key: app.globalData.appKey });
    let { longitude, latitude } = this.data.mapInfo
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
  onLoad(option) {
    this.getFromStorage()
    this.setStaticMap()
  },
  onShow() {
    
  },
  onHide() {
    // 选择照片时加载
    this.loading(true)
  }
})