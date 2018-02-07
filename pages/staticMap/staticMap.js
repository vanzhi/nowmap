// pages/staticMap/staticMap.js
const baseDir = '/resources/'
const amapFile = require('../../3rds/amap-wx.js')
const app = getApp()
const map = 'map'
const statics = require('../../utils/static.js')
// 月份图
const mImg = key => `${baseDir}m${key}.png`
// 天气图
const wImg = (str) => {
  let { weather } = statics
  let img = ''
  for (let key in weather) {
    if (str.indexOf(key) > -1) {
      img = `${baseDir}w${weather[key]}.png`
      return img
    }
  }
  return img
}
// 日期图
const dImgs = (d) => {
  d = `0${d.toString()}`.substr(-2, 2).split('')
  return d.map(key => `${baseDir}${key}.png`)
}
// 年份图
const yImgs = (y) => {
  y = y.split('')
  return y.map(key => `${baseDir}${key}.png`)
}
// 速度view
const getSpeedView = (speed, max, min) => {
  speed = speed.toFixed(0) * 1
  let maxSpeed = 260
  let w = speed.toString().length * 14 + 50
  let r = speed / maxSpeed
      r = r > max ? max : (r < min ? min : r)
  let logo = `${baseDir}t1.png`
  return {
    logo,
    r,
    w,
    h: 24
  }
}
// 海拔view
const getAltitudeView = (altitude, max, min) => {
  altitude = altitude.toFixed(0) * 1
  let maxAltitude = 260
  let w = altitude.toString().length * 14 + 50
  let r = altitude / maxAltitude
  r = r > max ? max : (r < min ? min : r)
  let logo = `${baseDir}h.png`
  return {
    logo,
    r,
    w,
    h: 24
  }
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    src: '',
    dfImg: `${baseDir}login_bg.jpg`,
    userImg: '',
    mapImg: '',
    userLogo: '',
    mapInfo: {},
    userInfo: null,
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
    // debug wx.getStorage('mapInfo')
    let mapInfo = {
      scale: 16,                // 默认地图比例
      longitude: 121.42394,     // 经度
      latitude: 31.22024,       // 纬度
      speed: 10,                // 速度
      altitude: 200,            // 海拔
      temperature: 4,   
      weather: '多云',          // 天气字符串
      address: '长宁区凌空soho附近',   // 地址描述
      area: ['上海市', '长宁区'],   // 地区
    }
    this.setData({mapInfo})
  },
  canvasMaker() {
    // 样式布局
    let headHeight = 45
    let bottomHeight = 120
    let logoR = 28
    // 获取日期
    let date = new Date()
    let [d, m, y] = [date.getDate(), date.getMonth() + 1, date.getFullYear().toString()]
    // 日期图片
    let dateImgs = dImgs(d)
    let monthImg = mImg(m)
    let numMonthImgs = dImgs(m)
    let yearImgs = yImgs(y)
    // 背景图
    let bgImg = this.data.userImg || this.data.dfImg
    // 天气图
    let weatherImg = wImg(this.data.mapInfo.weather)
    // 画板信息
    let ctx = wx.createCanvasContext('canvas')
    let sysWidth = this.data.systemInfo.width
    let sysHeight = this.data.systemInfo.height
    ctx.clearRect(0, 0, sysWidth, sysHeight)
    // 背景图
    // ctx.drawImage(bgImg, 0, 0, sysWidth, sysHeight)
    // 阴影
    ctx.setGlobalAlpha(0.25)
    const grd = ctx.createCircularGradient(sysWidth / 2, sysHeight / 2, sysHeight / 2)
    grd.addColorStop(0, 'white')
    grd.addColorStop(1, 'black')
    ctx.setFillStyle(grd)
    ctx.fillRect(0, 0, sysWidth, sysHeight)
    // 地图
    ctx.setGlobalAlpha(1)
    ctx.drawImage(this.data.mapImg, 0, 0, sysWidth, sysHeight)
    // 头部-矩形
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, sysWidth, headHeight)
    // 头部-日期
    dateImgs.map((res, index) => {
      ctx.drawImage(res, index * 11 + 15, 11, 11, 22)
    })
    ctx.drawImage(monthImg, 45, 15, 20, 20)
    yearImgs.map((res, index) => {
      ctx.drawImage(res, index * 5 + 63, 19, 6, 12)
    })
    // 头部-地区
    ctx.setFillStyle('#000000')
    ctx.setTextAlign('center')
    ctx.setFontSize(14)
    ctx.fillText(this.data.mapInfo.area.join([' · ']), sysWidth/2, 28)
    // 头部-天气
    ctx.setFillStyle('#cccccc')
    ctx.setTextAlign('right')
    ctx.fillText(`${this.data.mapInfo.temperature}℃`, sysWidth - 50, 28)
    ctx.drawImage(weatherImg, sysWidth - 40, 10, 25, 25)
    // 地图-速度-圆
    let speed = this.data.mapInfo.speed
    let speedView = getSpeedView(speed, sysWidth / 2 - logoR, 20)
    let speedCentre = [sysWidth / 4, (sysHeight - headHeight - bottomHeight) / 3]
    ctx.beginPath()
    ctx.arc(speedCentre[0], speedCentre[1], speedView.r, 0, 2 * Math.PI)
    ctx.setGlobalAlpha(0.2)
    ctx.setFillStyle('#000000')
    ctx.fill()
    ctx.closePath()
    // 地图-速度-块
    ctx.setGlobalAlpha(1)
    ctx.setFillStyle('#666666')
    ctx.fillRect(speedCentre[0] - speedView.w / 2, speedCentre[1] - speedView.h / 2, speedView.w, speedView.h)
    // 地图-速度-图标
    ctx.drawImage(speedView.logo, speedCentre[0] - speedView.w / 2 + 5, speedCentre[1] - speedView.h / 2 + 2, 20, 20)
    // 地图-速度-描述
    ctx.setFillStyle('#ffffff')
    ctx.setTextAlign('center')
    ctx.fillText(`${speed}m/s`, speedCentre[0] + 9, speedCentre[1] + speedView.h/4)
    // 地图-海拔-圆
    let altitude = this.data.mapInfo.altitude
    let altitudeView = getAltitudeView(altitude, sysWidth / 2 - logoR, 20)
    let altitudeCentre = [sysWidth / 4, (sysHeight - headHeight - bottomHeight) * 2 / 3]
    ctx.beginPath()
    ctx.arc(altitudeCentre[0], altitudeCentre[1], altitudeView.r, 0, 2 * Math.PI)
    ctx.setGlobalAlpha(0.2)
    ctx.setFillStyle('#000000')
    ctx.fill()
    ctx.closePath()
    // 地图-海拔-块
    ctx.setGlobalAlpha(1)
    ctx.setFillStyle('#666666')
    ctx.fillRect(altitudeCentre[0] - altitudeView.w / 2, altitudeCentre[1] - altitudeView.h / 2, altitudeView.w, altitudeView.h)
    // 地图-速度-图标
    ctx.drawImage(altitudeView.logo, altitudeCentre[0] - altitudeView.w / 2 + 5, altitudeCentre[1] - altitudeView.h / 2 + 2, 20, 20)
    // 地图-速度-描述
    ctx.setFillStyle('#ffffff')
    ctx.setTextAlign('center')
    ctx.fillText(`${altitude}m/s`, altitudeCentre[0] + 9, altitudeCentre[1] + altitudeView.h / 4)
    // 日历-底色
    ctx.setGlobalAlpha(0.5)
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(sysWidth - 110, headHeight + 20, 90, 80)
    // 日历-线条
    ctx.setGlobalAlpha(1)
    ctx.setFillStyle('#666666')
    ctx.fillRect(sysWidth - 120, headHeight + 10, 110, 6)
    ctx.fillRect(sysWidth - 120, headHeight + 20, 110, 1)
    ctx.fillRect(sysWidth - 110, headHeight + 20, 1, 100)
    ctx.fillRect(sysWidth - 110, headHeight + 100, 90, 20)
    // 日历-日期
    dateImgs.map((res, index) => {
      ctx.drawImage(res, index * 18 + sysWidth - 85, headHeight + 45, 20, 40)
    })
    numMonthImgs.map((res, index) => {
      ctx.drawImage(res, index * 5 + sysWidth - 45, headHeight + 30, 6, 12)
    })
    // 日历-描述
    ctx.setFontSize(12)
    ctx.setTextAlign('center')
    ctx.setFillStyle('#ffffff')
    ctx.fillText('宜·重新开始', sysWidth - 65, headHeight + 115)
    // 底部-底色
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, sysHeight - bottomHeight, sysWidth, bottomHeight)
    // 底部-line
    ctx.setFillStyle('#e9d7bb')
    ctx.fillRect(0, sysHeight - bottomHeight - 2, sysWidth, 2)
    // 底部-logo
    
    // 底部-描述

    // 底部-附近

    // 底部-称号

    // 地图-头像
    ctx.beginPath()
    ctx.arc(sysWidth / 2, sysHeight / 2 - 60, logoR, 0, 2 * Math.PI)
    ctx.clip()
    ctx.drawImage(this.data.userLogo, sysWidth / 2 - logoR, sysHeight / 2 - 88, logoR * 2, logoR * 2)
    ctx.restore()
    ctx.beginPath()
    // 铺开
    ctx.draw()
    this.loading(false)
  },
  // 画画开始了
  setCanvans() {
    wx.downloadFile({
      url: this.data.src,
      success: (data1) => {
        wx.downloadFile({
          url: this.data.userInfo.avatarUrl,
          success: (data2) => {
            this.setData({ mapImg: data1.tempFilePath, userLogo: data2.tempFilePath })
            this.canvasMaker()
          }
        })
      }
    })
  },
  // 设置静态图
  setStaticMap() {
    let apmap = new amapFile.AMapWX({ key: app.globalData.appKey });
    let { longitude, latitude } = this.data.mapInfo
    let markers = this.getMarker(longitude, latitude)
    wx.getSystemInfo({
      success: (data) => {
        var height = data.windowHeight;
        var width = data.windowWidth;
        var size = width + "*" + height;
        this.setData({
          systemInfo: { height, width }
        })
        apmap.getStaticmap({
          zoom: this.data.mapInfo.scale,
          size: size,
          scale: 2,
          location: `${longitude},${latitude}`,
          markers: markers,
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
  setUserInfo(callback) {
    let userInfo = app.globalData.userInfo
    if (!userInfo) {
      wx.getUserInfo({
        success: (data) => {
          this.setData({ userInfo: data.userInfo })
          callback()
        }
      })
    } else {
      this.setData({ userInfo })
      callback()
    }
  },
  getMarker(longitude, latitude) {
    let style = ['large', '0xffa500', '']
    return `${style.join(',')}:${longitude},${latitude}`
  },
  onLoad(option) {
    this.getFromStorage()
    this.setUserInfo(_ => {
      this.setStaticMap()
    })
  },
  onShow() {
    
  },
  onHide() {
    // 选择照片时加载
    this.loading(true)
  }
})