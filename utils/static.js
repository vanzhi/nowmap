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
  0: ['猜不透的小人儿'],
  1: ['走路都有风', '大步坦然'],
  2: ['高处不胜寒'],
  3: ['一个慢灵魂', '有条不紊', '按兵不动'],
  4: ['翱翔', '空中飞人', '飞行中'],
  5: ['好冷啊', '大概在东北吧', '喜欢空调', '保暖全靠抖'],
  6: ['南方'],
  7: ['春光乍泄'],
  8: ['风儿喧嚣'],
  9: ['生活是迷雾'],
  10: ['大地留白'],
  11: ['在魔都'],
  12: ['留守帝都'],
  13: ['魔都夜生活'],
  14: ['不缺爱情'],
  15: ['爱吃年夜饭'],
  16: ['勒是雾都'],
  17: ['飞驰啦少年', '单手骑单车'],
  18: ['兜兜风', '有车一族'],
  19: ['东北人儿'],
  20: ['小雨淅沥沥'],
  99: ['我刚刚在这里'],
}
module.exports = {
  weather,
  calendarText,
  calendarDontTypes,
  descText,
  titleText
}