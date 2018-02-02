const util      = require('../../utils/util.js')
const amapFile  = require('../../3rds/amap-wx.js')
const end       = 'end'
const app       = getApp()

Page({
  mapCtx: null,
  amap: null,
  data: {
    userInfo: null,     // 用户信息
    markers : [],       // 地图标记点
    controls: [],
    mapInfo: {
      scale     : 16,       // 默认地图比例
      longitude : 0,    // 经度
      latitude  : 0,    // 纬度
      speed     : 0,    // 速度
      altitude  : 0,    // 海拔
      weather   : '',   // 天气字符串
      address   : '',   // 地址描述
      checked   : ['weather', 'speed', 'altitude']
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
    this.setToStorage(mapInfo)

    // 跳转
    wx.navigateTo({
      url: '../staticMap/staticMap'
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
  // 监听拖动地图事件
  regionChangeHandle(e) {
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
  // 设置存储到storage
  setToStorage(obj) {
    for (let key in obj) {
      wx.setStorageSync(key, obj[key])
    }
  },
  // 设置当前地理信息-坐标/高度/速度
  setLocation() {
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success: (data) => {
        let { longitude, latitude, speed, altitude } = data
        this.setAddress({ longitude, latitude })
        this.setData({
          'mapInfo': { ...this.data.mapInfo, longitude, latitude, speed, altitude },
          'markers': util.setMarkers({ latitude, longitude }),
          'checkboxGroup.speed.displayInfo': speed + 'm/s',
          'checkboxGroup.altitude.displayInfo': altitude + 'm'
        })
        console.log(this.data.mapInfo)
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
        this.setData({ 'mapInfo.address': [province, district, data[0].desc].join('，') })
      },
      fail: (info) => {
        console.log(info)
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
        console.log(data)
        this.setData({
          'mapInfo.weather': data,
          'checkboxGroup.weather.displayInfo': data.weather.data
        })
      },
      fail: (info) => {
        console.log(info)
      }
    })
  },
  onLoad: function (options) {
    // 创建map上下文-微信/高德
    this.mapCtx = wx.createMapContext('map')
    this.amap   = new amapFile.AMapWX({ key: app.globalData.appKey })
  },
  onShow: function () {
    // 获取当前地理位置信息
    this.setLocation()
    // 获取用户信息并记录
    this.setUserInfo()
    // 获取天气信息并记录
    this.setWeather()
  }
})