/**
 * 翻译服务
 * 支持使用硅基流动/OpenAI兼容API进行翻译，同时提供客户端备用翻译方案
 */

// 翻译缓存，避免重复请求
const translationCache = new Map<string, string>()

// 精简的中英词典，用于客户端备用翻译
// 按类别分组，确保没有重复键
const translationDictionary: Record<string, string> = {
  // === 代词 ===
  'i': '我', 'you': '你', 'he': '他', 'she': '她', 'it': '它',
  'we': '我们', 'they': '他们', 'me': '我', 'him': '他',
  'us': '我们', 'them': '他们',
  'my': '我的', 'your': '你的', 'his': '他的', 'her': '她的',
  'its': '它的', 'our': '我们的', 'their': '他们的',
  'myself': '我自己', 'yourself': '你自己', 'himself': '他自己',
  'herself': '她自己', 'itself': '它自己', 'ourselves': '我们自己',
  'themselves': '他们自己',

  // === 问候 ===
  'hello': '你好', 'hi': '嗨', 'hey': '嘿',
  'good morning': '早上好', 'good afternoon': '下午好',
  'good evening': '晚上好', 'good night': '晚安',
  'goodbye': '再见', 'bye': '再见',
  'how are you': '你好吗',
  'nice to meet you': '很高兴见到你',
  'see you': '再见', 'see you later': '回头见',

  // === 感谢与道歉 ===
  'thank you': '谢谢你', 'thanks': '谢谢',
  'welcome': '欢迎',
  'sorry': '对不起', 'excuse me': '打扰一下',
  'no problem': '没问题', 'my pleasure': '我的荣幸',
  "i'm sorry": '对不起',

  // === 常见表达 ===
  "i don't know": '我不知道',
  "i don't understand": '我不明白',
  'i see': '我明白了', 'i got it': '我懂了',
  'got it': '懂了', 'never mind': '没关系',
  "it doesn't matter": '没关系',
  'take it easy': '放轻松', 'good luck': '祝你好运',
  'congratulations': '恭喜', 'well done': '干得好',

  // === 肯定与否定 ===
  'yes': '是的', 'no': '不', 'maybe': '也许',
  'sure': '当然', 'of course': '当然',
  'absolutely': '绝对', 'definitely': '肯定',
  'probably': '可能', 'perhaps': '也许',
  'i think so': '我想是的',
  "i don't think so": '我不这么认为',
  'not at all': '一点也不', 'of course not': '当然不',

  // === 情感 ===
  'great': '太棒了', 'awesome': '太棒了', 'amazing': '太神奇了',
  'wonderful': '太棒了', 'fantastic': '棒极了', 'excellent': '太棒了',
  'perfect': '完美', 'terrible': '太糟糕了', 'awful': '太糟糕了',
  'i love it': '我喜欢', 'i like it': '我喜欢',
  "i don't like it": '我不喜欢',
  'i hate it': '我讨厌它', 'i enjoy': '我享受',

  // === 情感形容词 ===
  'happy': '开心的', 'sad': '难过的', 'angry': '生气的',
  'worried': '担心的', 'excited': '兴奋的', 'nervous': '紧张的',
  'surprised': '惊讶的', 'bored': '无聊的', 'relaxed': '放松的',
  'stressed': '有压力的', 'confident': '自信的', 'shy': '害羞的',
  'proud': '骄傲的', 'embarrassed': '尴尬的',
  'disappointed': '失望的', 'satisfied': '满意的',
  'frustrated': '沮丧的', 'grateful': '感激的',

  // === 时间 ===
  'today': '今天', 'yesterday': '昨天', 'tomorrow': '明天',
  'now': '现在', 'later': '稍后', 'soon': '很快',
  'right now': '马上', 'just now': '刚才',
  'in a minute': '马上', 'in a while': '一会儿',
  'day': '天', 'week': '周', 'month': '月', 'year': '年',
  'time': '时间', 'morning': '早上', 'afternoon': '下午',
  'evening': '晚上', 'night': '夜晚', 'noon': '中午',
  'midnight': '午夜',

  // === 频率 ===
  'always': '总是', 'usually': '通常', 'often': '经常',
  'sometimes': '有时', 'rarely': '很少', 'never': '从不',
  'every day': '每天', 'every week': '每周',

  // === 方向 ===
  'here': '这里', 'there': '那里', 'over there': '在那边',
  'everywhere': '到处', 'somewhere': '某处',
  'left': '左边', 'right': '右边', 'straight': '直走',

  // === 大小 ===
  'big': '大的', 'small': '小的', 'large': '大的',
  'huge': '巨大的', 'tiny': '小的',
  'long': '长的', 'short': '短的', 'tall': '高的',
  'high': '高的', 'low': '低的',

  // === 家庭 ===
  'family': '家庭', 'father': '父亲', 'dad': '爸爸',
  'mother': '母亲', 'mom': '妈妈', 'parents': '父母',
  'brother': '兄弟', 'sister': '姐妹',
  'son': '儿子', 'daughter': '女儿',
  'grandfather': '祖父', 'grandmother': '祖母',
  'husband': '丈夫', 'wife': '妻子', 'friend': '朋友',
  'boyfriend': '男朋友', 'girlfriend': '女朋友',

  // === 工作 ===
  'work': '工作', 'job': '工作', 'career': '职业',
  'company': '公司', 'office': '办公室',
  'business': '生意', 'meeting': '会议',
  'project': '项目', 'team': '团队',
  'colleague': '同事', 'boss': '老板',
  'manager': '经理', 'employee': '员工',
  'customer': '客户',

  // === 学校 ===
  'school': '学校', 'university': '大学', 'college': '大学',
  'student': '学生', 'teacher': '老师', 'professor': '教授',
  'class': '班级', 'course': '课程', 'lesson': '课',
  'homework': '作业', 'exam': '考试', 'test': '测试',
  'grade': '成绩', 'degree': '学位', 'major': '专业',
  'study': '学习', 'learn': '学习',

  // === 食物 ===
  'food': '食物', 'meal': '餐',
  'breakfast': '早餐', 'lunch': '午餐', 'dinner': '晚餐',
  'restaurant': '餐厅', 'cafe': '咖啡馆',
  'coffee': '咖啡', 'tea': '茶', 'water': '水',
  'bread': '面包', 'rice': '米饭', 'noodles': '面条',
  'meat': '肉', 'chicken': '鸡肉', 'beef': '牛肉',
  'fish': '鱼', 'vegetable': '蔬菜', 'fruit': '水果',
  'apple': '苹果', 'banana': '香蕉',
  'delicious': '美味的', 'hungry': '饿的', 'thirsty': '渴的',

  // === 交通 ===
  'car': '汽车', 'bus': '公交车', 'train': '火车',
  'subway': '地铁', 'taxi': '出租车', 'bike': '自行车',
  'airplane': '飞机', 'airport': '机场', 'station': '车站',
  'road': '路', 'street': '街道', 'drive': '开车', 'walk': '走路',

  // === 天气 ===
  'weather': '天气', 'sunny': '晴朗的', 'rainy': '下雨的',
  'cloudy': '多云的', 'windy': '有风的', 'snowy': '下雪的',
  'hot': '热的', 'cold': '冷的', 'warm': '温暖的',
  'cool': '凉爽的', 'temperature': '温度',

  // === 颜色 ===
  'red': '红色', 'blue': '蓝色', 'green': '绿色',
  'yellow': '黄色', 'black': '黑色', 'white': '白色',
  'orange': '橙色', 'purple': '紫色', 'pink': '粉色',
  'brown': '棕色', 'gray': '灰色', 'color': '颜色',

  // === 金钱 ===
  'money': '钱', 'dollar': '美元', 'yuan': '元',
  'price': '价格', 'cheap': '便宜的', 'expensive': '贵的',
  'free': '免费的', 'buy': '买', 'sell': '卖',
  'pay': '支付', 'cost': '花费',

  // === 健康 ===
  'health': '健康', 'doctor': '医生', 'hospital': '医院',
  'medicine': '药', 'sick': '生病的', 'pain': '疼痛',
  'headache': '头痛', 'fever': '发烧',
  'exercise': '运动', 'sport': '运动',

  // === 爱好 ===
  'hobby': '爱好', 'music': '音乐', 'movie': '电影',
  'book': '书', 'game': '游戏', 'travel': '旅行',
  'photo': '照片', 'picture': '图片', 'art': '艺术',
  'dance': '舞蹈', 'sing': '唱歌', 'read': '阅读',
  'write': '写作', 'draw': '画画', 'run': '跑步',
  'swim': '游泳', 'paint': '绘画',

  // === 地点 ===
  'home': '家', 'house': '房子', 'room': '房间',
  'kitchen': '厨房', 'bedroom': '卧室', 'bathroom': '浴室',
  'living room': '客厅', 'garden': '花园',
  'city': '城市', 'country': '国家', 'town': '城镇',
  'building': '建筑', 'shop': '商店', 'store': '商店',
  'market': '市场', 'mall': '商场', 'park': '公园',
  'museum': '博物馆', 'library': '图书馆',
  'cinema': '电影院', 'theater': '剧院', 'hotel': '酒店',
  'bank': '银行', 'post office': '邮局',

  // === 科技 ===
  'phone': '手机', 'computer': '电脑', 'internet': '互联网',
  'website': '网站', 'app': '应用', 'email': '邮件',
  'message': '消息', 'video': '视频', 'camera': '相机',
  'screen': '屏幕', 'password': '密码', 'wifi': '无线网络',

  // === 自然 ===
  'nature': '自然', 'tree': '树', 'flower': '花',
  'grass': '草', 'mountain': '山', 'river': '河',
  'lake': '湖', 'sea': '海', 'ocean': '海洋',
  'beach': '海滩', 'forest': '森林', 'sky': '天空',
  'sun': '太阳', 'moon': '月亮', 'star': '星星',
  'earth': '地球', 'animal': '动物', 'bird': '鸟',
  'dog': '狗', 'cat': '猫',

  // === 人物 ===
  'man': '男人', 'woman': '女人', 'child': '孩子',
  'children': '孩子们', 'baby': '婴儿',
  'adult': '成年人', 'teenager': '青少年',
  'people': '人们', 'person': '人',

  // === 常用名词 ===
  'thing': '东西', 'place': '地方',
  'life': '生活', 'world': '世界', 'way': '方式',
  'part': '部分', 'question': '问题', 'answer': '答案',
  'idea': '想法', 'reason': '原因', 'example': '例子',
  'fact': '事实', 'information': '信息', 'news': '新闻',
  'story': '故事', 'experience': '经历',
  'difference': '差异', 'change': '改变',
  'result': '结果', 'effect': '影响',
  'beginning': '开始', 'end': '结束', 'middle': '中间',
  'problem': '问题', 'solution': '解决方案',
  'situation': '情况', 'opportunity': '机会',
  'challenge': '挑战', 'advantage': '优势',
  'disadvantage': '劣势', 'benefit': '好处',
  'risk': '风险', 'goal': '目标', 'dream': '梦想',
  'plan': '计划', 'decision': '决定', 'choice': '选择',
  'opinion': '观点', 'attitude': '态度',
  'behavior': '行为', 'habit': '习惯',
  'tradition': '传统', 'culture': '文化',
  'society': '社会', 'community': '社区',
  'government': '政府', 'politics': '政治',
  'economy': '经济', 'environment': '环境',
  'pollution': '污染', 'technology': '科技',
  'science': '科学', 'history': '历史',
  'future': '未来', 'development': '发展',
  'growth': '增长', 'improvement': '改进',
  'achievement': '成就', 'success': '成功',
  'failure': '失败', 'error': '错误',
  'quality': '质量', 'standard': '标准',
  'value': '价值', 'budget': '预算',
  'resource': '资源', 'energy': '能量',
  'power': '力量', 'strength': '力量',
  'ability': '能力', 'skill': '技能',
  'talent': '天赋', 'knowledge': '知识',
  'wisdom': '智慧', 'education': '教育',
  'training': '培训', 'memory': '记忆',
  'mind': '思想', 'thought': '想法',
  'emotion': '情感', 'feeling': '感觉',
  'mood': '心情', 'spirit': '精神',
  'heart': '心', 'body': '身体',
  'brain': '大脑', 'head': '头',
  'face': '脸', 'eye': '眼睛', 'ear': '耳朵',
  'nose': '鼻子', 'mouth': '嘴巴',
  'hand': '手', 'arm': '手臂', 'leg': '腿',
  'foot': '脚', 'back': '背',
  'skin': '皮肤', 'hair': '头发',
  'blood': '血液', 'voice': '声音',
  'sound': '声音', 'noise': '噪音',
  'song': '歌曲', 'show': '节目',
  'performance': '表演', 'match': '比赛',
  'competition': '比赛', 'player': '玩家',
  'fan': '粉丝', 'audience': '观众',
  'reader': '读者', 'writer': '作家',
  'artist': '艺术家', 'musician': '音乐家',
  'actor': '演员', 'director': '导演',
  'author': '作者', 'poet': '诗人',
  'scientist': '科学家', 'nurse': '护士',
  'patient': '病人', 'lawyer': '律师',
  'engineer': '工程师', 'architect': '建筑师',
  'designer': '设计师', 'programmer': '程序员',
  'developer': '开发者', 'worker': '工人',
  'farmer': '农民', 'driver': '司机',
  'waiter': '服务员', 'chef': '厨师',
  'receptionist': '接待员', 'leader': '领导',
  'owner': '所有者', 'guest': '客人',
  'visitor': '访客', 'stranger': '陌生人',
  'neighbor': '邻居', 'classmate': '同学',
  'partner': '伙伴', 'companion': '同伴',
  'enemy': '敌人', 'opponent': '对手',

  // === 常用动词 ===
  'want': '想要', 'need': '需要', 'like': '喜欢',
  'love': '爱', 'prefer': '更喜欢', 'hope': '希望',
  'wish': '希望', 'decide': '决定', 'choose': '选择',
  'try': '尝试', 'start': '开始', 'begin': '开始',
  'finish': '完成', 'complete': '完成',
  'stop': '停止', 'continue': '继续',
  'remember': '记得', 'forget': '忘记',
  'know': '知道', 'understand': '理解',
  'realize': '意识到', 'believe': '相信',
  'think': '认为', 'feel': '感觉',
  'agree': '同意', 'disagree': '不同意',
  'accept': '接受', 'refuse': '拒绝',
  'allow': '允许', 'prevent': '阻止',
  'help': '帮助', 'support': '支持',
  'encourage': '鼓励',
  'speak': '说', 'talk': '交谈', 'say': '说',
  'tell': '告诉', 'ask': '问',
  'repeat': '重复',

  // === 常用形容词 ===
  'good': '好的', 'bad': '坏的', 'new': '新的',
  'old': '旧的', 'young': '年轻的',
  'beautiful': '美丽的', 'ugly': '丑陋的',
  'easy': '容易的', 'difficult': '困难的',
  'hard': '困难的', 'simple': '简单的',
  'complicated': '复杂的', 'interesting': '有趣的',
  'boring': '无聊的', 'funny': '有趣的',
  'serious': '严肃的', 'important': '重要的',
  'necessary': '必要的', 'possible': '可能的',
  'impossible': '不可能的', 'different': '不同的',
  'same': '相同的', 'similar': '相似的',
  'special': '特别的', 'normal': '正常的',
  'strange': '奇怪的', 'crazy': '疯狂的',
  'smart': '聪明的', 'stupid': '愚蠢的',
  'kind': '善良的', 'friendly': '友好的',
  'polite': '有礼貌的', 'rude': '粗鲁的',
  'honest': '诚实的',
  'careful': '小心的', 'busy': '忙碌的',
  'ready': '准备好的', 'late': '迟到的',
  'early': '早的', 'fast': '快的',
  'slow': '慢的', 'quick': '快的',
  'quiet': '安静的', 'loud': '大声的',
  'clean': '干净的', 'dirty': '脏的',
  'dry': '干的', 'wet': '湿的',
  'full': '满的', 'empty': '空的',
  'open': '打开的', 'closed': '关闭的',
  'safe': '安全的', 'dangerous': '危险的',
  'public': '公共的', 'private': '私人的',
  'local': '本地的', 'global': '全球的',
  'modern': '现代的', 'traditional': '传统的',
  'popular': '流行的', 'famous': '著名的',
  'successful': '成功的', 'rich': '富有的',
  'poor': '贫穷的', 'healthy': '健康的',
  'unhealthy': '不健康的', 'comfortable': '舒适的',
  'uncomfortable': '不舒适的', 'convenient': '方便的',
  'inconvenient': '不方便的', 'fresh': '新鲜的',

  // === 连词和介词 ===
  'and': '和', 'but': '但是', 'or': '或者',
  'so': '所以', 'because': '因为', 'if': '如果',
  'when': '当...时', 'while': '当...时',
  'before': '在...之前', 'after': '在...之后',
  'until': '直到', 'since': '自从',
  'although': '虽然', 'however': '然而',
  'therefore': '因此', 'in': '在...里',
  'on': '在...上', 'at': '在',
  'to': '到', 'from': '从',
  'with': '和...一起', 'without': '没有',
  'for': '为了', 'about': '关于',
  'of': '的', 'by': '通过',
  'into': '进入', 'out of': '从...出来',
  'between': '在...之间', 'among': '在...之中',
  'through': '通过', 'during': '在...期间',
  'over': '在...上方', 'under': '在...下面',
  'up': '向上', 'down': '向下',

  // === 口语练习相关 ===
  'practice': '练习', 'pronunciation': '发音',
  'grammar': '语法', 'vocabulary': '词汇',
  'sentence': '句子', 'word': '单词',
  'phrase': '短语', 'meaning': '意思',
  'translation': '翻译', 'language': '语言',
  'english': '英语', 'chinese': '中文',
  'fluent': '流利的', 'native': '本地的',
  'accent': '口音', 'mistake': '错误',
  'correct': '正确的', 'improve': '提高',
  'progress': '进步', 'conversation': '对话',
  'dialogue': '对话', 'topic': '话题',
  'subject': '主题', 'chat': '聊天',

  // === 缩写形式 ===
  "i'm": '我是', "i'd": '我会', "i've": '我已经',
  "i'll": '我会', "you're": '你是', "you'd": '你会',
  "you've": '你已经', "you'll": '你会',
  "it's": '它是', "that's": '那是',
  "there's": '有', "what's": '什么是',
  "where's": '在哪里', "how's": '怎么样',
  "who's": '是谁', "let's": '让我们',
  "don't": '不要', "doesn't": '不',
  "didn't": '没有', "won't": '不会',
  "wouldn't": '不会', "can't": '不能',
  "couldn't": '不能', "shouldn't": '不应该',
  "isn't": '不是', "aren't": '不是',
  "wasn't": '不是', "weren't": '不是',
  "haven't": '没有', "hasn't": '没有',
  "hadn't": '没有',

  // === 动词短语 ===
  'get up': '起床', 'go to bed': '睡觉',
  'go home': '回家', 'go out': '出去',
  'come in': '进来', 'come back': '回来',
  'sit down': '坐下', 'stand up': '站起来',
  'turn on': '打开', 'turn off': '关闭',
  'put on': '穿上', 'take off': '脱下',
  'look for': '寻找', 'find out': '发现',
  'give up': '放弃', 'keep on': '继续',
  'carry on': '继续', 'hurry up': '快点',
  'calm down': '冷静', 'cheer up': '振作起来',
  'wake up': '醒来', 'grow up': '长大',
  'look after': '照顾', 'take care': '保重',
  'be careful': '小心', 'watch out': '小心',
  'pay attention': '注意', 'focus on': '专注于',
  'depend on': '取决于', 'believe in': '相信',
  'interested in': '对...感兴趣',
  'tired of': '厌倦', 'proud of': '为...骄傲',
  'afraid of': '害怕', 'full of': '充满',
  'instead of': '代替', 'because of': '因为',
  'next to': '在...旁边', 'close to': '靠近',
  'far from': '远离', 'good at': '擅长',
  'bad at': '不擅长', 'more than': '多于',
  'less than': '少于', 'up to': '多达',
  'used to': '过去常常',
  'looking forward to': '期待',
  'make sure': '确保', 'make sense': '有意义',
  'take place': '发生', 'take part in': '参加',
  'work out': '锻炼', 'figure out': '弄明白',
  'speak up': '大声说', 'write down': '写下',
  'break down': '出故障', 'run out of': '用完',
  'hold on': '坚持', 'get along with': '与...相处',
  'get rid of': '摆脱', 'get used to': '习惯于',
  'go over': '复习', 'go through': '经历',
  'come up with': '想出', 'drop by': '顺便拜访',
  'fill in': '填写', 'hand in': '上交',
  'look forward to': '期待', 'look up': '查找',
  'make up': '组成', 'pick up': '捡起',
  'put up': '张贴', 'set up': '建立',
  'show off': '炫耀', 'show up': '出现',
  'slow down': '减速', 'sort out': '解决',
  'stay up': '熬夜', 'stick to': '坚持',
  'switch on': '打开', 'switch off': '关闭',
  'throw away': '扔掉', 'try on': '试穿',
  'try out': '试用', 'turn around': '转身',
  'wear out': '磨损', 'work on': '从事',

  // === 其他常用词 ===
  'really': '真的', 'very': '很', 'quite': '相当',
  'pretty': '相当', 'too': '太',
  'just': '刚刚', 'only': '只有', 'even': '甚至',
  'also': '也', 'still': '仍然', 'yet': '还',
  'already': '已经', 'almost': '几乎',
  'rather': '相当',
  'especially': '尤其',
  'actually': '实际上', 'certainly': '当然',
  'obviously': '显然',
  'basically': '基本上', 'generally': '通常',
  'normally': '通常',
  'finally': '最后', 'eventually': '最终',
  'suddenly': '突然', 'immediately': '立即',
  'recently': '最近', 'lately': '最近',
  'frequently': '频繁地',
  'hardly': '几乎不', 'barely': '勉强',
  'completely': '完全', 'totally': '完全',
  'entirely': '完全', 'partly': '部分地',
  'mostly': '主要', 'mainly': '主要',
  'exactly': '确切地', 'precisely': '精确地',
  'approximately': '大约', 'roughly': '大约',
  'directly': '直接', 'indirectly': '间接',
  'easily': '容易', 'difficultly': '困难',
  'quickly': '快速地', 'slowly': '慢慢地',
  'carefully': '小心地', 'carelessly': '粗心地',
  'happily': '开心地', 'sadly': '悲伤地',
  'luckily': '幸运地', 'unluckily': '不幸地',
  'fortunately': '幸运地', 'unfortunately': '不幸地',
  'honestly': '诚实地', 'seriously': '认真地',
  'personally': '个人地', 'officially': '正式地',
}

