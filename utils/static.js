const weather = {
  '晴': 1,
  '云': 2,
  '阴': 3,
  '雨': 4,
  '雪': 5,
  '霾': 6,
  '雾': 7,
  '沙': 8,
  '尘': 8,
  '飑': 9,
  '风': 9
}
const calendarText = { //从7号开始吧
  7:'春光无限',
  8:'知足',
  9:'出发',
  10:'怯懦',
  11:'苛求',
  12:'冰淇淋',
  13:'贪杯',
  14:'恋爱',
  15:'团圆',
  16:'重新开始',
  17:'理解',
  18:'豁然开朗',
  19:'成熟',
  20:'怀旧',
  21:'热水澡',
  22:'戒',
  23:'倾诉',
  24:'懒觉',
  25:'畏缩不前',
  26:'晚睡',
  27:'勇气可嘉',
  28:'空想',
  1:'惶惶',
  2:'封闭',
  3:'白日梦',
  4:'开怀',
  5:'工作',
  6:'坦荡荡'
}
const calendarDontTypes = [10, 11, 12, 13, 20, 25, 26, 28, 1, 2]
const descText = {
  0: ['定位信息丢失，我大概不存在'],
  1: ['人生缓慢行进，我喜欢走走停停'],
  2: ['下个目的地，我靠脚前往', '在陆地上行走，灵魂比身体快'],
  3: ['四个轮子太快，一个轮子会倒', '这速度，起码比步行快'],
  4: ['街景移动太快，我想开去乡野', '前路多崎岖，我乘风而行', '一直往前开，一直往前开，一直往前开'],
  5: ['我喜欢看山川，隔着移动的窗户', '并行的铁轨上，我们擦肩而过'],
  6: ['超速行进中，谁能有我快？', '我也不知道我要去向哪里，我在飞'],
  7: ['旅途上，羡慕我有wifi的航班？', '天空看着大地，我看着你']
}
const titleText = {
  0: '猜不透的小人儿',
  1: '走路都有风',
  2: '高处不胜寒',
  3: '一个慢灵魂',
  4: '有条不紊',
  5: '大步坦然',
  6: '箭在弦上',
  7: '翱翔',
  8: '好冷啊',
  9: '大概在东北吧',
  10: '南方',
  11: '春光乍泄',
  12: '风儿喧嚣',
  13: '生活是迷雾',
  14: '空中飞人',
  15: '此处留白',
  16: '喜欢空调',
  17: '在魔都',
  18: '留守帝都',
  19: '保暖全靠抖',
  20: '魔都夜生活',
  21: '缺爱情',
  22: '爱吃年夜饭',
  23: '我刚刚在这里',
}
module.exports = {
  weather,
  calendarText,
  calendarDontTypes,
  descText,
  titleText
}