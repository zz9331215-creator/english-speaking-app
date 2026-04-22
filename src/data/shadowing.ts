export interface ShadowingSentence {
  english: string
  chinese: string
}

export interface ShadowingItem {
  id: string
  title: string
  titleEn: string
  category: 'story' | 'quote' | 'movie' | 'speech' | 'daily'
  sentences: ShadowingSentence[]
}

export const shadowingCategories = [
  { key: 'story' as const, name: '经典故事', icon: 'BookOpen' },
  { key: 'quote' as const, name: '名人名言', icon: 'Quote' },
  { key: 'movie' as const, name: '影视台词', icon: 'Film' },
  { key: 'speech' as const, name: '经典演讲', icon: 'Mic' },
  { key: 'daily' as const, name: '日常用语', icon: 'MessageCircle' },
]

export const shadowingItems: ShadowingItem[] = [
  // ========== 经典故事 ==========
  {
    id: 'wolf',
    title: '狼来了',
    titleEn: 'The Boy Who Cried Wolf',
    category: 'story',
    sentences: [
      { english: 'There was a boy who watched sheep on a hill.', chinese: '有一个男孩在山上看守羊群。' },
      { english: 'He felt bored.', chinese: '他觉得很无聊。' },
      { english: 'So he shouted, "Wolf! Wolf! Help!"', chinese: '于是他大喊："狼来了！狼来了！救命！"' },
      { english: 'People from the village ran up the hill.', chinese: '村里的人们跑上山来。' },
      { english: 'But they found no wolf.', chinese: '但他们没有发现狼。' },
      { english: 'The boy laughed. The people were angry.', chinese: '男孩笑了。人们很生气。' },
      { english: 'A few days later, he lied to them again.', chinese: '几天后，他又对他们撒了谎。' },
      { english: '"Wolf! Wolf! The sheep need help!" he shouted.', chinese: '"狼来了！狼来了！羊需要帮助！"他大喊道。' },
      { english: 'The people ran up the hill again.', chinese: '人们再次跑上山来。' },
      { english: 'Again, there was no wolf.', chinese: '再一次，没有狼。' },
      { english: 'One day, a real wolf came.', chinese: '有一天，一只真正的狼来了。' },
      { english: 'The boy cried for help, but no one came.', chinese: '男孩呼救，但没有人来。' },
      { english: 'The wolf ate many sheep.', chinese: '狼吃了很多羊。' },
      { english: 'The boy learned a lesson: never tell lies.', chinese: '男孩得到了教训：永远不要撒谎。' },
    ],
  },
  {
    id: 'three-pigs',
    title: '三只小猪',
    titleEn: 'The Three Little Pigs',
    category: 'story',
    sentences: [
      { english: 'Once upon a time, there were three little pigs.', chinese: '从前，有三只小猪。' },
      { english: 'They left home to build their own houses.', chinese: '他们离开家去建造自己的房子。' },
      { english: 'The first pig built a house of straw.', chinese: '第一只小猪用稻草建了一座房子。' },
      { english: 'The second pig built a house of sticks.', chinese: '第二只小猪用树枝建了一座房子。' },
      { english: 'The third pig built a house of bricks.', chinese: '第三只小猪用砖头建了一座房子。' },
      { english: 'A big bad wolf came to the first house.', chinese: '一只大灰狼来到了第一座房子前。' },
      { english: '"Little pig, little pig, let me come in!"', chinese: '"小猪，小猪，让我进去！"' },
      { english: '"Not by the hair on my chinny chin chin!"', chinese: '"休想！"' },
      { english: 'Then I will huff, and I will puff, and I will blow your house down.', chinese: '那我就吹啊吹，把你的房子吹倒。' },
      { english: 'The wolf blew down the straw house.', chinese: '狼吹倒了稻草房子。' },
      { english: 'The first pig ran to his brother\'s stick house.', chinese: '第一只小猪跑到了他兄弟的树枝房子里。' },
      { english: 'The wolf blew down the stick house too.', chinese: '狼也吹倒了树枝房子。' },
      { english: 'The two pigs ran to the brick house.', chinese: '两只小猪跑到了砖头房子里。' },
      { english: 'The wolf could not blow down the brick house.', chinese: '狼吹不倒砖头房子。' },
      { english: 'Hard work pays off in the end.', chinese: '努力工作最终会有回报。' },
    ],
  },
  {
    id: 'ugly-duckling',
    title: '丑小鸭',
    titleEn: 'The Ugly Duckling',
    category: 'story',
    sentences: [
      { english: 'Mother Duck had some eggs.', chinese: '鸭妈妈有一些蛋。' },
      { english: 'One by one, the eggs hatched.', chinese: '蛋一个接一个地孵化了。' },
      { english: 'But one egg was bigger than the others.', chinese: '但有一个蛋比其他的大。' },
      { english: 'When it hatched, the duckling was big and gray.', chinese: '当它孵化时，这只小鸭又大又灰。' },
      { english: '"You are so ugly!" the other ducks said.', chinese: '"你真丑！"其他鸭子说。' },
      { english: 'The poor duckling was very sad.', chinese: '可怜的小鸭非常伤心。' },
      { english: 'He ran away from home.', chinese: '他离家出走了。' },
      { english: 'Winter came, and he was cold and hungry.', chinese: '冬天来了，他又冷又饿。' },
      { english: 'When spring came, he saw his reflection in the water.', chinese: '当春天来临时，他在水中看到了自己的倒影。' },
      { english: 'He was no longer an ugly duckling.', chinese: '他不再是一只丑小鸭了。' },
      { english: 'He had grown into a beautiful white swan.', chinese: '他长成了一只美丽的天鹅。' },
      { english: 'Everyone admired his beauty.', chinese: '每个人都赞美他的美丽。' },
    ],
  },
  {
    id: 'lion-mouse',
    title: '狮子与老鼠',
    titleEn: 'The Lion and the Mouse',
    category: 'story',
    sentences: [
      { english: 'A big Lion was sleeping.', chinese: '一只大狮子正在睡觉。' },
      { english: 'A little Mouse ran over his nose.', chinese: '一只小老鼠跑过他的鼻子。' },
      { english: 'The Lion woke up and caught the Mouse.', chinese: '狮子醒来抓住了老鼠。' },
      { english: '"Please let me go!" cried the Mouse.', chinese: '"请放了我！"老鼠哭着说。' },
      { english: '"I may help you one day."', chinese: '"也许有一天我会帮你的。"' },
      { english: 'The Lion laughed and set the Mouse free.', chinese: '狮子笑了，放走了老鼠。' },
      { english: 'Some days later, the Lion was caught in a net.', chinese: '几天后，狮子被困在网里了。' },
      { english: 'He roared for help.', chinese: '他大声呼救。' },
      { english: 'The little Mouse heard him.', chinese: '小老鼠听到了他的声音。' },
      { english: 'She ran to the net and bit the ropes.', chinese: '她跑到网边咬断了绳子。' },
      { english: 'The Lion was free at last.', chinese: '狮子终于自由了。' },
      { english: 'Even the small can help the great.', chinese: '即使弱小也能帮助强大。' },
    ],
  },

  // ========== 名人名言 ==========
  {
    id: 'jobs',
    title: '乔布斯',
    titleEn: 'Steve Jobs',
    category: 'quote',
    sentences: [
      { english: 'Stay hungry, stay foolish.', chinese: '求知若饥，虚心若愚。' },
      { english: 'Your time is limited, so don\'t waste it living someone else\'s life.', chinese: '你的时间有限，所以不要浪费在过别人的生活上。' },
      { english: 'The only way to do great work is to love what you do.', chinese: '做伟大的工作的唯一方法就是热爱你所做的事。' },
      { english: 'Innovation distinguishes between a leader and a follower.', chinese: '创新区分领导者和追随者。' },
    ],
  },
  {
    id: 'einstein',
    title: '爱因斯坦',
    titleEn: 'Albert Einstein',
    category: 'quote',
    sentences: [
      { english: 'Imagination is more important than knowledge.', chinese: '想象力比知识更重要。' },
      { english: 'Life is like riding a bicycle. To keep your balance, you must keep moving.', chinese: '生活就像骑自行车。为了保持平衡，你必须不断前进。' },
      { english: 'Try not to become a man of success, but rather try to become a man of value.', chinese: '不要试图成为成功的人，而要试图成为有价值的人。' },
    ],
  },
  {
    id: 'confucius',
    title: '孔子',
    titleEn: 'Confucius',
    category: 'quote',
    sentences: [
      { english: 'What you do not want done to yourself, do not do to others.', chinese: '己所不欲，勿施于人。' },
      { english: 'It does not matter how slowly you go as long as you do not stop.', chinese: '只要不停下来，走得多慢都没关系。' },
      { english: 'The man who moves a mountain begins by carrying away small stones.', chinese: '移山的人从搬走小石头开始。' },
      { english: 'Real knowledge is to know the extent of one\'s ignorance.', chinese: '真正的知识是知道自己无知的程度。' },
    ],
  },
  {
    id: 'shakespeare',
    title: '莎士比亚',
    titleEn: 'William Shakespeare',
    category: 'quote',
    sentences: [
      { english: 'To be, or not to be, that is the question.', chinese: '生存还是毁灭，这是一个问题。' },
      { english: 'All the world\'s a stage, and all the men and women merely players.', chinese: '全世界是个舞台，男男女女都是演员。' },
      { english: 'Love all, trust a few, do wrong to none.', chinese: '爱所有人，信任少数人，不伤害任何人。' },
    ],
  },
  {
    id: 'lincoln',
    title: '林肯',
    titleEn: 'Abraham Lincoln',
    category: 'quote',
    sentences: [
      { english: 'Government of the people, by the people, for the people, shall not perish from the earth.', chinese: '民有、民治、民享的政府将永存于世。' },
      { english: 'The best way to predict your future is to create it.', chinese: '预测未来的最好方法就是创造未来。' },
    ],
  },
  {
    id: 'laozi',
    title: '老子',
    titleEn: 'Lao Tzu',
    category: 'quote',
    sentences: [
      { english: 'The journey of a thousand miles begins with one step.', chinese: '千里之行，始于足下。' },
      { english: 'A leader is best when people barely know he exists.', chinese: '太上，不知有之。' },
      { english: 'Nature does not hurry, yet everything is accomplished.', chinese: '大自然从不匆忙，却完成了一切。' },
    ],
  },

  // ========== 影视台词 ==========
  {
    id: 'kungfu-panda',
    title: '功夫熊猫',
    titleEn: 'Kung Fu Panda',
    category: 'movie',
    sentences: [
      { english: 'Yesterday is history, tomorrow is a mystery.', chinese: '昨天已成历史，明天还是谜团。' },
      { english: 'But today is a gift. That is why it is called the present.', chinese: '但今天是礼物，所以才叫现在（礼物）。' },
      { english: 'There are no accidents.', chinese: '世间没有偶然。' },
      { english: 'Your mind is like this water, my friend.', chinese: '你的心就像这水一样，我的朋友。' },
      { english: 'When it is agitated, it becomes difficult to see.', chinese: '当它动荡不安时，就很难看清。' },
      { english: 'But if you allow it to settle, the answer becomes clear.', chinese: '但如果你让它平静下来，答案就会变得清晰。' },
    ],
  },
  {
    id: 'forrest-gump',
    title: '阿甘正传',
    titleEn: 'Forrest Gump',
    category: 'movie',
    sentences: [
      { english: 'Mama always said life was like a box of chocolates.', chinese: '妈妈总是说生活就像一盒巧克力。' },
      { english: 'You never know what you\'re gonna get.', chinese: '你永远不知道你会得到什么。' },
      { english: 'Run, Forrest, run!', chinese: '跑，阿甘，跑！' },
      { english: 'My mama always said you\'ve got to put the past behind you before you can move on.', chinese: '妈妈总是说，只有放下过去，才能继续前进。' },
    ],
  },
  {
    id: 'shawshank',
    title: '肖申克的救赎',
    titleEn: 'The Shawshank Redemption',
    category: 'movie',
    sentences: [
      { english: 'Get busy living, or get busy dying.', chinese: '要么忙着活，要么忙着死。' },
      { english: 'Hope is a good thing, maybe the best of things.', chinese: '希望是件好事，也许是最好的事。' },
      { english: 'And no good thing ever dies.', chinese: '而美好的事物永不消逝。' },
      { english: 'Fear can hold you prisoner. Hope can set you free.', chinese: '恐惧让你成为囚徒，希望让你获得自由。' },
    ],
  },
  {
    id: 'titanic',
    title: '泰坦尼克号',
    titleEn: 'Titanic',
    category: 'movie',
    sentences: [
      { english: 'I\'m the king of the world!', chinese: '我是世界之王！' },
      { english: 'You jump, I jump.', chinese: '你跳，我就跳。' },
      { english: 'I\'ll never let go, Jack. I\'ll never let go.', chinese: '我永远不会放手，杰克。我永远不会放手。' },
    ],
  },
  {
    id: 'lotr',
    title: '指环王',
    titleEn: 'The Lord of the Rings',
    category: 'movie',
    sentences: [
      { english: 'My precious.', chinese: '我的宝贝。' },
      { english: 'Even the smallest person can change the course of the future.', chinese: '即使是最渺小的人也能改变未来的进程。' },
      { english: 'All we have to decide is what to do with the time that is given to us.', chinese: '我们要决定的是如何利用被赋予我们的时间。' },
    ],
  },
  {
    id: 'got',
    title: '权力的游戏',
    titleEn: 'Game of Thrones',
    category: 'movie',
    sentences: [
      { english: 'Winter is coming.', chinese: '凛冬将至。' },
      { english: 'A lion does not concern himself with the opinion of sheep.', chinese: '狮子不会在意绵羊的看法。' },
      { english: 'When you play the game of thrones, you win or you die.', chinese: '当你玩权力的游戏时，你要么赢，要么死。' },
    ],
  },

  // ========== 经典演讲 ==========
  {
    id: 'dream',
    title: 'I Have a Dream',
    titleEn: 'Martin Luther King Jr.',
    category: 'speech',
    sentences: [
      { english: 'I have a dream that one day this nation will rise up.', chinese: '我有一个梦想，有一天这个国家会站起来。' },
      { english: 'I have a dream that my four little children will one day live in a nation.', chinese: '我有一个梦想，我的四个孩子有一天会生活在一个国度里。' },
      { english: 'Where they will not be judged by the color of their skin.', chinese: '在那里他们不会因为肤色而被评判。' },
      { english: 'But by the content of their character.', chinese: '而是根据他们的品格内涵。' },
      { english: 'Free at last! Free at last!', chinese: '终于自由了！终于自由了！' },
      { english: 'Thank God Almighty, we are free at last!', chinese: '感谢全能的上帝，我们终于自由了！' },
    ],
  },
  {
    id: 'churchill',
    title: 'We Shall Fight',
    titleEn: 'Winston Churchill',
    category: 'speech',
    sentences: [
      { english: 'We shall go on to the end.', chinese: '我们将战斗到底。' },
      { english: 'We shall fight in France, we shall fight on the seas and oceans.', chinese: '我们将在法国战斗，我们将在海洋上战斗。' },
      { english: 'We shall fight with growing confidence and growing strength in the air.', chinese: '我们将在空中以日益增长的信心和力量战斗。' },
      { english: 'We shall defend our island, whatever the cost may be.', chinese: '无论代价如何，我们将保卫我们的岛屿。' },
      { english: 'We shall never surrender.', chinese: '我们绝不投降。' },
    ],
  },
  {
    id: 'gettysburg',
    title: '葛底斯堡演说',
    titleEn: 'Gettysburg Address',
    category: 'speech',
    sentences: [
      { english: 'Four score and seven years ago our fathers brought forth on this continent a new nation.', chinese: '八十七年前，我们的先辈在这个大陆上建立了一个新的国家。' },
      { english: 'Conceived in liberty, and dedicated to the proposition that all men are created equal.', chinese: '孕育于自由之中，奉行一切人生来平等的原则。' },
      { english: 'Government of the people, by the people, for the people, shall not perish from the earth.', chinese: '民有、民治、民享的政府将永存于世。' },
    ],
  },

  // ========== 日常用语 ==========
  {
    id: 'greeting',
    title: '问候与介绍',
    titleEn: 'Greetings & Introductions',
    category: 'daily',
    sentences: [
      { english: 'Hello, nice to meet you.', chinese: '你好，很高兴认识你。' },
      { english: 'My name is John. What\'s your name?', chinese: '我叫约翰。你叫什么名字？' },
      { english: 'I\'m from China. Where are you from?', chinese: '我来自中国。你来自哪里？' },
      { english: 'What do you do for a living?', chinese: '你是做什么工作的？' },
      { english: 'I work as a software engineer.', chinese: '我是一名软件工程师。' },
      { english: 'It\'s a pleasure to meet you.', chinese: '很荣幸认识你。' },
      { english: 'Have we met before?', chinese: '我们以前见过吗？' },
      { english: 'Let me introduce myself.', chinese: '让我自我介绍一下。' },
    ],
  },
  {
    id: 'directions',
    title: '问路',
    titleEn: 'Asking for Directions',
    category: 'daily',
    sentences: [
      { english: 'Excuse me, could you tell me how to get to the train station?', chinese: '打扰一下，你能告诉我怎么去火车站吗？' },
      { english: 'It\'s about a ten-minute walk from here.', chinese: '从这里步行大约十分钟。' },
      { english: 'Turn left at the traffic lights.', chinese: '在红绿灯处左转。' },
      { english: 'Go straight ahead until you see the bank.', chinese: '一直往前走，直到你看到银行。' },
      { english: 'Is it far from here?', chinese: '离这里远吗？' },
      { english: 'You can\'t miss it.', chinese: '你不会错过的。' },
    ],
  },
  {
    id: 'restaurant',
    title: '点餐与点饮料',
    titleEn: 'Ordering Food & Drinks',
    category: 'daily',
    sentences: [
      { english: 'A table for two, please.', chinese: '请给我一张两人桌。' },
      { english: 'Could I see the menu, please?', chinese: '我可以看一下菜单吗？' },
      { english: 'I\'ll have the grilled salmon with vegetables.', chinese: '我要烤三文鱼配蔬菜。' },
      { english: 'Could you make it less spicy?', chinese: '能不能做得不那么辣？' },
      { english: 'I\'d like a glass of water, please.', chinese: '请给我一杯水。' },
      { english: 'Could I get the check, please?', chinese: '请给我账单。' },
    ],
  },
  {
    id: 'shopping',
    title: '购物',
    titleEn: 'Shopping',
    category: 'daily',
    sentences: [
      { english: 'Excuse me, where can I find the dairy products?', chinese: '打扰一下，乳制品在哪里？' },
      { english: 'I\'m just looking, thank you.', chinese: '我只是看看，谢谢。' },
      { english: 'Do you have this in a smaller size?', chinese: '这个有小一号的吗？' },
      { english: 'How much does this cost?', chinese: '这个多少钱？' },
      { english: 'I\'ll take it.', chinese: '我买了。' },
      { english: 'Can I pay by credit card?', chinese: '可以刷卡吗？' },
    ],
  },
  {
    id: 'small-talk',
    title: '简单闲聊',
    titleEn: 'Small Talk',
    category: 'daily',
    sentences: [
      { english: 'Nice day, isn\'t it?', chinese: '天气不错，对吧？' },
      { english: 'How was your weekend?', chinese: '你周末过得怎么样？' },
      { english: 'What do you like to do in your free time?', chinese: '你空闲时间喜欢做什么？' },
      { english: 'I enjoy reading and hiking.', chinese: '我喜欢阅读和徒步。' },
      { english: 'Have you seen any good movies lately?', chinese: '你最近看了什么好电影吗？' },
      { english: 'I heard it\'s going to rain tomorrow.', chinese: '我听说明天会下雨。' },
    ],
  },
  {
    id: 'help',
    title: '请求帮助或澄清',
    titleEn: 'Asking for Help',
    category: 'daily',
    sentences: [
      { english: 'Could you help me with this?', chinese: '你能帮我一下吗？' },
      { english: 'I don\'t quite understand. Could you explain it again?', chinese: '我不太明白。你能再解释一遍吗？' },
      { english: 'Could you speak more slowly, please?', chinese: '请你说慢一点好吗？' },
      { english: 'What does this word mean?', chinese: '这个词是什么意思？' },
      { english: 'Could you repeat that?', chinese: '你能重复一遍吗？' },
      { english: 'Thank you for your help.', chinese: '谢谢你的帮助。' },
    ],
  },
  {
    id: 'booking',
    title: '预约或预订',
    titleEn: 'Making Reservations',
    category: 'daily',
    sentences: [
      { english: 'Hello, I\'d like to make an appointment.', chinese: '你好，我想预约。' },
      { english: 'What time would be convenient for you?', chinese: '什么时间对你方便？' },
      { english: 'I\'d like to book a table for Friday evening.', chinese: '我想预订周五晚上的桌子。' },
      { english: 'Do you have any rooms available next week?', chinese: '你们下周有空房吗？' },
      { english: 'Could I cancel my reservation?', chinese: '我可以取消预约吗？' },
    ],
  },
  {
    id: 'likes',
    title: '表达喜好',
    titleEn: 'Expressing Preferences',
    category: 'daily',
    sentences: [
      { english: 'I like it.', chinese: '我喜欢。' },
      { english: 'I don\'t really like coffee.', chinese: '我不是很喜欢咖啡。' },
      { english: 'I love traveling to new places.', chinese: '我喜欢去新的地方旅行。' },
      { english: 'I\'m not a big fan of spicy food.', chinese: '我不是很喜欢辣的食物。' },
      { english: 'My favorite color is blue.', chinese: '我最喜欢的颜色是蓝色。' },
      { english: 'I prefer tea to coffee.', chinese: '比起咖啡我更喜欢茶。' },
    ],
  },
  {
    id: 'routine',
    title: '谈论日常作息',
    titleEn: 'Daily Routines',
    category: 'daily',
    sentences: [
      { english: 'I wake up early.', chinese: '我起得很早。' },
      { english: 'I usually have breakfast at seven.', chinese: '我通常七点吃早餐。' },
      { english: 'I take the subway to work.', chinese: '我乘地铁去上班。' },
      { english: 'I work from nine to five.', chinese: '我朝九晚五地工作。' },
      { english: 'I go to the gym three times a week.', chinese: '我每周去三次健身房。' },
      { english: 'I usually go to bed around eleven.', chinese: '我通常十一点左右睡觉。' },
    ],
  },
  {
    id: 'goodbye',
    title: '告别与未来计划',
    titleEn: 'Goodbyes & Future Plans',
    category: 'daily',
    sentences: [
      { english: 'Goodbye. Take care!', chinese: '再见。保重！' },
      { english: 'I\'m planning to visit Japan next year.', chinese: '我计划明年去日本旅游。' },
      { english: 'I hope to see you again soon.', chinese: '希望很快再见到你。' },
      { english: 'Let\'s keep in touch.', chinese: '让我们保持联系。' },
      { english: 'Have a safe trip!', chinese: '祝你旅途平安！' },
      { english: 'I look forward to meeting you again.', chinese: '期待再次见到你。' },
    ],
  },
]

export function getShadowingItemsByCategory(category: ShadowingItem['category']) {
  return shadowingItems.filter((item) => item.category === category)
}

export function getShadowingItemById(id: string) {
  return shadowingItems.find((item) => item.id === id)
}
