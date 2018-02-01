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

module.exports = {
  formatTime,
  setMarkers,
  setUrlQuery
}