// 句子级翻译模式
const sentencePatterns: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\bi am\b/gi, replacement: '我是' },
  { pattern: /\bhe is\b/gi, replacement: '他是' },
  { pattern: /\bshe is\b/gi, replacement: '她是' },
  { pattern: /\bit is\b/gi, replacement: '它是' },
  { pattern: /\bwe are\b/gi, replacement: '我们是' },
  { pattern: /\bthey are\b/gi, replacement: '他们是' },
  { pattern: /\byou are\b/gi, replacement: '你是' },
  { pattern: /\bi was\b/gi, replacement: '我过去是' },
  { pattern: /\bhe was\b/gi, replacement: '他过去是' },
  { pattern: /\bshe was\b/gi, replacement: '她过去是' },
  { pattern: /\bit was\b/gi, replacement: '它过去是' },
  { pattern: /\bwe were\b/gi, replacement: '我们过去是' },
  { pattern: /\bthey were\b/gi, replacement: '他们过去是' },
  { pattern: /\byou were\b/gi, replacement: '你过去是' },
  { pattern: /\bi will\b/gi, replacement: '我会' },
  { pattern: /\bhe will\b/gi, replacement: '他会' },
  { pattern: /\bshe will\b/gi, replacement: '她会' },
  { pattern: /\bit will\b/gi, replacement: '它会' },
  { pattern: /\bwe will\b/gi, replacement: '我们会' },
  { pattern: /\bthey will\b/gi, replacement: '他们会' },
  { pattern: /\byou will\b/gi, replacement: '你会' },
  { pattern: /\bi have\b/gi, replacement: '我有' },
  { pattern: /\bhe has\b/gi, replacement: '他有' },
  { pattern: /\bshe has\b/gi, replacement: '她有' },
  { pattern: /\bit has\b/gi, replacement: '它有' },
  { pattern: /\bwe have\b/gi, replacement: '我们有' },
  { pattern: /\bthey have\b/gi, replacement: '他们有' },
  { pattern: /\byou have\b/gi, replacement: '你有' },
  { pattern: /\bdo you\b/gi, replacement: '你...吗' },
  { pattern: /\bdoes he\b/gi, replacement: '他...吗' },
  { pattern: /\bdoes she\b/gi, replacement: '她...吗' },
  { pattern: /\bdid you\b/gi, replacement: '你过去...吗' },
  { pattern: /\bcan you\b/gi, replacement: '你能' },
  { pattern: /\bcould you\b/gi, replacement: '你能...吗' },
  { pattern: /\bwould you\b/gi, replacement: '你愿意' },
  { pattern: /\bshould i\b/gi, replacement: '我应该' },
  { pattern: /\bshould we\b/gi, replacement: '我们应该' },
  { pattern: /\bwill you\b/gi, replacement: '你会' },
  { pattern: /\bhave you\b/gi, replacement: '你...过吗' },
  { pattern: /\bhas he\b/gi, replacement: '他...过吗' },
  { pattern: /\bhas she\b/gi, replacement: '她...过吗' },
  { pattern: /\bthere is\b/gi, replacement: '有' },
  { pattern: /\bthere are\b/gi, replacement: '有' },
  { pattern: /\bthank you for\b/gi, replacement: '感谢你的' },
  { pattern: /\bi want to\b/gi, replacement: '我想要' },
  { pattern: /\bi would like to\b/gi, replacement: '我想要' },
  { pattern: /\bi'd like to\b/gi, replacement: '我想要' },
  { pattern: /\bi need to\b/gi, replacement: '我需要' },
  { pattern: /\bi have to\b/gi, replacement: '我必须' },
  { pattern: /\bi'm going to\b/gi, replacement: '我打算' },
  { pattern: /\bi used to\b/gi, replacement: '我过去常常' },
  { pattern: /\bi think that\b/gi, replacement: '我认为' },
  { pattern: /\bi believe that\b/gi, replacement: '我相信' },
  { pattern: /\bi feel that\b/gi, replacement: '我感觉' },
  { pattern: /\bi hope that\b/gi, replacement: '我希望' },
  { pattern: /\bi know that\b/gi, replacement: '我知道' },
  { pattern: /\bit seems that\b/gi, replacement: '似乎' },
  { pattern: /\bit looks like\b/gi, replacement: '看起来' },
  { pattern: /\bit sounds like\b/gi, replacement: '听起来' },
  { pattern: /\bwhat do you think\b/gi, replacement: '你觉得怎么样' },
  { pattern: /\bhow do you feel\b/gi, replacement: '你感觉如何' },
  { pattern: /\bwhat do you mean\b/gi, replacement: '你是什么意思' },
  { pattern: /\bhow about\b/gi, replacement: '...怎么样' },
  { pattern: /\bwhat about\b/gi, replacement: '...怎么样' },
  { pattern: /\bwhy don't we\b/gi, replacement: '我们为什么不' },
  { pattern: /\bwhy don't you\b/gi, replacement: '你为什么不' },
  { pattern: /\bhow come\b/gi, replacement: '怎么会' },
  { pattern: /\bwhat kind of\b/gi, replacement: '什么样的' },
  { pattern: /\bhow many\b/gi, replacement: '多少' },
  { pattern: /\bhow much\b/gi, replacement: '多少' },
  { pattern: /\bhow long\b/gi, replacement: '多久' },
  { pattern: /\bhow far\b/gi, replacement: '多远' },
  { pattern: /\bhow old\b/gi, replacement: '多大' },
  { pattern: /\bhow often\b/gi, replacement: '多久一次' },
  { pattern: /\bby the way\b/gi, replacement: '顺便说一下' },
  { pattern: /\bin fact\b/gi, replacement: '事实上' },
  { pattern: /\bin my opinion\b/gi, replacement: '在我看来' },
  { pattern: /\bon the other hand\b/gi, replacement: '另一方面' },
  { pattern: /\bfor example\b/gi, replacement: '例如' },
  { pattern: /\bas a result\b/gi, replacement: '结果' },
  { pattern: /\beven though\b/gi, replacement: '即使' },
  { pattern: /\bat least\b/gi, replacement: '至少' },
  { pattern: /\bat most\b/gi, replacement: '最多' },
  { pattern: /\bso far\b/gi, replacement: '到目前为止' },
  { pattern: /\bto be honest\b/gi, replacement: '说实话' },
  { pattern: /\bi have no idea\b/gi, replacement: '我不知道' },
  { pattern: /\bi'm sorry to hear that\b/gi, replacement: '听到这个我很难过' },
  { pattern: /\bi'm looking for\b/gi, replacement: '我在找' },
  { pattern: /\bi'm thinking about\b/gi, replacement: '我在考虑' },
  { pattern: /\bi'm worried about\b/gi, replacement: '我担心' },
  { pattern: /\bi'm interested in\b/gi, replacement: '我对...感兴趣' },
  { pattern: /\bi'm good at\b/gi, replacement: '我擅长' },
  { pattern: /\bi'm bad at\b/gi, replacement: '我不擅长' },
  { pattern: /\bi'm tired of\b/gi, replacement: '我厌倦' },
  { pattern: /\bi'm excited about\b/gi, replacement: '我对...感到兴奋' },
  { pattern: /\bi'm afraid of\b/gi, replacement: '我害怕' },
  { pattern: /\bi'm proud of\b/gi, replacement: '我为...骄傲' },
  { pattern: /\bi'm used to\b/gi, replacement: '我习惯于' },
  { pattern: /\bi'm ready to\b/gi, replacement: '我准备好了' },
  { pattern: /\bi'm willing to\b/gi, replacement: '我愿意' },
  { pattern: /\bi'm eager to\b/gi, replacement: '我渴望' },
  { pattern: /\bi'm responsible for\b/gi, replacement: '我负责' },
  { pattern: /\bi'm grateful for\b/gi, replacement: '我感激' },
  { pattern: /\bi'm curious about\b/gi, replacement: '我对...好奇' },
  { pattern: /\bi'm serious about\b/gi, replacement: '我对...认真' },
  { pattern: /\bi'm on my way to\b/gi, replacement: '我在去...的路上' },
  { pattern: /\bi'm in charge of\b/gi, replacement: '我负责' },
  { pattern: /\bi'm in the mood for\b/gi, replacement: '我想' },
]

/**
 * 使用硅基流动/OpenAI兼容API进行翻译
 */
async function translateWithAPI(text: string, apiKey: string, apiBaseUrl?: string, modelName?: string): Promise<string | null> {
  try {
    const baseUrl = apiBaseUrl || 'https://api.siliconflow.cn/v1'
    const API_URL = baseUrl.endsWith('/')
      ? `${baseUrl}chat/completions`
      : `${baseUrl}/chat/completions`
    const model = modelName || 'deepseek-ai/DeepSeek-V3'

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional English-to-Chinese translator. Translate the following English text to fluent, natural Chinese. Only return the translation, no explanations or extra text. Keep the tone and style consistent with the original.'
          },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content.trim()
  } catch (error) {
    console.error('翻译API调用失败:', error)
    return null
  }
}

/**
 * 客户端备用翻译 - 基于词典和模式匹配
 */
function translateWithDictionary(text: string): string {
  if (!text || typeof text !== 'string') return ''

  let translation = text

  // 移除多余的空格
  translation = translation.replace(/\s+/g, ' ').trim()

  // 先进行句子级模式匹配（更长的模式优先）
  const sortedPatterns = [...sentencePatterns].sort((a, b) => {
    const aLen = a.pattern.source.length
    const bLen = b.pattern.source.length
    return bLen - aLen
  })

  for (const { pattern, replacement } of sortedPatterns) {
    translation = translation.replace(pattern, replacement)
  }

  // 再进行单词级翻译
  // 按单词长度降序排序，避免短词先匹配导致长词无法匹配
  const sortedWords = Object.entries(translationDictionary).sort((a, b) => b[0].length - a[0].length)

  for (const [english, chinese] of sortedWords) {
    const regex = new RegExp(`\\b${english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    translation = translation.replace(regex, chinese)
  }

  // 处理一些通用的英语语法结构
  translation = translation.replace(/\b(the|a|an)\s+/gi, '') // 移除冠词
  translation = translation.replace(/\s+(is|are|was|were|be|been|being)\s+/gi, ' ')
  translation = translation.replace(/\s+(have|has|had)\s+/gi, ' ')
  translation = translation.replace(/\s+(do|does|did)\s+/gi, ' ')
  translation = translation.replace(/\b(will|would|shall|should|may|might|can|could|must|ought to)\b/gi, '')

  // 清理多余空格
  translation = translation.replace(/\s+/g, ' ').trim()

  // 移除纯英文标点后的空格问题
  translation = translation.replace(/\s*([，。！？；：、])\s*/g, '$1')

  // 如果翻译后还是纯英文（没有完全翻译），添加提示
  if (/^[a-zA-Z\s.,!?;:'"()-]+$/.test(translation)) {
    return `[待翻译] ${text}`
  }

  return translation || '[翻译中...]'
}

/**
 * 翻译文本（英译中）
 * 优先使用API翻译，失败时使用客户端备用翻译
 */
export async function translateText(
  text: string,
  apiKey?: string,
  apiBaseUrl?: string,
  modelName?: string
): Promise<string> {
  if (!text || typeof text !== 'string') return ''

  const trimmedText = text.trim()
  if (!trimmedText) return ''

  // 检查缓存
  const cacheKey = `${trimmedText.toLowerCase()}|${apiBaseUrl}|${modelName}`
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!
  }

  // 如果提供了API key，尝试使用API翻译
  if (apiKey) {
    const apiResult = await translateWithAPI(trimmedText, apiKey, apiBaseUrl, modelName)
    if (apiResult) {
      translationCache.set(cacheKey, apiResult)
      return apiResult
    }
  }

  // 使用客户端备用翻译
  const dictionaryResult = translateWithDictionary(trimmedText)
  translationCache.set(cacheKey, dictionaryResult)
  return dictionaryResult
}

/**
 * 批量翻译多条文本
 */
export async function translateMultiple(texts: string[], apiKey?: string): Promise<string[]> {
  return Promise.all(texts.map(text => translateText(text, apiKey)))
}

/**
 * 清除翻译缓存
 */
export function clearTranslationCache(): void {
  translationCache.clear()
}

/**
 * 获取缓存大小
 */
export function getTranslationCacheSize(): number {
  return translationCache.size
}
