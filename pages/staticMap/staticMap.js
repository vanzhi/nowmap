// pages/staticMap/staticMap.js
const baseDir = '/resources/'
const amapFile = require('../../3rds/amap-wx.js')
const app = getApp()
const map = 'map'
const statics = require('../../utils/static.js')
const utils = require('../../utils/util.js')
const PI = 3.14

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
const getSpeedView = (speed, max, min = 16) => {
  let maxSpeed = 260
  let w = speed.toString().length * 10 + 65
  let r = Math.sqrt(speed / maxSpeed * max * max) + min
      r = r > max ? max : r
  let vs = [0, 3, 8, 40, 100, 140, -1]
  let logo = `${baseDir}t1.png`
  for (let i = 0; i < vs.length; i++) {
    if (speed <= vs[i] || vs[i] === -1) {
      logo = `${baseDir}t${i + 1}.png`
      break
    }
  }
  return {
    logo,
    r,
    w,
    h: 24
  }
}
// 海拔view
const getAltitudeView = (altitude, max, min = 16) => {
  let maxAltitude = 5000
  let w = altitude.toString().length * 10 + 50
  let r = Math.sqrt(altitude / maxAltitude * max * max) + min
      r = r > max ? max : r
  let logo = `${baseDir}h.png`
  return {
    logo,
    r,
    w,
    h: 24
  }
}
// 附近view
const getAddressView = (str, size) => {
  let mt = str.match(/[a-zA-Z0-9]/g) || []
  let l0 = str.length
  let l1 = mt.length
  return {
    l: (l0 - l1 + 2) * size + l1 * (size - 5) + 32
  }
}

// 生成静态图
const getStaticMap = (config) => {
  let uri = 'https://apis.map.qq.com/ws/staticmap/v2/?'
  let params = []
  for(let key in config) {
    switch(key) {
      case 'markers':
        config[key].map((item, index) => {
          let m = `size:mid|color:orange|${item.latitude},${item.longitude}`
          params.push(`${key}=${m}`)
        })
        break;
      default:
        params.push(`${key}=${config[key]}`)
    }
  }
  return uri + params.join('&')
}

