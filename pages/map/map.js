const util      = require('../../utils/util.js')
const amapFile  = require('../../3rds/amap-wx.js')
const end       = 'end'
const app       = getApp()
const EARTH_RADIUS = 6378137.0;    //单位M
const PI = Math.PI;

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
        // sites.push([latitude, longitude])
        // if (sites.length > 5) {
        //   sites = sites.slice(sites.length - 5)
        // }
        // if (s) {
        //   let [lat1, lng1] = sites[0]
        //   let [lat2, lng2] = sites[sites.length - 1]
        //   v = getGreatCircleDistance(lat1, lng1, lat2, lng2) / s
        // }
        // s = sites.length
        callback(speed, altitude)
      }
    })
  }, 1000)
  return interval
}

Page({
  mapCtx: null,
  amap: null,
  data: {
    userInfo: null,     // 用户信息
    markers : [],       // 地图标记点
    controls: [],
    sites: [],          // 坐标点
    scale: 16,          // 初始放大倍数
    mapInfo: {
      scale     : 16,       // 默认地图比例
      longitude : 0,    // 经度
      latitude  : 0,    // 纬度
      speed     : 0,    // 速度
      altitude  : 0,    // 海拔
      weather   : '',   // 天气字符串
      address   : '',   // 地址描述
      area      : '',   // 地区
      checked   : ['weather', 'speed', 'altitude'],
      speedListener : null
    },
    checkboxGroup: {
      weather:{
        checked: true,
        name: '天气',
        displayInfo: ''
      }, 
      speed: {
        checked: true,
        name: '速度',
        displayInfo: 0
      }, 
      altitude: {
        checked: true,
        name: '海拔',
        displayInfo: 0
      }
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
  // 选择项改变
  checkboxChangeHandle(e) {
    let values = e.detail.value
    for (let key in this.data.checkboxGroup) {
      this.setData({
        [`checkboxGroup.${key}.checked`] : values.indexOf(key) > -1
      })
    }
    this.setData({
      'mapInfo.checked': [...values]
    })
  },
  // 监听拖动地图事件 - 静止
  regionChangeHandle(e) {
    return;
    switch(e.type) {
      case end:
        this.mapCtx.getCenterLocation({
          success: (data) => {
            let { longitude, latitude } = data
            this.setData({
              'mapInfo.latitude': latitude,
              'mapInfo.longitude': longitude,
              'markers': util.setMarkers({ latitude, longitude })
            })
          }
        })
        break;
    }
  },
  // 回到原始点
  backToLocation() {
    
  },
  // 设置存储到storage
  setToStorage(obj) {
    for (let key in obj) {
      wx.setStorageSync(key, obj[key])
    }
  },
  // 设置速度、海拔信息
  setPosition() {
    let index = 0
    let scale = this.data.scale
    // todo 设置scale
    this.speedListener = onSpeed((speed, altitude) => {
      this.setData({
        'scale': scale,
        'mapInfo.speed': speed,
        'mapInfo.altitude': altitude,
        'checkboxGroup.speed.displayInfo': speed.toFixed(2) + 'm/s',
        'checkboxGroup.altitude.displayInfo': altitude.toFixed(2) + 'm'
      })
    })
  },
  // 设置当前地理信息-坐标/高度/速度
  setLocation() {
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success: (data) => {
        let { longitude, latitude, altitude } = data
        this.setAddress({ longitude, latitude })
        this.setData({
          'mapInfo': { ...this.data.mapInfo, longitude, latitude, altitude },
          'markers': util.setMarkers({ latitude, longitude })
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
          'mapInfo.area': [province, district].join('，')
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
          'mapInfo.weather': data,
          'checkboxGroup.weather.displayInfo': data.weather.data
        })
      },
      fail: (info) => {
        
      }
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
  },
  onHide() {
    clearInterval(this.data.speedListener)
  }
})