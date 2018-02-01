//app.js
App({
  onLaunch() {
    wx.getUserInfo({
      success: (data) => {
        console.log(data)
        this.globalData.userInfo = data.userInfo
      }
    })
  },
  globalData: {
    userInfo: null
  }
})