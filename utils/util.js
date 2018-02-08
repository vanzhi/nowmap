const statics = require('./static.js')

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 设置标记点基本形式
const setMarkers = data => {
  let points = data instanceof Array ? data : [data]
  let markers = points.map((item, index) => {
    return {
      ...item,
      id: index,
      // iconPath: '/resources/cao.png'
    }
  })
  return markers
}

// 设置url上的查询条件 - todo
const setUrlQuery = (url, query) => {
  let search = []
  for (let key in query) {
    search.push(`${key}=${query[key].toString()}`)
  }
  return [url, search.join('&')].join('?')
}

// 从数组中随机抽取一个值返回
const getOneFromArray = (arr = []) => {
  let ran = Math.random()
  let pos = Math.floor(ran * arr.length)
  return arr[pos]
}

// -----业务相关

// 获取日历描述
const calendarText = () => {
  let now = new Date()
  let date = now.getDate()
  let desc = statics.calendarText[date]
  let tp = statics.calendarDontTypes.indexOf(date) > -1 ? '忌' : '宜'
  return `${tp}· ${desc}`
}
// 获取综合描述
const descText = (mapInfo) => {
  let { speed } = mapInfo
  let text = statics.descText[0]
  let maxs = [0, 3, 8, 40, 100, 140, -1] //对应descText
  for (let i = 0; i < maxs.length; i ++) {
    if (speed <= maxs[i] || maxs[i] === -1) {
      text = statics.descText[i + 1]
      break;
    }
  }
  return getOneFromArray(text)
}
// 获取称号
const titleText = (mapInfo) => {
  let { speed, address, area, temperature, weather, longitude, latitude } = mapInfo
  let date = new Date()
  return '猜不透的小妖精'
}

module.exports = {
  formatTime,
  setMarkers,
  setUrlQuery,
  calendarText,
  descText,
  titleText
}
