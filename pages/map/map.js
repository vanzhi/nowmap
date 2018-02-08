const util      = require('../../utils/util.js')
const amapFile  = require('../../3rds/amap-wx.js')
const end       = 'end'
const app       = getApp()
const EARTH_RADIUS = 6378137.0;    //单位M
const PI = Math.PI;
const baseDir = '/resources/'

function getRad(d) {
  return d * PI / 180.0;
}

function getGreatCircleDistance(lat1, lng1, lat2, lng2) {
  var radLat1 = getRad(lat1);
  var radLat2 = getRad(lat2);

  var a = radLat1 - radLat2;
  var b = getRad(lng1) - getRad(lng2);

  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * EARTH_RADIUS;
  s = Math.round(s * 10000) / 10000.0;

  return s; 
}

// 5秒内通过距离求得平均速
function onSpeed(callback) {
  let sites = []
  let v = 0   // 速度
  let s = 0   // 秒
  let interval = setInterval(_ => {
    wx.getLocation({
      success: ({ latitude, longitude, altitude, speed }) => {
        callback(speed, altitude, latitude, longitude)
      }
    })
  }, 1000)
  return interval
}

function setScale(altitude) {
  let scale = 16
  if (altitude <= 0) {
    scale = 18
  } else if (altitude <= 10) {
    scale = 16
  } else if (altitude <= 20) {
    scale = 15
  } else if (altitude <= 200) {
    scale = 14
  } else if (altitude <= 500) {
    scale = 13
  } else if (altitude <= 1000) {
    scale = 12
  } else if (altitude <= 2000) {
    scale = 11
  } else if (altitude <= 4000) {
    scale = 10
  } else if (altitude <= 8000) {
    scale = 9
  } else if (altitude <= 12000) {
    scale = 8
  } else if (altitude > 12000) (
    scale = 7
  )
  return scale
}

Page({
  mapCtx: null,
  amap: null,
  speedListener : null,
  data: {
    userInfo: null,     // 用户信息
    markers : [],       // 地图标记点
    controls: [],
    sites: [],          // 坐标点
    mapInfo: {
      scale     : 16,       // 最后获得地图比例
      longitude : 0,    // 经度
      latitude  : 0,    // 纬度
      speed     : 0,    // 速度
      altitude  : 0,    // 海拔
      temperature: 0,   // 气温
      weather   : '',   // 天气字符串
      address   : '',   // 地址描述
      area      : [],   // 地区
      checked   : ['weather', 'speed', 'altitude']
    }
  },
  // 跳转到静态图页面
  toStaticMap() {
    let markers = this.data.markers.map((item, index) => {
      return `${item.longitude},${item.latitude}`
    }).join(';')
    let { mapInfo } = this.data

    // 存储到Storage
    this.setToStorage({mapInfo})

    // 跳转
    wx.navigateTo({
      url: '../staticMap/staticMap?origin=map'
    })
  },
  // 重新定位
  resetLocation() {
    this.setLocation(true)
  },
  // 设置存储到storage
  setToStorage(obj) {
    for (let key in obj) {
      wx.setStorageSync(key, obj[key])
    }
  },
  // 设置速度、海拔、经纬度信息
  setPosition() {
    this.speedListener = onSpeed((speed, altitude, la1, lo1) => {
      // if (speed < 0) {
        let { latitude, longitude } = this.data.mapInfo
        // speed = getGreatCircleDistance(latitude, longitude, la1, lo1)
        //debug
        // speed = [latitude, longitude, la1, lo1].join('|')
      // }
      speed = speed < 0 ? 0 : Math.round(speed * 100) / 100
      altitude = Math.round(altitude)
      this.setData({
        'mapInfo.speed': speed,
        'mapInfo.altitude': altitude,
      })
    })
  },
  // 设置当前地理信息-坐标/高度/速度
  setLocation(isReload = false) {
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success: (data) => {
        let { longitude, latitude, altitude, speed } = data
        speed = speed < 0 ? 0 : Math.round(speed * 100) / 100
        altitude = Math.round(altitude)
        // 初始化
        if (!isReload) {
          let scale = 18
          scale = setScale(altitude)
          this.setAddress({ longitude, latitude })
          this.setData({
            'mapInfo.latitude': latitude,
            'mapInfo.longitude': longitude,
            'mapInfo.altitude': altitude,
            'mapInfo.speed': speed,
            'mapInfo.scale': scale,
          })
          return;
        }
        // 移动marker
        this.mapCtx.translateMarker({ 
          markerId: 0, 
          destination: { latitude, longitude },
          duration: 300,
          animationEnd: () => {
            this.setAddress({ longitude, latitude })
            this.setData({
              'mapInfo.latitude': latitude,
              'mapInfo.longitude': longitude
            })
          }
        })
      }
    })
  },
  // 设置地址信息
  setAddress(location) {
    let { latitude, longitude } = location
    this.amap.getRegeo({
      latitude,
      longitude,
      success: (data) => {
        let { province, district, township } = data[0].regeocodeData.addressComponent
        this.setData({ 
          'mapInfo.address' : data[0].desc,
          'mapInfo.area': [province, district],
          'markers': util.setMarkers({ latitude, longitude, content: data[0].desc })
        })
      },
      fail: (info) => {
        
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
  setWeather() {
    this.amap.getWeather({
      success: (data) => {
        this.setData({
          'mapInfo.weather': data.weather.data,
          'mapInfo.temperature': data.temperature.data,
          'checkboxGroup.weather.displayInfo': data.weather.data
        })
      },
      fail: (info) => {
        
      }
    })
  },
  setControls() {
    wx.getSystemInfo({
      success: ({ windowHeight, windowWidth }) => {
        let controls = [{
          position : {
            id: 1,
            left: windowWidth /2 - 5,
            top: (windowHeight - 220) / 2 + 45,
            width: 10,
            height: 10
          },
          iconPath: `${baseDir}dot.png`
        }]
        this.setData({ controls })
      },
    })
  },
  onLoad: function (options) {
    // 创建map上下文-微信/高德
    this.mapCtx = wx.createMapContext('map')
    this.amap   = new amapFile.AMapWX({ key: app.globalData.appKey })
  },
  onShow: function () {
    // 获取当前经纬度位置信息
    this.setLocation()
    // 获取速度/海拔信息
    this.setPosition()
    // 获取用户信息并记录
    this.setUserInfo()
    // 获取天气信息并记录
    this.setWeather()
    // 设置controls
    // this.setControls()
  },
  onHide() {
    clearInterval(this.speedListener)
  }
})