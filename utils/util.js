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
      label: {
        content: '  ' + item.content + '  ',
        bgColor: '#333333',
        color: '#ffffff',
      },
      width: 15,
      height: 15,
      iconPath: '/resources/dot.png'
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
  let text = []
  let { speed, altitude, address, area, temperature, weather, longitude, latitude } = mapInfo
  let date = new Date()

  // 速度篇-----
  if (speed <= 0.5) { 
    // 静止
    text.push(3)
  } else if(speed <= 3) { 
    // 步行
    text.push(1)
  } else if(speed <= 8) {
    // 自行车
    text.push(17)
  } else if (speed <= 40) {
    // 汽车
    text.push(18)
  } else if (speed >= 140) {
    // 飞机
    text.push(4)
  }

  // 海拔篇-----
  if (altitude > 1500) {
    text.push(2)
  }

  // 气温篇-----
  if (temperature < 1) {
    text.push(5)
  }

  // 天气篇------
  if (weather.indexOf('风') > -1) {
    text.push(8)
  } else if (weather.indexOf('雨') > -1) {
    text.push(20)
  } else if (weather.indexOf('雪') > -1) {
    text.push(10)
  } else if (weather.indexOf('雾') > -1 || weather.indexOf('霾') > -1) {
    text.push(9)
  } else if (weather.indexOf('晴') > -1) {
    text.push(7)
  }

  // 日期篇------
  let day = `${date.getMonth + 1}.${date.getDate()}`
  if (day === 2.14) {
    text.push(14)
  } else if (day === 2.15) {
    text.push(15)
  }

  // 地理篇------ 南方 118.461891,31.415707（纬度）   107.938638（经度）,23.345437
  if (latitude >= 31.415707 && longitude >= 107.938638) {
    text.push(6)
  }
  if (area[0].indexOf('上海') > -1) {
    text.push(11)
    if (date.getHours() > 18) {
      text.push(13)
    }
  } else if (area[0].indexOf('北京') > -1) {
    text.push(12)
  } else if (area[0].indexOf('重庆') > -1) {
    text.push(16)
  } else if (area[0].indexOf('黑') > -1 || area[0].indexOf('辽') > -1 || area[0].indexOf('吉') > -1) {
    text.push(19)
  }

  // 默认
  if (text.length <= 1) {
    text = text.concat([0, 99])
  }
  
  let strs = text.reduce((pv, cv, i) => {
    return pv.concat(statics.titleText[cv])
  }, [])
  
  return getOneFromArray(strs)
}

module.exports = {
  formatTime,
  setMarkers,
  setUrlQuery,
  calendarText,
  descText,
  titleText
}
