import type { Topic, DailyQuote } from '../types'

export const topics: Topic[] = [
  {
    id: 'self-introduction',
    title: '自我介绍',
    titleEn: 'Self Introduction',
    description: '学习如何用英语介绍自己，包括姓名、职业、兴趣爱好等',
    icon: 'User',
    category: 'daily',
    difficulty: 'beginner',
    systemPrompt: 'You are a friendly English conversation partner helping the user practice self-introduction. Encourage them to talk about their name, where they are from, their job/studies, and hobbies. Provide gentle corrections and suggestions for improvement.'
  },
  {
    id: 'hobbies',
    title: '兴趣爱好',
    titleEn: 'Hobbies & Interests',
    description: '讨论你喜欢的活动和兴趣爱好，分享你的热情',
    icon: 'Heart',
    category: 'daily',
    difficulty: 'beginner',
    systemPrompt: 'You are a friendly English conversation partner discussing hobbies and interests. Ask about what the user enjoys doing in their free time, why they like those activities, and share enthusiasm. Provide gentle corrections and suggestions for improvement.'
  },
  {
    id: 'weather',
    title: '天气情况',
    titleEn: 'Weather',
    description: '学习谈论天气，这是英语对话中最常见的话题之一',
    icon: 'Cloud',
    category: 'daily',
    difficulty: 'beginner',
    systemPrompt: 'You are a friendly English conversation partner discussing weather. Talk about current weather, favorite seasons, weather preferences, and how weather affects plans. Provide gentle corrections and suggestions for improvement.'
  },
  {
    id: 'weekend-plans',
    title: '周末安排',
    titleEn: 'Weekend Plans',
    description: '讨论周末计划和休闲活动，学习未来的表达方式',
    icon: 'Calendar',
    category: 'daily',
    difficulty: 'beginner',
    systemPrompt: 'You are a friendly English conversation partner discussing weekend plans and leisure activities. Ask about what the user did last weekend or plans to do next weekend. Provide gentle corrections and suggestions for improvement.'
  },
  {
    id: 'shopping',
    title: '超市购物',
    titleEn: 'Shopping',
    description: '模拟购物场景，学习询问价格、尺寸和付款等表达',
    icon: 'ShoppingCart',
    category: 'daily',
    difficulty: 'intermediate',
    systemPrompt: 'You are a friendly shopkeeper in an English conversation practice. Help the user practice shopping scenarios - asking about products, prices, sizes, making purchases. Provide gentle corrections and suggestions for improvement.'
  },
  {
    id: 'coffee-shop',
    title: '咖啡店点单',
    titleEn: 'Coffee Shop',
    description: '在咖啡店场景中练习点单，学习咖啡相关的词汇',
    icon: 'Coffee',
    category: 'daily',
    difficulty: 'intermediate',
    systemPrompt: 'You are a friendly barista in a coffee shop. Help the user practice ordering coffee, asking about menu items, customizing their order, and making payment. Provide gentle corrections and suggestions for improvement.'
  },
  {
    id: 'doctor',
    title: '医院看病',
    titleEn: 'At the Doctor',
    description: '学习描述症状和与医生交流的医疗场景对话',
    icon: 'Stethoscope',
    category: 'daily',
    difficulty: 'intermediate',
    systemPrompt: 'You are a caring doctor in a medical consultation. Help the user practice describing symptoms, explaining how they feel, and understanding medical advice. Provide gentle corrections and suggestions for improvement.'
  },
  {
    id: 'renting',
    title: '租房子',
    titleEn: 'Renting an Apartment',
    description: '练习租房场景，学习询问房租、设施和合同条款',
    icon: 'Home',
    category: 'daily',
    difficulty: 'advanced',
    systemPrompt: 'You are a property agent helping someone find an apartment. Help the user practice asking about rent, amenities, location, lease terms, and negotiating. Provide gentle corrections and suggestions for improvement.'
  },
  {
    id: 'job-interview',
    title: '求职面试',
    titleEn: 'Job Interview',
    description: '模拟工作面试场景，学习专业英语表达',
    icon: 'Briefcase',
    category: 'business',
    difficulty: 'advanced',
    systemPrompt: 'You are a professional interviewer conducting a job interview. Ask about experience, skills, strengths, weaknesses, and career goals. Provide professional feedback and suggestions for improvement.'
  },
  {
    id: 'travel',
    title: '旅行计划',
    titleEn: 'Travel Plans',
    description: '讨论旅行目的地、计划和经历，学习旅行相关词汇',
    icon: 'Plane',
    category: 'travel',
    difficulty: 'intermediate',
    systemPrompt: 'You are a friendly travel companion discussing travel plans. Talk about dream destinations, past trips, travel preferences, and recommendations. Provide gentle corrections and suggestions for improvement.'
  },
  {
    id: 'restaurant',
    title: '餐厅用餐',
    titleEn: 'At a Restaurant',
    description: '练习餐厅预订、点餐和用餐时的英语对话',
    icon: 'UtensilsCrossed',
    category: 'daily',
    difficulty: 'intermediate',
    systemPrompt: 'You are a friendly waiter/waitress at a restaurant. Help the user practice making reservations, ordering food, asking about dishes, and paying the bill. Provide gentle corrections and suggestions for improvement.'
  },
  {
    id: 'technology',
    title: '科技话题',
    titleEn: 'Technology',
    description: '讨论最新的科技趋势、设备和数字生活',
    icon: 'Smartphone',
    category: 'social',
    difficulty: 'intermediate',
    systemPrompt: 'You are a tech-savvy friend discussing technology. Talk about gadgets, apps, social media, AI, and how technology affects daily life. Provide gentle corrections and suggestions for improvement.'
  },
  {
    id: 'movies',
    title: '电影讨论',
    titleEn: 'Movies & TV',
    description: '分享你喜欢的电影和电视剧，讨论剧情和演员',
    icon: 'Film',
    category: 'social',
    difficulty: 'intermediate',
    systemPrompt: 'You are a movie enthusiast discussing films and TV shows. Ask about favorites, recent watches, genres, actors, and recommendations. Provide gentle corrections and suggestions for improvement.'
  },
  {
    id: 'food-cooking',
    title: '美食烹饪',
    titleEn: 'Food & Cooking',
    description: '讨论美食、烹饪技巧和各国料理',
    icon: 'ChefHat',
    category: 'daily',
    difficulty: 'intermediate',
    systemPrompt: 'You are a food lover discussing cuisine and cooking. Talk about favorite foods, cooking experiences, restaurants, and recipes. Provide gentle corrections and suggestions for improvement.'
  },
  {
    id: 'sports',
    title: '运动健身',
    titleEn: 'Sports & Fitness',
    description: '讨论运动爱好、健身计划和体育活动',
    icon: 'Dumbbell',
    category: 'social',
    difficulty: 'intermediate',
    systemPrompt: 'You are a fitness enthusiast discussing sports and exercise. Ask about favorite sports, workout routines, fitness goals, and athletic events. Provide gentle corrections and suggestions for improvement.'
  },
  {
    id: 'education',
    title: '教育学习',
    titleEn: 'Education',
    description: '讨论学习方法、教育经历和学术话题',
    icon: 'GraduationCap',
    category: 'academic',
    difficulty: 'advanced',
    systemPrompt: 'You are an educator discussing learning and education. Talk about study methods, educational experiences, academic interests, and learning goals. Provide gentle corrections and suggestions for improvement.'
  }
]