Page({
  /**
   * 页面的初始数据
   */
  saving: false,
  data: {
    progress: 0,
    src: '',
    dfImg: `${baseDir}login_bg.jpg`,
    codeImg: `${baseDir}code.jpg`,
    locationImg: `${baseDir}l.png`,
    shadowImg: `${baseDir}bg.jpg`,
    userImg: '',
    mapImg: '',
    mapInfo: {},
    shareVisible: false,
    userInfo: null,
    animationData: {},
    canUseAnimation: true
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '记录你在旅途中的此时此刻',
      path: '/pages/map/map',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  setAnimation() {
    let canUseAnimation = wx.canIUse('createAnimation')
    if (canUseAnimation) {
      var animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease'
      })
      this.animation = animation
    }
    this.setData({ canUseAnimation })
    this.changeShareVisible()
  },
  // 设置分享按钮可见
  changeShareVisible() {
    this.setData({
      shareVisible: !this.data.shareVisible
    })
    if (this.data.canUseAnimation) {
      let left = this.data.shareVisible ? -100 : 0
      this.animation.translateX(left).step()
      this.setData({
        animationData: this.animation.export()
      })
    }
  },
  // 保存画布到图片
  saveCanvasToImage() {
    let sysWidth = this.data.systemInfo.width
    let sysHeight = this.data.systemInfo.height
    if (this.saving) {
      return
    }
    this.saving = true
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: sysWidth * 2,
      height: sysHeight * 2,
      canvasId: 'canvas',
      success: ({ tempFilePath }) => {
        wx.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success: () => {
            this.saving = false
            wx.showModal({
              title: '保存成功',
              content: '暂不支持直接分享图片，已保存到本地相册'
            })
          },
          fail: () => {
            this.saving = false
          }
        })
      }
    })
  },
  // 读取本地缓存数据
  getFromStorage() {
    // wx.getStorageSync('mapInfo') ||
    let mapInfo = wx.getStorageSync('mapInfo') ||{
      scale: 16,                // 默认地图比例
      longitude: 121.42394,     // 经度
      latitude: 31.22024,       // 纬度
      speed: 20,                // 速度
      altitude: 200,            // 海拔
      temperature: 4,   
      weather: '多云',          // 天气字符串
      address: '长宁区凌soho空附近',   // 地址描述
      area: ['上海市', '长宁区'],   // 地区
      userImg: '/resources/user.jpg',
      userImgWidth: '',
      userImgHeight: ''
    }
    this.setData({mapInfo})
  },
  canvasMaker() {
    // 样式布局
    let headHeight = 45
    let bottomHeight = 160
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
    let bgImg = this.data.mapInfo.userImg
    // 天气图
    let weatherImg = wImg(this.data.mapInfo.weather)
    // 画板信息
    let ctx = wx.createCanvasContext('canvas')
    let sysWidth = this.data.systemInfo.width
    let sysHeight = this.data.systemInfo.height
    ctx.setFontSize(14)
    ctx.clearRect(0, 0, sysWidth, sysHeight)

    // 地图
    ctx.setGlobalAlpha(1)
    ctx.drawImage(this.data.mapImg, 0, 0, sysWidth, sysHeight)
    // 背景图
    if (bgImg) {
      // debug
      let w = sysWidth
      let h = sysHeight - bottomHeight - headHeight
      let W = this.data.mapInfo.userImgWidth
      let H = this.data.mapInfo.userImgHeight
      
      ctx.setGlobalAlpha(0.3)
      if (!W || !H) {
        ctx.drawImage(bgImg, 0, headHeight, w, h)
      } else if (w/h > W/H) {
        ctx.drawImage(bgImg, 0, headHeight - (w / W * H - h) / 2, w, w / W * H)
      } else {
        ctx.drawImage(bgImg, - (h / H * W - w) / 2, headHeight, h / H * W, h)
      }
      // 黑底-阴影
      // ctx.setGlobalAlpha(0.2)
      // const grd = ctx.createCircularGradient(sysWidth / 2, sysHeight / 2, sysHeight / 2)
      // grd.addColorStop(0, 'white')
      // grd.addColorStop(1, 'black')
      // ctx.setFillStyle(grd)
      // ctx.fillRect(0, 0, sysWidth, sysHeight)
      ctx.setGlobalAlpha(0.2)
      ctx.drawImage(this.data.shadowImg, 0, headHeight, w, h)
    } else {
      // 白底-阴影
      ctx.setGlobalAlpha(0.2)
      ctx.setFillStyle('#ffffff')
      ctx.fillRect(0, 0, sysWidth, sysHeight)
    }
    // 地图-速度-圆
    let speed = this.data.mapInfo.speed
    let speedView = getSpeedView(speed, sysWidth / 4 - logoR / 2)
    let speedCentre = [sysWidth / 4, (sysHeight - headHeight - bottomHeight) / 3]
    let speedBg = bgImg ? { color: '#ffffff', alpha: 0.5 } : { color: '#000000', alpha: 0.2 }
    ctx.beginPath()
    ctx.arc(speedCentre[0], speedCentre[1], speedView.r, 0, 2 * Math.PI)
    ctx.setGlobalAlpha(speedBg.alpha)
    ctx.setFillStyle(speedBg.color)
    ctx.fill()
    ctx.closePath()
    // 地图-速度-块
    ctx.setGlobalAlpha(1)
    ctx.setFillStyle('#333333')
    ctx.fillRect(speedCentre[0] - speedView.w / 2, speedCentre[1] - speedView.h / 2, speedView.w, speedView.h)
    // 地图-速度-图标
    ctx.drawImage(speedView.logo, speedCentre[0] - speedView.w / 2 + 5, speedCentre[1] - speedView.h / 2 + 2, 20, 20)
    // 地图-速度-描述
    ctx.setFillStyle('#ffffff')
    ctx.setTextAlign('center')
    ctx.fillText(`${speed}m/s`, speedCentre[0] + 9, speedCentre[1] + speedView.h/4)
    // 地图-海拔-圆
    let altitude = this.data.mapInfo.altitude
    let altitudeView = getAltitudeView(altitude, sysWidth / 4 - logoR / 2 - 10)
    let altitudeCentre = [sysWidth / 4, (sysHeight - headHeight - bottomHeight) * 2 / 3]
    let altitudeBg = bgImg ? { color: '#ffffff', alpha: 0.5 } : { color: '#000000', alpha: 0.2 }
    ctx.beginPath()
    ctx.arc(altitudeCentre[0], altitudeCentre[1], altitudeView.r, 0, 2 * Math.PI)
    ctx.setGlobalAlpha(altitudeBg.alpha)
    ctx.setFillStyle(altitudeBg.color)
    ctx.fill()
    ctx.closePath()
    // 地图-海拔-块
    ctx.setGlobalAlpha(1)
    ctx.setFillStyle('#333333')
    ctx.fillRect(altitudeCentre[0] - altitudeView.w / 2, altitudeCentre[1] - altitudeView.h / 2, altitudeView.w, altitudeView.h)
    // 地图-海拔-图标
    ctx.drawImage(altitudeView.logo, altitudeCentre[0] - altitudeView.w / 2 + 5, altitudeCentre[1] - altitudeView.h / 2 + 2, 20, 20)
    // 地图-海拔-描述
    ctx.setFillStyle('#ffffff')
    ctx.setTextAlign('center')
    ctx.fillText(`${altitude}m`, altitudeCentre[0] + 9, altitudeCentre[1] + altitudeView.h / 4)

    // 日历-底色
    ctx.setGlobalAlpha(0.5)
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(sysWidth - 110, headHeight + 20, 90, 80)
    // 日历-线条
    ctx.setGlobalAlpha(1)
    ctx.setFillStyle('#333333')
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
    let calendarText = utils.calendarText()
    ctx.setFontSize(12)
    ctx.setTextAlign('center')
    ctx.setFillStyle('#ffffff')
    ctx.fillText(calendarText, sysWidth - 65, headHeight + 115)

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
    ctx.fillText(this.data.mapInfo.area.join([' · ']), sysWidth / 2, 28)
    // 头部-天气
    ctx.setFillStyle('#cccccc')
    ctx.setTextAlign('right')
    ctx.fillText(`${this.data.mapInfo.temperature}℃`, sysWidth - 50, 28)
    ctx.drawImage(weatherImg, sysWidth - 40, 10, 25, 25)

    // 底部-底色
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, sysHeight - bottomHeight, sysWidth, bottomHeight)
    // 底部-line
    ctx.setFillStyle('#e9d7bb')
    ctx.fillRect(0, sysHeight - bottomHeight - 2, sysWidth, 2)
    // 底部-标签
    ctx.fillRect(sysWidth / 2 - 40, sysHeight - bottomHeight - 20, 80, 20)
    ctx.setFontSize(10)
    ctx.setTextAlign('center')
    ctx.setFillStyle('#ffffff')
    ctx.fillText('我的地图标签', sysWidth / 2, sysHeight - bottomHeight - 6)
    // 底部-logo
    ctx.drawImage(this.data.codeImg, sysWidth / 2 - 25, sysHeight - bottomHeight + 10, 50, 50)
    // 底部-描述
    let descText = utils.descText(this.data.mapInfo)
    ctx.setFontSize(15)
    ctx.setTextAlign('center')
    ctx.setFillStyle('#333333')
    ctx.fillText(descText, sysWidth / 2, sysHeight - bottomHeight + 80)
    // 底部-附近
    let addressView = getAddressView(this.data.mapInfo.address, 12);
    ctx.drawImage(this.data.locationImg, sysWidth / 2 - addressView.l / 2, sysHeight - bottomHeight + 92, 25, 25)
    ctx.setFontSize(12)
    ctx.setTextAlign('center')
    ctx.setFillStyle('#666666')
    ctx.fillText(`我在${this.data.mapInfo.address}`, sysWidth / 2 + 10, sysHeight - bottomHeight + 110)
    // 底部-线
    ctx.setFillStyle('#efefef')
    ctx.fillRect(sysWidth / 2 - addressView.l / 2, sysHeight - bottomHeight + 120, addressView.l, 1)
    // 底部-称号
    let titleText = utils.titleText(this.data.mapInfo)
    ctx.setFontSize(12)
    ctx.setTextAlign('center')
    ctx.setFillStyle('#999999')
    ctx.fillText(titleText, sysWidth / 2, sysHeight - bottomHeight + 138)
    // 地图-头像
    ctx.setGlobalAlpha(1)
    ctx.beginPath()
    ctx.arc(sysWidth / 2, sysHeight / 2 - 60, logoR, 0, 2 * Math.PI)
    ctx.setStrokeStyle('#ffffff')
    ctx.setLineWidth(10)
    ctx.stroke()
    ctx.clip()
    ctx.drawImage(this.data.mapInfo.userLogo, sysWidth / 2 - logoR, sysHeight / 2 - 88, logoR * 2, logoR * 2)
    ctx.closePath()
    // 铺开
    ctx.draw()
    // 完成
    clearInterval(this.progressInterval)
    this.setData({ progress : 100 })
  },
  // 画画开始了
  setCanvans() {
    // 下载静态图
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
    let { latitude, longitude } = this.data.mapInfo
    // 获取设备信息
    wx.getSystemInfo({
      success: (data) => {
        var height = data.windowHeight;
        var width = data.windowWidth;
        var size = width + "*" + height;
        this.setData({
          systemInfo: { height, width }
        })
        // 腾讯地图静态图
        let uri = getStaticMap({
          zoom: this.data.mapInfo.scale,
          scale: 2, // 调用高清图 和小程序原生map中的scale不同意
          size: size,
          center: `${latitude},${longitude}`,
          markers: [{latitude, longitude}],
          key: app.globalData.appKey_tx,
        })
        this.setData({ src: uri })
        this.setCanvans()
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
  onLoad(option) {
    let progress = 0;

    this.setData({ progress })
    this.progressInterval = setInterval(() => {
      let left = 100 - progress
      progress += left / 2
      this.setData({ progress })
    }, 200)

    this.setAnimation()
    this.getFromStorage()
    this.setUserInfo(_ => {
      this.setStaticMap()
    })
  },
  onShow() {

  },
  onHide() {
    this.setData({
      'progress': 100
    })
  }
})