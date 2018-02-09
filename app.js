//app.js
const appKey_gd = '94b3cd2660907f6b605dc7e36c4bc115'     // 高德 used
const appKey_tx = 'MXQBZ-2FDWD-SCQ47-HQ3XJ-UFPVO-EPBVJ'  // 腾讯

App({
  onLaunch() {
    wx.getUserInfo({
      success: (data) => {
        this.globalData.userInfo = data.userInfo
      }
    })
  },
  globalData: {
    userInfo: null,
    appKey_gd,
    appKey_tx
  }
})