export const dailyQuotes: DailyQuote[] = [
  {
    id: '1',
    english: 'The only way to do great work is to love what you do.',
    chinese: '做伟大的工作的唯一方法就是热爱你所做的事情。',
    author: 'Steve Jobs',
    date: '2026-04-21'
  },
  {
    id: '2',
    english: 'Life is what happens when you\'re busy making other plans.',
    chinese: '生活就是当你忙于制定其他计划时发生的事情。',
    author: 'John Lennon',
    date: '2026-04-22'
  },
  {
    id: '3',
    english: 'The future belongs to those who believe in the beauty of their dreams.',
    chinese: '未来属于那些相信梦想之美的人。',
    author: 'Eleanor Roosevelt',
    date: '2026-04-23'
  },
  {
    id: '4',
    english: 'It is during our darkest moments that we must focus to see the light.',
    chinese: '在我们最黑暗的时刻，我们必须集中精力才能看到光明。',
    author: 'Aristotle',
    date: '2026-04-24'
  },
  {
    id: '5',
    english: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    chinese: '成功不是终点，失败也不是致命的：重要的是继续前进的勇气。',
    author: 'Winston Churchill',
    date: '2026-04-25'
  }
]

export const getTopicById = (id: string): Topic | undefined => {
  return topics.find(topic => topic.id === id)
}

export const getTopicsByCategory = (category: Topic['category']): Topic[] => {
  return topics.filter(topic => topic.category === category)
}

export const getDailyQuote = (): DailyQuote => {
  const today = new Date().toISOString().split('T')[0]
  const quote = dailyQuotes.find(q => q.date === today)
  return quote || dailyQuotes[0]
}
