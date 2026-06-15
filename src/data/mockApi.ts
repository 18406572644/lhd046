import type { 
  DailyFortune, 
  WeeklyFortune, 
  MonthlyFortune, 
  PersonalityAnalysis, 
  CompatibilityMatch,
  ZodiacKnowledge,
  LuckyItem,
  TrendData,
  TrendDataPoint,
  RadarData,
  ZodiacRanking,
  AstronomicalEvent, 
  FortuneFluctuation,
  SmartReminder,
  ReminderSensitivity
} from '@/types'
import { zodiacSigns, getSignById } from './zodiacSigns'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const generateRandomScore = () => Math.floor(Math.random() * 30) + 70

const luckyItemsData: LuckyItem[] = [
  {
    id: 'l1',
    name: '紫水晶手链',
    meaning: '紫水晶象征智慧与灵性，能够提升直觉力，带来平静与安宁，帮助佩戴者在决策时保持清醒。',
    suitableTime: '面试、考试、重要会议时佩戴效果最佳',
    icon: '💎',
    color: '#9b59b6'
  },
  {
    id: 'l2',
    name: '银质项链',
    meaning: '银具有净化能量的作用，能够抵御负面情绪，带来纯净的能量，增强佩戴者的魅力与气质。',
    suitableTime: '日常佩戴、社交场合、约会时佩戴',
    icon: '📿',
    color: '#c0c0c0'
  },
  {
    id: 'l3',
    name: '黑曜石吊坠',
    meaning: '黑曜石是强大的保护石，能够吸收负面能量，辟邪挡煞，带来勇气与力量，保护佩戴者平安。',
    suitableTime: '夜间出行、去医院或墓地等阴气较重的地方时佩戴',
    icon: '🖤',
    color: '#2c3e50'
  },
  {
    id: 'l4',
    name: '月光石戒指',
    meaning: '月光石象征爱情与浪漫，能够提升异性缘，带来温柔的能量，帮助佩戴者吸引美好的姻缘。',
    suitableTime: '约会、表白、参加婚礼或相亲时佩戴',
    icon: '💍',
    color: '#ecf0f1'
  },
  {
    id: 'l5',
    name: '蓝宝石耳环',
    meaning: '蓝宝石象征忠诚与智慧，能够提升沟通表达能力，带来好运与成功，增强个人气场。',
    suitableTime: '演讲、谈判、商务洽谈等需要展现自信的场合',
    icon: '👂',
    color: '#3498db'
  },
  {
    id: 'l6',
    name: '珍珠发饰',
    meaning: '珍珠象征纯洁与优雅，能够提升气质，带来平和的心态，帮助佩戴者展现温柔大方的一面。',
    suitableTime: '正式晚宴、毕业典礼、重要庆典等场合佩戴',
    icon: '🌸',
    color: '#fffaf0'
  },
  {
    id: 'l7',
    name: '红宝石手镯',
    meaning: '红宝石象征热情与生命力，能够提升能量与活力，带来勇气与激情，增强自信心。',
    suitableTime: '参加比赛、追求目标、需要展现领导力时佩戴',
    icon: '❤️',
    color: '#e74c3c'
  },
  {
    id: 'l8',
    name: '翡翠玉佩',
    meaning: '翡翠象征平安与福气，能够带来好运与长寿，保佑佩戴者平安健康，是传统的吉祥之物。',
    suitableTime: '常年佩戴，尤其适合本命年或远行时佩戴',
    icon: '🍀',
    color: '#2ecc71'
  },
  {
    id: 'l9',
    name: '水晶球摆件',
    meaning: '白水晶能够净化空间能量，提升专注力，带来清晰的思维，适合放置在办公桌或学习区。',
    suitableTime: '放置在书房、办公室，帮助提升工作学习效率',
    icon: '🔮',
    color: '#e8f4f8'
  },
  {
    id: 'l10',
    name: '星座钥匙扣',
    meaning: '带有个人星座符号的钥匙扣，能够带来专属的幸运能量，时刻守护佩戴者，带来好运。',
    suitableTime: '随身携带，每日使用，尤其适合出行时',
    icon: '🔑',
    color: '#f39c12'
  },
  {
    id: 'l11',
    name: '星空笔记本',
    meaning: '记录梦想与愿望的星空笔记本，能够帮助你理清思绪，将目标具象化，吸引美好事物的到来。',
    suitableTime: '每日记录、制定计划、写日记时使用',
    icon: '📓',
    color: '#1a1a2e'
  },
  {
    id: 'l12',
    name: '羽毛书签',
    meaning: '羽毛象征自由与轻盈，能够带来灵感与创意，帮助佩戴者在阅读和学习中获得新的启发。',
    suitableTime: '阅读、学习、写作时使用，尤其适合学生和创作者',
    icon: '🪶',
    color: '#dfe6e9'
  },
  {
    id: 'l13',
    name: '薰衣草香薰',
    meaning: '薰衣草的香气能够舒缓情绪，带来平静与放松，帮助改善睡眠质量，营造温馨的氛围。',
    suitableTime: '睡前、冥想、放松身心时使用',
    icon: '💜',
    color: '#a29bfe'
  },
  {
    id: 'l14',
    name: '幸运四叶草',
    meaning: '四叶草是幸运的象征，每一片叶子分别代表真爱、健康、名誉、财富，能够带来全方位的好运。',
    suitableTime: '随身携带，尤其适合考试、面试、抽奖等场合',
    icon: '🍀',
    color: '#00b894'
  },
  {
    id: 'l15',
    name: '金色星星',
    meaning: '金色星星象征希望与光明，能够带来正能量，帮助佩戴者在黑暗中找到方向，实现梦想。',
    suitableTime: '感到迷茫、需要鼓励、追求梦想时佩戴',
    icon: '⭐',
    color: '#fdcb6e'
  },
  {
    id: 'l16',
    name: '月亮挂饰',
    meaning: '月亮象征女性力量与直觉，能够提升感知力，带来宁静与温柔的能量，保护夜间出行的人。',
    suitableTime: '挂在卧室或车内，尤其适合夜间工作或经常熬夜的人',
    icon: '🌙',
    color: '#f1c40f'
  }
]

const dailyTexts = {
  overall: [
    '今天星象对你颇为有利，整体运势呈上升趋势。',
    '今日你的能量充沛，适合积极行动。',
    '今天可能会有意外的惊喜降临。',
    '今日运势平稳，但需注意细节处理。',
    '今天你的直觉特别敏锐，不妨相信自己的判断。',
    '今日人际关系运势极佳，适合拓展人脉。'
  ],
  love: [
    '单身者有机会遇到心仪对象，主动出击成功率高。',
    '有伴者与伴侣感情升温，适合安排浪漫约会。',
    '感情上需要多些耐心和理解，避免冲动。',
    '今日桃花运旺盛，魅力四射。',
    '感情进入新阶段，需要认真思考未来。',
    '适合与伴侣深入沟通，化解误会。'
  ],
  career: [
    '工作上会有新的机遇，要好好把握。',
    '今日适合处理重要事务，效率颇高。',
    '团队合作运势佳，适合与同事协作。',
    '工作中可能遇到挑战，但你能从容应对。',
    '今日创造力爆棚，适合创意类工作。',
    '注意与上司沟通，把握表现机会。'
  ],
  wealth: [
    '财运亨通，可能有意外收入。',
    '投资理财运势不错，可谨慎尝试。',
    '今日不宜大额投资，保守为宜。',
    '财运稳步上升，量入为出为佳。',
    '可能收到欠款或分红，财源广进。',
    '注意理性消费，避免冲动购物。'
  ],
  health: [
    '身体状态良好，适合户外运动。',
    '注意饮食规律，保护肠胃健康。',
    '今日精力充沛，但也要注意休息。',
    '关注睡眠质量，保证充足休息。',
    '适合放松身心，缓解压力。',
    '注意保护视力，减少屏幕时间。'
  ]
}

export const getDailyFortune = async (signId: string, date: Date): Promise<DailyFortune> => {
  await delay(800)
  const dateStr = format(date, 'yyyy-MM-dd')
  const sign = zodiacSigns.find(s => s.id === signId)!
  
  return {
    signId,
    date: dateStr,
    overallScore: generateRandomScore(),
    loveScore: generateRandomScore(),
    careerScore: generateRandomScore(),
    wealthScore: generateRandomScore(),
    healthScore: generateRandomScore(),
    overallText: dailyTexts.overall[Math.floor(Math.random() * dailyTexts.overall.length)],
    loveText: dailyTexts.love[Math.floor(Math.random() * dailyTexts.love.length)],
    careerText: dailyTexts.career[Math.floor(Math.random() * dailyTexts.career.length)],
    wealthText: dailyTexts.wealth[Math.floor(Math.random() * dailyTexts.wealth.length)],
    healthText: dailyTexts.health[Math.floor(Math.random() * dailyTexts.health.length)],
    luckyItem: luckyItemsData[Math.floor(Math.random() * luckyItemsData.length)].name,
    luckyNumber: sign.luckyNumber[Math.floor(Math.random() * sign.luckyNumber.length)],
    luckyColor: sign.luckyColor
  }
}

export const getWeeklyFortune = async (signId: string, date: Date): Promise<WeeklyFortune> => {
  await delay(600)
  const weekStart = startOfWeek(date, { locale: zhCN, weekStartsOn: 1 })
  const weekEnd = endOfWeek(date, { locale: zhCN, weekStartsOn: 1 })
  
  return {
    signId,
    weekStart: format(weekStart, 'yyyy-MM-dd'),
    weekEnd: format(weekEnd, 'yyyy-MM-dd'),
    overallScore: generateRandomScore(),
    loveScore: generateRandomScore(),
    careerScore: generateRandomScore(),
    wealthScore: generateRandomScore(),
    keyEvents: [
      '周初可能有重要会议或决策',
      '周三前后人际关系活跃',
      '周末适合休息放松'
    ],
    advice: '本周运势整体向好，保持积极心态，把握机遇的同时注意劳逸结合。'
  }
}

export const getMonthlyFortune = async (signId: string, year: number, month: number): Promise<MonthlyFortune> => {
  await delay(600)
  
  return {
    signId,
    year,
    month,
    overallScore: generateRandomScore(),
    loveScore: generateRandomScore(),
    careerScore: generateRandomScore(),
    wealthScore: generateRandomScore(),
    highlights: [
      '事业上有突破机会',
      '感情生活丰富多彩',
      '财务状况稳步提升'
    ],
    challenges: [
      '需要平衡工作与生活',
      '注意情绪管理',
      '避免过度投资'
    ],
    advice: '本月是蓄力发展的好时机，制定清晰目标，稳步前行。'
  }
}

export const getPersonalityAnalysis = async (signId: string): Promise<PersonalityAnalysis> => {
  await delay(500)
  
  const analysisMap: Record<string, PersonalityAnalysis> = {
    aries: {
      signId: 'aries',
      strengths: ['勇敢果断', '热情开朗', '行动力强', '乐观向上', '正直坦率'],
      weaknesses: ['冲动急躁', '缺乏耐心', '好胜心强', '粗心大意', '容易放弃'],
      traits: [
        { name: '冒险精神', description: '天生喜欢挑战，不畏惧未知，勇于尝试新事物。' },
        { name: '领导才能', description: '具有天生的领导力，善于带领团队前进。' },
        { name: '直率坦诚', description: '说话直接，不喜欢拐弯抹角，对人真诚。' }
      ],
      loveStyle: '在爱情中积极主动，喜欢就会勇敢追求，对感情专一且热情。',
      workStyle: '工作中充满干劲，喜欢有挑战性的任务，执行力强但有时缺乏规划。',
      friendshipStyle: '对朋友仗义豪爽，愿意为朋友两肋插刀，是非常可靠的朋友。'
    },
    taurus: {
      signId: 'taurus',
      strengths: ['稳重可靠', '耐心细致', '忠诚专一', '勤俭节约', '艺术感强'],
      weaknesses: ['固执己见', '占有欲强', '懒惰拖延', '过于谨慎', '不喜变化'],
      traits: [
        { name: '坚韧不拔', description: '认定目标就会坚持到底，不达目的决不罢休。' },
        { name: '感官敏锐', description: '对美和舒适有很高的追求，懂得享受生活。' },
        { name: '务实稳健', description: '做事脚踏实地，不喜欢冒险，追求稳定。' }
      ],
      loveStyle: '在感情中慢热但专一，一旦认定就会全心投入，渴望长久稳定的关系。',
      workStyle: '工作认真负责，注重细节和质量，适合需要耐心和精确度的工作。',
      friendshipStyle: '对朋友忠诚可靠，虽然不善于表达，但会用实际行动证明友情。'
    },
    gemini: {
      signId: 'gemini',
      strengths: ['聪明机智', '能言善辩', '适应力强', '好奇心旺', '多才多艺'],
      weaknesses: ['三心二意', '不够专注', '容易焦虑', '话太多', '善变'],
      traits: [
        { name: '思维敏捷', description: '反应快，学习能力强，善于处理各种信息。' },
        { name: '社交达人', description: '善于沟通，能快速与陌生人建立联系。' },
        { name: '兴趣广泛', description: '对很多事物都感兴趣，知识面广但可能不够深入。' }
      ],
      loveStyle: '喜欢有趣的灵魂，在感情中需要新鲜感和精神共鸣，害怕束缚。',
      workStyle: '适合需要创意和沟通的工作，能同时处理多项任务但容易分心。',
      friendshipStyle: '朋友众多，善于调节气氛，是朋友圈中的开心果。'
    },
    cancer: {
      signId: 'cancer',
      strengths: ['温柔体贴', '重情重义', '有同情心', '持家有道', '记忆力强'],
      weaknesses: ['敏感多疑', '情绪波动', '过度保护', '念旧放不下', '缺乏安全感'],
      traits: [
        { name: '情感丰富', description: '感情细腻，能敏锐感知他人情绪变化。' },
        { name: '家庭观念', description: '非常重视家庭和亲情，是顾家的好典范。' },
        { name: '保护欲强', description: '对自己在乎的人有强烈的保护欲。' }
      ],
      loveStyle: '在感情中极度需要安全感，温柔体贴，会全心全意为对方付出。',
      workStyle: '工作中细心负责，善于团队协作，能很好地照顾同事的感受。',
      friendshipStyle: '对朋友关怀备至，善于倾听，是朋友们的情感树洞。'
    },
    leo: {
      signId: 'leo',
      strengths: ['自信大方', '慷慨大方', '领导力强', '正义感强', '积极乐观'],
      weaknesses: ['骄傲自大', '虚荣心强', '控制欲强', '不能接受批评', '爱面子'],
      traits: [
        { name: '王者风范', description: '天生具有领袖气质，气场强大，受人瞩目。' },
        { name: '慷慨豪爽', description: '对朋友大方，愿意分享，不斤斤计较。' },
        { name: '自尊心强', description: '非常在意他人评价，渴望被认可和崇拜。' }
      ],
      loveStyle: '在爱情中浪漫热情，喜欢被崇拜的感觉，对爱人保护欲强。',
      workStyle: '适合领导岗位，有决断力，能带领团队创造佳绩。',
      friendshipStyle: '对朋友仗义，愿意为朋友出头，是朋友们的靠山。'
    },
    virgo: {
      signId: 'virgo',
      strengths: ['追求完美', '细心谨慎', '勤奋努力', '分析能力强', '自律性高'],
      weaknesses: ['挑剔苛刻', '过于拘谨', '容易焦虑', '完美主义', '不善表达'],
      traits: [
        { name: '细节控', description: '注重细节，追求完美，对自己和他人要求都很高。' },
        { name: '务实高效', description: '做事有条理，讲求效率，不喜欢浪费时间。' },
        { name: '服务精神', description: '乐于助人，愿意为他人提供帮助和服务。' }
      ],
      loveStyle: '在感情中谨慎内敛，不轻易动心，一旦投入就会很认真。',
      workStyle: '工作中一丝不苟，追求完美，适合需要精细操作的工作。',
      friendshipStyle: '虽然话不多，但会用实际行动关心朋友，是可靠的聆听者。'
    },
    libra: {
      signId: 'libra',
      strengths: ['优雅大方', '公正客观', '善于调解', '审美出众', '温和友善'],
      weaknesses: ['优柔寡断', '依赖他人', '追求表面', '怕得罪人', '懒惰'],
      traits: [
        { name: '平衡大师', description: '追求和谐与平衡，善于调解矛盾和纠纷。' },
        { name: '社交高手', description: '待人温和友善，懂得察言观色，人缘极好。' },
        { name: '艺术天赋', description: '审美品味高，对艺术和美有独到见解。' }
      ],
      loveStyle: '在感情中追求浪漫和平衡，注重对方的外貌和气质。',
      workStyle: '善于协调和沟通，适合公关、人事等需要平衡各方的工作。',
      friendshipStyle: '朋友很多，善于维持友谊，是朋友们的和事佬。'
    },
    scorpio: {
      signId: 'scorpio',
      strengths: ['意志坚定', '洞察力强', '情感深刻', '神秘迷人', '忠诚不渝'],
      weaknesses: ['控制欲强', '报复心重', '多疑猜忌', '过于执着', '占有欲强'],
      traits: [
        { name: '深邃神秘', description: '给人神秘的感觉，内心世界复杂而深刻。' },
        { name: '直觉敏锐', description: '第六感超强，能洞察事物的本质和他人的动机。' },
        { name: '韧性极强', description: '遇到困难绝不轻易放弃，有很强的抗压能力。' }
      ],
      loveStyle: '在感情中爱恨分明，占有欲强，爱得深刻而热烈。',
      workStyle: '工作中目标明确，韧性十足，适合需要深度钻研的工作。',
      friendshipStyle: '对朋友极其忠诚，但背叛者会被永远排除在朋友圈外。'
    },
    sagittarius: {
      signId: 'sagittarius',
      strengths: ['乐观开朗', '热爱自由', '正直坦诚', '追求真理', '行动力强'],
      weaknesses: ['心直口快', '缺乏耐心', '容易冲动', '不够细心', '言过其实'],
      traits: [
        { name: '热爱自由', description: '向往无拘无束的生活，讨厌被束缚。' },
        { name: '哲学家气质', description: '对人生和世界有深刻思考，追求真理。' },
        { name: '乐天派', description: '永远积极乐观，总能看到事物好的一面。' }
      ],
      loveStyle: '在感情中需要空间和自由，讨厌被束缚，喜欢志同道合的伴侣。',
      workStyle: '适合有挑战性和自由度的工作，不喜欢按部就班。',
      friendshipStyle: '朋友遍天下，乐观开朗的性格很容易交到朋友。'
    },
    capricorn: {
      signId: 'capricorn',
      strengths: ['踏实稳重', '责任感强', '意志坚定', '有野心', '自律性高'],
      weaknesses: ['过于严肃', '冷漠保守', '工作狂', '不容易亲近', '悲观'],
      traits: [
        { name: '事业心强', description: '对事业有很高追求，目标明确，脚踏实地。' },
        { name: '责任感', description: '对工作和家庭都有极强的责任感，值得信赖。' },
        { name: '隐忍坚韧', description: '能承受巨大压力，默默努力直到成功。' }
      ],
      loveStyle: '在感情中慢热谨慎，一旦投入就会认真负责，渴望稳定长久。',
      workStyle: '工作极其认真负责，有耐心和毅力，适合需要长期坚持的工作。',
      friendshipStyle: '虽然朋友不多，但都是非常可靠的至交好友。'
    },
    aquarius: {
      signId: 'aquarius',
      strengths: ['创新思维', '独立自由', '人道主义', '智商高', '友善待人'],
      weaknesses: ['叛逆固执', '情感疏离', '理想主义', '难以预测', '过于理智'],
      traits: [
        { name: '特立独行', description: '有自己独特的想法和行为方式，不随波逐流。' },
        { name: '创新精神', description: '思维活跃，经常有天马行空的创意。' },
        { name: '人道主义', description: '关心社会，乐于助人，有强烈的社会责任感。' }
      ],
      loveStyle: '在感情中追求精神共鸣，需要独立空间，不喜欢过于黏腻。',
      workStyle: '适合创意类和研发类工作，不喜欢墨守成规。',
      friendshipStyle: '对朋友友善真诚，尊重每个人的独特性。'
    },
    pisces: {
      signId: 'pisces',
      strengths: ['浪漫多情', '心地善良', '直觉敏锐', '艺术天赋', '善解人意'],
      weaknesses: ['优柔寡断', '逃避现实', '多愁善感', '容易受骗', '缺乏自信'],
      traits: [
        { name: '浪漫梦幻', description: '天生浪漫，爱幻想，对美好事物有强烈追求。' },
        { name: '同理心强', description: '能深切体会他人的痛苦和快乐，极具同情心。' },
        { name: '艺术气质', description: '有很强的艺术感知力和创造力。' }
      ],
      loveStyle: '在爱情中浪漫多情，愿意为对方牺牲奉献，渴望童话故事般的爱情。',
      workStyle: '适合艺术类、服务类工作，在充满爱的环境中能发挥最大潜能。',
      friendshipStyle: '对朋友温柔体贴，善解人意，是很好的倾听者和安慰者。'
    }
  }
  
  return analysisMap[signId] || analysisMap.aries
}

export const getCompatibility = async (sign1Id: string, sign2Id: string): Promise<CompatibilityMatch> => {
  await delay(700)
  
  const compatibilityMap: Record<string, number> = {
    'aries-aries': 75, 'aries-taurus': 65, 'aries-gemini': 85, 'aries-cancer': 55,
    'aries-leo': 90, 'aries-virgo': 60, 'aries-libra': 75, 'aries-scorpio': 50,
    'aries-sagittarius': 95, 'aries-capricorn': 55, 'aries-aquarius': 80, 'aries-pisces': 65,
    'taurus-aries': 65, 'taurus-taurus': 85, 'taurus-gemini': 60, 'taurus-cancer': 90,
    'taurus-leo': 70, 'taurus-virgo': 95, 'taurus-libra': 80, 'taurus-scorpio': 75,
    'taurus-sagittarius': 50, 'taurus-capricorn': 90, 'taurus-aquarius': 55, 'taurus-pisces': 85,
    'gemini-aries': 85, 'gemini-taurus': 60, 'gemini-gemini': 80, 'gemini-cancer': 65,
    'gemini-leo': 85, 'gemini-virgo': 70, 'gemini-libra': 95, 'gemini-scorpio': 55,
    'gemini-sagittarius': 90, 'gemini-capricorn': 50, 'gemini-aquarius': 90, 'gemini-pisces': 60,
    'cancer-aries': 55, 'cancer-taurus': 90, 'cancer-gemini': 65, 'cancer-cancer': 85,
    'cancer-leo': 75, 'cancer-virgo': 85, 'cancer-libra': 70, 'cancer-scorpio': 95,
    'cancer-sagittarius': 55, 'cancer-capricorn': 80, 'cancer-aquarius': 50, 'cancer-pisces': 95,
    'leo-aries': 90, 'leo-taurus': 70, 'leo-gemini': 85, 'leo-cancer': 75,
    'leo-leo': 85, 'leo-virgo': 65, 'leo-libra': 90, 'leo-scorpio': 65,
    'leo-sagittarius': 95, 'leo-capricorn': 70, 'leo-aquarius': 80, 'leo-pisces': 75,
    'virgo-aries': 60, 'virgo-taurus': 95, 'virgo-gemini': 70, 'virgo-cancer': 85,
    'virgo-leo': 65, 'virgo-virgo': 80, 'virgo-libra': 75, 'virgo-scorpio': 85,
    'virgo-sagittarius': 55, 'virgo-capricorn': 95, 'virgo-aquarius': 60, 'virgo-pisces': 70,
    'libra-aries': 75, 'libra-taurus': 80, 'libra-gemini': 95, 'libra-cancer': 70,
    'libra-leo': 90, 'libra-virgo': 75, 'libra-libra': 85, 'libra-scorpio': 60,
    'libra-sagittarius': 85, 'libra-capricorn': 65, 'libra-aquarius': 95, 'libra-pisces': 80,
    'scorpio-aries': 50, 'scorpio-taurus': 75, 'scorpio-gemini': 55, 'scorpio-cancer': 95,
    'scorpio-leo': 65, 'scorpio-virgo': 85, 'scorpio-libra': 60, 'scorpio-scorpio': 80,
    'scorpio-sagittarius': 60, 'scorpio-capricorn': 85, 'scorpio-aquarius': 55, 'scorpio-pisces': 95,
    'sagittarius-aries': 95, 'sagittarius-taurus': 50, 'sagittarius-gemini': 90, 'sagittarius-cancer': 55,
    'sagittarius-leo': 95, 'sagittarius-virgo': 55, 'sagittarius-libra': 85, 'sagittarius-scorpio': 60,
    'sagittarius-sagittarius': 85, 'sagittarius-capricorn': 60, 'sagittarius-aquarius': 90, 'sagittarius-pisces': 70,
    'capricorn-aries': 55, 'capricorn-taurus': 90, 'capricorn-gemini': 50, 'capricorn-cancer': 80,
    'capricorn-leo': 70, 'capricorn-virgo': 95, 'capricorn-libra': 65, 'capricorn-scorpio': 85,
    'capricorn-sagittarius': 60, 'capricorn-capricorn': 85, 'capricorn-aquarius': 70, 'capricorn-pisces': 75,
    'aquarius-aries': 80, 'aquarius-taurus': 55, 'aquarius-gemini': 90, 'aquarius-cancer': 50,
    'aquarius-leo': 80, 'aquarius-virgo': 60, 'aquarius-libra': 95, 'aquarius-scorpio': 55,
    'aquarius-sagittarius': 90, 'aquarius-capricorn': 70, 'aquarius-aquarius': 80, 'aquarius-pisces': 75,
    'pisces-aries': 65, 'pisces-taurus': 85, 'pisces-gemini': 60, 'pisces-cancer': 95,
    'pisces-leo': 75, 'pisces-virgo': 70, 'pisces-libra': 80, 'pisces-scorpio': 95,
    'pisces-sagittarius': 70, 'pisces-capricorn': 75, 'pisces-aquarius': 75, 'pisces-pisces': 85
  }
  
  const key = `${sign1Id}-${sign2Id}`
  const reverseKey = `${sign2Id}-${sign1Id}`
  const score = compatibilityMap[key] || compatibilityMap[reverseKey] || 70
  
  const sign1 = zodiacSigns.find(s => s.id === sign1Id)!
  const sign2 = zodiacSigns.find(s => s.id === sign2Id)!
  
  let description = ''
  let pros: string[] = []
  let cons: string[] = []
  let advice = ''
  
  if (score >= 90) {
    description = `${sign1.name}与${sign2.name}是天作之合，你们之间有着天然的默契和吸引力。`
    pros = ['价值观高度一致', '性格互补', '沟通顺畅', '感情稳定长久']
    cons = ['可能过于了解对方而缺少新鲜感', '需要注意保持适当距离']
    advice = '珍惜这份难得的缘分，一起创造美好未来。'
  } else if (score >= 80) {
    description = `${sign1.name}与${sign2.name}是非常理想的一对，相处融洽，感情甜蜜。`
    pros = ['相处和谐', '有共同话题', '互相吸引', '发展潜力大']
    cons = ['偶尔会有小摩擦', '需要更多包容和理解']
    advice = '多些沟通和包容，你们的关系会更加稳固。'
  } else if (score >= 70) {
    description = `${sign1.name}与${sign2.name}是需要努力经营的一对，有吸引力也有挑战。`
    pros = ['有一定吸引力', '可以互相学习', '关系有发展空间']
    cons = ['性格差异较大', '容易产生误会', '需要更多磨合']
    advice = '尊重彼此差异，学习对方优点，关系可以渐入佳境。'
  } else if (score >= 60) {
    description = `${sign1.name}与${sign2.name}是需要面对较多挑战的一对，需要付出更多努力。`
    pros = ['可以互补成长', '关系充满张力', '有独特的吸引力']
    cons = ['价值观差异大', '沟通容易出现问题', '需要很多妥协']
    advice = '如果真心相爱，就要学会包容和妥协，找到双方都舒适的相处模式。'
  } else {
    description = `${sign1.name}与${sign2.name}配对需要克服很多困难，是比较有挑战性的组合。`
    pros = ['可以从对方身上学到很多', '关系充满激情和火花']
    cons = ['性格差异巨大', '容易产生冲突', '需要很多努力才能维持']
    advice = '如果双方都愿意为这段关系付出，即使困难重重也有可能修成正果。'
  }
  
  return {
    sign1Id,
    sign2Id,
    overallScore: score,
    loveScore: Math.min(100, score + Math.floor(Math.random() * 10) - 5),
    friendshipScore: Math.min(100, score + Math.floor(Math.random() * 10) - 5),
    workScore: Math.min(100, score + Math.floor(Math.random() * 10) - 5),
    description,
    pros,
    cons,
    advice
  }
}

export const getZodiacKnowledge = async (): Promise<ZodiacKnowledge[]> => {
  await delay(500)

  return [
    {
      id: 'k1',
      title: '十二星座的起源',
      subtitle: '从古巴比伦到现代占星学的演变之旅',
      category: 'history',
      tags: ['起源', '历史', '古巴比伦', '希腊神话'],
      author: '星空学者',
      source: '《占星史话》',
      publishDate: '2024-03-15',
      readMinutes: 12,
      summary: '十二星座的概念最早可追溯至公元前2000年的古巴比伦文明，经过古希腊、古埃及文化的融合与发展，最终形成了今天我们熟知的占星学体系。',
      wordCount: 2800,
      sections: [
        { id: 's1', title: '古巴比伦的星空划分', anchor: 'babylon', level: 1 },
        { id: 's2', title: '古埃及的贡献', anchor: 'egypt', level: 1 },
        { id: 's3', title: '古希腊的神话融合', anchor: 'greece', level: 1 },
        { id: 's3-1', title: '托勒密与《四书》', anchor: 'ptolemy', level: 2 },
        { id: 's4', title: '中世纪与文艺复兴', anchor: 'medieval', level: 1 },
        { id: 's5', title: '现代占星学的发展', anchor: 'modern', level: 1 }
      ],
      paragraphs: [
        { type: 'heading', content: '古巴比伦的星空划分', level: 1 },
        { type: 'text', content: '十二星座的概念最早起源于公元前2000年左右的古巴比伦文明。当时的巴比伦天文学家为了方便记录太阳在天空中的运行轨迹，将黄道（太阳在天球上的视运动路径）划分为十二个等份，每份30度，形成了最早的黄道十二宫。' },
        { type: 'text', content: '巴比伦人将这十二个区域与当时的神话和宗教信仰相结合，为每个区域命名了对应的星座。这些早期的星座名称大多与动物和神话生物有关，例如金牛座、狮子座、天蝎座等，反映了当时人们对星空的想象与敬畏。' },
        { type: 'quote', content: '巴比伦人相信，星辰的排列蕴含着神的旨意，通过解读天象可以预知未来的祸福。' },
        { type: 'heading', content: '古埃及的贡献', level: 1 },
        { type: 'text', content: '古埃及人同样对星空有着深刻的研究。他们根据尼罗河的泛滥周期与天狼星的升起时间，制定了最早的太阳历。埃及人将十二星座的概念与他们的宗教神话相结合，发展出了一套独特的占星体系。' },
        { type: 'list', items: ['将黄道十二宫与埃及神话中的神祇相对应', '发展了基于出生时刻的个人占星方法', '建立了行星与神癨之间的对应关系'], content: '' },
        { type: 'heading', content: '古希腊的神话融合', level: 1 },
        { type: 'text', content: '公元前4世纪，亚历山大大帝东征将巴比伦和埃及的占星知识传入希腊。古希腊人将这些外来的天文知识与本土丰富的神话传说深度融合，为每个星座赋予了生动的神话故事。' },
        { type: 'heading', content: '托勒密与《四书》', level: 2 },
        { type: 'text', content: '公元2世纪，埃及亚历山大的天文学家托勒密在其著作《四书》（Tetrabiblos）中系统整理了当时的占星学知识，建立了西方占星学的基本框架。这部著作对后世影响深远，直到今天仍是占星学研究的重要经典。' },
        { type: 'heading', content: '中世纪与文艺复兴', level: 1 },
        { type: 'text', content: '中世纪时期，占星学在欧洲得到了广泛传播和发展。当时的天文学和占星学并没有明确的界限，许多著名的天文学家同时也是占星师。文艺复兴时期，占星学达到了鼎盛，成为贵族和学者们追捧的学问。' },
        { type: 'heading', content: '现代占星学的发展', level: 1 },
        { type: 'text', content: '进入现代后，随着科学方法的普及，占星学逐渐与天文学分道扬镳。但作为一种文化现象和心理工具，占星学仍然拥有大量的爱好者。现代占星学更侧重于人格分析和自我认知，而非传统意义上的命运预测。' }
      ],
      relatedIds: ['k4', 'k5', 'k7']
    },
    {
      id: 'k2',
      title: '四象星座：火风土水',
      subtitle: '探索十二星座背后的元素能量密码',
      category: 'symbolism',
      tags: ['四象', '元素', '火象', '土象', '风象', '水象'],
      author: '元素研究者',
      source: '星座心理学',
      publishDate: '2024-03-20',
      readMinutes: 10,
      summary: '十二星座按照元素属性分为火象、土象、风象、水象四大类，每类星座共享相似的性格特质和行为模式。理解四象星座是解读占星学的基础。',
      wordCount: 2400,
      sections: [
        { id: 's1', title: '四元素理论溯源', anchor: 'origin', level: 1 },
        { id: 's2', title: '火象星座：激情与行动', anchor: 'fire', level: 1 },
        { id: 's3', title: '土象星座：务实与稳定', anchor: 'earth', level: 1 },
        { id: 's4', title: '风象星座：思维与交流', anchor: 'air', level: 1 },
        { id: 's5', title: '水象星座：情感与直觉', anchor: 'water', level: 1 },
        { id: 's6', title: '四象之间的互动', anchor: 'interaction', level: 1 }
      ],
      paragraphs: [
        { type: 'heading', content: '四元素理论溯源', level: 1 },
        { type: 'text', content: '四元素学说最早由古希腊哲学家恩培多克勒提出，他认为世界万物由火、土、风、水四种基本元素构成。这一理论被亚里士多德继承和发展，并最终融入西方占星学体系之中。' },
        { type: 'heading', content: '火象星座：激情与行动', level: 1 },
        { type: 'text', content: '火象星座包括白羊座、狮子座和射手座。火元素代表热情、能量和行动力，火象星座的人通常性格开朗、乐观向上，具有强烈的领导欲望和冒险精神。' },
        { type: 'list', content: '', items: ['白羊座（3.21-4.19）：开创型，代表初生的火焰，冲动而勇敢', '狮子座（7.23-8.22）：固定型，代表燃烧的篝火，自信而慷慨', '射手座（11.23-12.21）：变动型，代表燎原的星火，自由而率真'] },
        { type: 'heading', content: '土象星座：务实与稳定', level: 1 },
        { type: 'text', content: '土象星座包括金牛座、处女座和摩羯座。土元素代表稳定、务实和安全感，土象星座的人通常脚踏实地、注重细节，具有强烈的责任感和规划能力。' },
        { type: 'list', content: '', items: ['金牛座（4.20-5.20）：固定型，代表肥沃的土地，稳重而务实', '处女座（8.23-9.22）：变动型，代表细腻的沙土，精细而理性', '摩羯座（12.22-1.19）：开创型，代表坚实的山峦，坚韧而有野心'] },
        { type: 'heading', content: '风象星座：思维与交流', level: 1 },
        { type: 'text', content: '风象星座包括双子座、天秤座和水瓶座。风元素代表思维、沟通和变化，风象星座的人通常聪明机智、善于社交，具有强烈的好奇心和求知欲。' },
        { type: 'list', content: '', items: ['双子座（5.21-6.21）：变动型，代表流动的微风，灵活而多变', '天秤座（9.23-10.23）：开创型，代表和煦的春风，优雅而平衡', '水瓶座（1.20-2.18）：固定型，代表高天的长风，独立而创新'] },
        { type: 'heading', content: '水象星座：情感与直觉', level: 1 },
        { type: 'text', content: '水象星座包括巨蟹座、天蝎座和双鱼座。水元素代表情感、直觉和深度，水象星座的人通常情感丰富、感知敏锐，具有强烈的同情心和同理心。' },
        { type: 'list', content: '', items: ['巨蟹座（6.22-7.22）：开创型，代表宁静的湖泊，温柔而保护', '天蝎座（10.24-11.22）：固定型，代表深邃的海洋，神秘而执着', '双鱼座（2.19-3.20）：变动型，代表流动的溪水，浪漫而包容'] },
        { type: 'heading', content: '四象之间的互动', level: 1 },
        { type: 'text', content: '在人际关系中，相同元素的星座更容易产生共鸣和理解。火与风同属阳性元素，搭配协调；土与水同属阴性元素，配合默契。而火与水、风与土的组合则需要更多的磨合与包容，却也能碰撞出独特的火花。' }
      ],
      relatedIds: ['k1', 'k5', 'k9']
    },
    {
      id: 'k3',
      title: '白羊座的神话故事',
      subtitle: '金羊毛与勇敢者的传奇',
      category: 'mythology',
      tags: ['白羊座', '希腊神话', '金羊毛', '伊阿宋'],
      author: '神话叙述者',
      source: '古希腊神话全集',
      publishDate: '2024-03-10',
      readMinutes: 8,
      summary: '白羊座的起源与金羊毛的传说紧密相连，这只神奇的金毛公羊不仅拯救了王子的生命，更开启了英雄伊阿宋的伟大冒险。',
      wordCount: 1800,
      sections: [
        { id: 's1', title: '祭台上的危机', anchor: 'crisis', level: 1 },
        { id: 's2', title: '金毛公羊的拯救', anchor: 'rescue', level: 1 },
        { id: 's3', title: '赫勒之海', anchor: 'helles', level: 1 },
        { id: 's4', title: '金羊毛的守护者', anchor: 'guardian', level: 1 },
        { id: 's5', title: '星座的诞生', anchor: 'birth', level: 1 }
      ],
      paragraphs: [
        { type: 'heading', content: '祭台上的危机', level: 1 },
        { type: 'text', content: '传说在遥远的玻俄提亚王国，国王阿塔玛斯与前妻涅斐勒育有一双儿女——王子佛里克索斯和公主赫勒。然而，国王后来迎娶了新王后伊诺，这位继母对前妻的孩子心怀嫉妒，处心积虑想要除掉他们。' },
        { type: 'text', content: '伊诺设计了一个恶毒的阴谋：她命令全国的妇女将种子烤熟后再播种，导致全国颗粒无收。随后，她又贿赂祭司，谎称是因为王子和公主触怒了神灵，必须将他们献祭才能平息神怒，拯救饥荒。' },
        { type: 'heading', content: '金毛公羊的拯救', level: 1 },
        { type: 'text', content: '绝望的王子和公主在祭坛前等待命运的降临。他们的生母涅斐勒虽然已被贬为云端的女神，却始终没有忘记自己的孩子。她向神使赫尔墨斯求助，赫尔墨斯派遣了一只神奇的公羊——它长着纯金的羊毛，还能展翅飞翔。' },
        { type: 'quote', content: '"不要害怕，孩子们，我是来带你们逃离苦难的。" —— 金毛公羊' },
        { type: 'heading', content: '赫勒之海', level: 1 },
        { type: 'text', content: '公羊驮着两个孩子腾空而起，飞越了无数山川大地。然而在横渡欧亚大陆之间的海峡时，公主赫勒因为长时间的颠簸和恐惧，不幸从羊背上滑落，坠入了波涛汹涌的大海。' },
        { type: 'text', content: '后人为了纪念这位不幸的公主，将这片海域命名为赫勒斯滂海峡（Hellespont），也就是今天达达尼尔海峡的古称。这片海域也因此成为了神话与历史交汇之地。' },
        { type: 'heading', content: '金羊毛的守护者', level: 1 },
        { type: 'text', content: '王子佛里克索斯最终平安抵达了遥远的科尔喀斯王国。为了感谢神灵的庇佑，他将金毛公羊献祭给了宙斯，并把珍贵的金羊毛赠送给了科尔喀斯国王埃厄忒斯。国王将金羊毛悬挂在阿瑞斯圣林中，由一条永不入睡的巨龙日夜守护。' },
        { type: 'heading', content: '星座的诞生', level: 1 },
        { type: 'text', content: '宙斯为了表彰这只勇敢牺牲的金毛公羊，将它的形象升上天空，成为了白羊座。而金羊毛则成为了希腊神话中最著名的宝物之一，引出了英雄伊阿宋和阿尔戈号众英雄的伟大冒险故事。直到今天，白羊座依然象征着勇气、冒险和开拓精神。' }
      ],
      relatedIds: ['k6', 'k8', 'k10']
    },
    {
      id: 'k4',
      title: '占星学与天文学的区别',
      subtitle: '科学与信仰之间的星辰大海',
      category: 'science',
      tags: ['天文学', '占星学', '科学', '宇宙'],
      author: '天文观测者',
      source: '科学与人文',
      publishDate: '2024-03-25',
      readMinutes: 9,
      summary: '占星学和天文学虽然都源于古人对星空的仰望，但在现代已经是两个完全不同的领域。一个是严谨的自然科学，一个是深植人心的文化传统。',
      wordCount: 2100,
      sections: [
        { id: 's1', title: '共同的起源', anchor: 'origin', level: 1 },
        { id: 's2', title: '天文学：科学的星辰', anchor: 'astronomy', level: 1 },
        { id: 's3', title: '占星学：文化的星空', anchor: 'astrology', level: 1 },
        { id: 's4', title: '关键差异对比', anchor: 'differences', level: 1 },
        { id: 's5', title: '理性看待占星学', anchor: 'rational', level: 1 }
      ],
      paragraphs: [
        { type: 'heading', content: '共同的起源', level: 1 },
        { type: 'text', content: '在人类文明的早期，天文学和占星学本是一体的。无论是古巴比伦的祭司、古埃及的书吏，还是中国古代的太史令，他们既负责记录星辰的运行，也负责解读天象背后的"天意"。因为在古人看来，天上的一切都与人间的命运紧密相连。' },
        { type: 'heading', content: '天文学：科学的星辰', level: 1 },
        { type: 'text', content: '现代天文学是一门严谨的自然科学，它以观测和数学为基础，研究宇宙中天体的起源、结构、运动和演化。天文学家用望远镜、卫星和超级计算机收集数据，通过科学方法验证假设，逐步揭开宇宙的奥秘。' },
        { type: 'list', content: '', items: ['研究对象：恒星、行星、星系、黑洞、暗物质等', '方法论：观测数据 + 数学模型 + 实验验证', '核心目标：理解宇宙的物理规律', '可证伪性：结论必须经得起检验和质疑'] },
        { type: 'heading', content: '占星学：文化的星空', level: 1 },
        { type: 'text', content: '占星学则是一种信仰体系和文化传统，它认为天体的位置和运动与人类的性格、命运之间存在某种神秘的联系。占星师根据人出生时的星象图来推断其性格特点和人生轨迹，为人们提供自我认知和决策参考。' },
        { type: 'heading', content: '关键差异对比', level: 1 },
        { type: 'text', content: '从科学的角度来看，目前没有任何可靠的证据支持占星学的核心主张——即天体位置会影响人的性格或命运。物理上，天体对地球的引力和辐射影响极其微弱，远不及日常环境因素。统计学上，大量双盲研究也未能发现占星预测的准确率高于随机概率。' },
        { type: 'heading', content: '理性看待占星学', level: 1 },
        { type: 'text', content: '尽管占星学不是科学，但它作为一种延续数千年的文化现象，依然有着独特的价值。许多人喜欢占星学，并非真的相信它能预测未来，而是将其作为一种自我探索的工具、一种社交话题、一种心理慰藉。只要不迷信、不依赖，占星学完全可以是一种有趣的生活方式。' },
        { type: 'quote', content: '我们仰望星空，既是为了探索宇宙的真理，也是为了寻找心灵的归宿。' }
      ],
      relatedIds: ['k1', 'k5', 'k7']
    },
    {
      id: 'k5',
      title: '黄道十二宫的真正含义',
      subtitle: '揭开回归黄道与恒星黄道的千年之辩',
      category: 'symbolism',
      tags: ['黄道', '岁差', '回归黄道', '恒星黄道'],
      author: '星宫学者',
      source: '占星学刊',
      publishDate: '2024-03-18',
      readMinutes: 11,
      summary: '由于岁差现象，今天的黄道十二宫在天球上的位置已经与两千年前偏移了约一个星座。占星学中使用的回归黄道和天文上的恒星黄道有着本质区别。',
      wordCount: 2600,
      sections: [
        { id: 's1', title: '什么是黄道', anchor: 'what', level: 1 },
        { id: 's2', title: '岁差：星空的缓慢漂移', anchor: 'precession', level: 1 },
        { id: 's3', title: '回归黄道：以节气为锚', anchor: 'tropical', level: 1 },
        { id: 's4', title: '恒星黄道：以恒星为尺', anchor: 'sidereal', level: 1 },
        { id: 's5', title: '占星学的选择', anchor: 'choice', level: 1 }
      ],
      paragraphs: [
        { type: 'heading', content: '什么是黄道', level: 1 },
        { type: 'text', content: '黄道（Zodiac）一词源自希腊语，意为"动物之圈"。从地球上看，太阳在一年中会在天球背景上画出一条固定的轨迹，这条轨迹就叫做黄道。月亮和五大行星也大致沿着这条路径运行。古巴比伦人将黄道均匀分为12段，每段30度，并以附近最显著的星座命名，这就是黄道十二宫的由来。' },
        { type: 'heading', content: '岁差：星空的缓慢漂移', level: 1 },
        { type: 'text', content: '问题在于，地球的自转轴并不是固定不动的。由于月球和太阳对地球赤道隆起部分的引力作用，地球自转轴会像陀螺一样缓慢地"进动"，周期大约为25,800年。这种现象被称为"岁差"（Precession）。' },
        { type: 'text', content: '岁差的效果是：春分点在黄道上会以每年约50.3角秒的速度向西移动。也就是说，每隔约72年，春分点就会偏移整整1度。从古希腊占星学成型的公元2世纪到今天，已经过去了约1800年，春分点的位置已经向西偏移了约25度——几乎是整整一个星座的距离！' },
        { type: 'heading', content: '回归黄道：以节气为锚', level: 1 },
        { type: 'text', content: '现代西方占星学主流采用的是"回归黄道"（Tropical Zodiac）。这种体系不以天上的恒星位置为基准，而是以春分点作为黄道0度白羊座的起点。无论春分点在天球上移动到哪里，它永远是白羊座的开始。' },
        { type: 'quote', content: '回归黄道关注的是季节的循环和能量的周期，而非恒星的物理位置。' },
        { type: 'heading', content: '恒星黄道：以恒星为尺', level: 1 },
        { type: 'text', content: '另一种体系是"恒星黄道"（Sidereal Zodiac），主要在印度占星学（吠陀占星）中使用。这种体系以实际的恒星位置为基准，将黄道十二宫与天上真实的星座位置对齐。由于岁差的原因，恒星黄道与回归黄道之间的偏差正在逐年增大。' },
        { type: 'heading', content: '占星学的选择', level: 1 },
        { type: 'text', content: '两种黄道体系之争已经持续了数百年。简单来说，如果你认为占星学的本质是"天体能量对地球的影响"，那么回归黄道以太阳与地球的关系（季节）为核心，逻辑上更加自洽。如果你认为占星学依赖于"恒星的辐射"，那么恒星黄道显然更合理。无论选择哪一种，重要的是在同一体系内保持一致性。' }
      ],
      relatedIds: ['k1', 'k2', 'k4']
    },
    {
      id: 'k6',
      title: '双鱼座的浪漫传说',
      subtitle: '爱神母子的逃亡与永恒羁绊',
      category: 'mythology',
      tags: ['双鱼座', '希腊神话', '阿芙洛狄忒', '厄洛斯'],
      author: '浪漫诗人',
      source: '爱与美的神话',
      publishDate: '2024-03-05',
      readMinutes: 7,
      summary: '双鱼座的神话讲述了爱神阿芙洛狄忒与小爱神厄洛斯在巨怪来袭时的惊险逃亡，也象征着母子之间永恒不变的爱与羁绊。',
      wordCount: 1600,
      sections: [
        { id: 's1', title: '不速之客提丰', anchor: 'typhon', level: 1 },
        { id: 's2', title: '众神的变形逃亡', anchor: 'escape', level: 1 },
        { id: 's3', title: '幼发拉底河畔', anchor: 'river', level: 1 },
        { id: 's4', title: '永不分离的双鱼', anchor: 'fish', level: 1 }
      ],
      paragraphs: [
        { type: 'heading', content: '不速之客提丰', level: 1 },
        { type: 'text', content: '在希腊神话中，提丰（Typhon）是大地女神盖亚与深渊之神塔尔塔罗斯所生的最可怕的怪物。它有着百个龙头，眼睛喷射火焰，下半身是无数缠绕的巨蛇，身高足以触及星辰。宙斯与众神虽然最终将其击败，但在战斗初期，众神都对它的恐怖力量感到畏惧。' },
        { type: 'heading', content: '众神的变形逃亡', level: 1 },
        { type: 'text', content: '有一次，提丰突然袭击众神在奥林匹斯山的宴会。众神猝不及防，纷纷化作各种动物仓皇逃窜：宙斯变成公羊，赫拉变成母牛，阿波罗变成乌鸦，赫尔墨斯变成朱鹮……大家各自寻找着逃离的路径。' },
        { type: 'heading', content: '幼发拉底河畔', level: 1 },
        { type: 'text', content: '爱神阿芙洛狄忒（罗马名维纳斯）正带着她的儿子——小爱神厄洛斯（罗马名丘比特）在幼发拉底河畔散步。突然，大地震动，远处传来提丰的咆哮声。母子二人惊慌失措，不知如何是好。' },
        { type: 'quote', content: '"妈妈，我害怕！我们会走散的！" —— 年幼的厄洛斯' },
        { type: 'heading', content: '永不分离的双鱼', level: 1 },
        { type: 'text', content: '阿芙洛狄忒紧紧握住儿子的手，但她知道在混乱中仅凭双手是不够的。于是她解下腰带，将自己和厄洛斯的脚踝绑在一起，然后两人一同化作两条鱼，跃入幼发拉底河的洪流之中。两条鱼虽然各自游动，但脚踝处的纽带将它们紧紧相连，永不再分离。' },
        { type: 'text', content: '战争结束后，宙斯感念这对母子的情深，将他们化作天上的星座，永恒地闪耀在星空中——这就是双鱼座的由来。双鱼座的两条鱼尾巴上各绑着一条丝带，象征着那永远无法割舍的爱的羁绊。' }
      ],
      relatedIds: ['k3', 'k8', 'k10']
    },
    {
      id: 'k7',
      title: '行星运行与占星学的关系',
      subtitle: '太阳系中的七位"天神"如何影响我们',
      category: 'science',
      tags: ['行星', '占星', '太阳', '月亮', '水星', '金星', '火星'],
      author: '占星研究者',
      source: '行星与人格',
      publishDate: '2024-03-28',
      readMinutes: 13,
      summary: '在占星学中，每颗行星都代表着不同的能量原型和心理功能。太阳、月亮、水星、金星、火星、木星、土星，它们各自掌管着我们人格的不同面向。',
      wordCount: 3000,
      sections: [
        { id: 's1', title: '占星中的行星概念', anchor: 'concept', level: 1 },
        { id: 's2', title: '发光体：太阳与月亮', anchor: 'luminaries', level: 1 },
        { id: 's3', title: '个人行星：水星、金星、火星', anchor: 'personal', level: 1 },
        { id: 's4', title: '社会行星：木星、土星', anchor: 'social', level: 1 },
        { id: 's5', title: '现代行星的发现', anchor: 'modern', level: 1 }
      ],
      paragraphs: [
        { type: 'heading', content: '占星中的行星概念', level: 1 },
        { type: 'text', content: '在占星学的术语中，"行星"的含义比天文学更广。所有在黄道上移动的天体都被视为"行星"，包括太阳、月亮（合称"发光体"），以及传统的水星、金星、火星、木星、土星（合称"七大行星"或"七星"）。现代占星学还纳入了天王星、海王星、冥王星等远日行星。' },
        { type: 'heading', content: '发光体：太阳与月亮', level: 1 },
        { type: 'text', content: '在个人星盘里，太阳和月亮是最重要的两颗星体，它们分别代表了人格的"阳"和"阴"两面。' },
        { type: 'list', content: '', items: ['太阳：核心自我、人生目标、生命力、父亲/男性形象', '月亮：情绪需求、内心世界、潜意识、母亲/女性形象'] },
        { type: 'heading', content: '个人行星：水星、金星、火星', level: 1 },
        { type: 'text', content: '这三颗行星距离太阳较近，运行速度较快，代表了我们人格中较容易被感知的功能。' },
        { type: 'list', content: '', items: ['水星：思维方式、沟通表达、学习能力、信息处理', '金星：爱情观、审美品味、价值观、社交魅力、金钱态度', '火星：行动力、欲望驱动、竞争意识、脾气秉性、勇气'] },
        { type: 'heading', content: '社会行星：木星、土星', level: 1 },
        { type: 'text', content: '木星和土星运行速度较慢，它们的影响更多体现在社会和世代层面，但也在个人星盘中扮演重要角色。' },
        { type: 'list', content: '', items: ['木星：扩张与幸运、信仰与哲学、成长与机遇、乐观与慷慨', '土星：约束与责任、规则与结构、考验与成长、成熟与智慧'] },
        { type: 'heading', content: '现代行星的发现', level: 1 },
        { type: 'text', content: '从18世纪起，天文学家陆续发现了传统七星之外的新行星：天王星（1781）、海王星（1846）、冥王星（1930）。现代占星学家们将这些新行星纳入体系，赋予了它们相应的象征意义。' },
        { type: 'list', content: '', items: ['天王星：变革与创新、独立与自由、科技与革命、突发与觉醒', '海王星：梦幻与想象、灵性与超越、艺术与奉献、迷幻与幻灭', '冥王星：毁灭与重生、权力与转化、深度与执念、隐秘与疗愈'] },
        { type: 'text', content: '值得注意的是，传统占星学只使用七星进行解读，而现代占星学则加入了更多星体。不同流派的占星师对此有不同的看法，但不可否认的是，占星学的象征体系一直在随着人类文明的进步而不断扩展和演变。' }
      ],
      relatedIds: ['k1', 'k4', 'k5']
    },
    {
      id: 'k8',
      title: '十二星座守护神全解',
      subtitle: '每位星座背后的希腊神话守护神',
      category: 'mythology',
      tags: ['守护神', '奥林匹斯众神', '十二星座', '神话'],
      author: '神谱编纂者',
      source: '希腊神谱',
      publishDate: '2024-03-22',
      readMinutes: 15,
      summary: '每个星座都有其对应的奥林匹斯守护神，从战神阿瑞斯到爱神阿芙洛狄忒，从智慧女神雅典娜到海神波塞冬，这些神祇的特质正是对应星座性格的原型来源。',
      wordCount: 3500,
      sections: [
        { id: 's1', title: '火象星座的守护神', anchor: 'fire', level: 1 },
        { id: 's1-1', title: '白羊座：战神阿瑞斯', anchor: 'aries-god', level: 2 },
        { id: 's1-2', title: '狮子座：太阳神阿波罗', anchor: 'leo-god', level: 2 },
        { id: 's1-3', title: '射手座：众神之王宙斯', anchor: 'sag-god', level: 2 },
        { id: 's2', title: '土象星座的守护神', anchor: 'earth', level: 1 },
        { id: 's3', title: '风象星座的守护神', anchor: 'air', level: 1 },
        { id: 's4', title: '水象星座的守护神', anchor: 'water', level: 1 }
      ],
      paragraphs: [
        { type: 'heading', content: '火象星座的守护神', level: 1 },
        { type: 'heading', content: '白羊座：战神阿瑞斯', level: 2 },
        { type: 'text', content: '白羊座的守护神是战神阿瑞斯（罗马名玛尔斯），他是宙斯与赫拉之子，象征着战争、暴力和血腥的勇气。正如阿瑞斯热爱战斗、勇往直前一样，白羊座的人天生具有冒险精神，不惧挑战，喜欢第一个冲锋陷阵。' },
        { type: 'heading', content: '狮子座：太阳神阿波罗', level: 2 },
        { type: 'text', content: '狮子座的守护神是太阳神阿波罗，他是宙斯之子，掌管光明、音乐、诗歌、医药和预言。阿波罗是奥林匹斯众神中最英俊潇洒的一位，驾着太阳战车每日穿越天空。狮子座的自信、高贵、艺术天赋和王者气度，正是太阳神阿波罗特质的人间投影。' },
        { type: 'heading', content: '射手座：众神之王宙斯', level: 2 },
        { type: 'text', content: '射手座的守护神是众神之王宙斯（罗马名朱庇特），他是奥林匹斯的统治者，掌管天空、雷电和正义。宙斯象征着至高无上的权力和广阔的视野，这也解释了为什么射手座的人目光远大、追求自由、热爱旅行和哲学思考。' },
        { type: 'heading', content: '土象星座的守护神', level: 1 },
        { type: 'text', content: '金牛座的守护神是爱与美之女神阿芙洛狄忒（维纳斯），处女座由智慧女神雅典娜守护，摩羯座则受到农神克洛诺斯（萨图恩）的庇护。' },
        { type: 'heading', content: '风象星座的守护神', level: 1 },
        { type: 'text', content: '双子座的守护神是神使赫尔墨斯（墨丘利），天秤座由爱神阿芙洛狄忒和正义女神忒弥斯共同守护，水瓶座的守护神则是天空之神乌拉诺斯和智慧之神普罗米修斯。' },
        { type: 'heading', content: '水象星座的守护神', level: 1 },
        { type: 'text', content: '巨蟹座由月亮女神阿尔忒弥斯（狄安娜）守护，天蝎座的守护神是冥王哈迪斯（普鲁托），双鱼座则受到海神波塞冬（尼普顿）和爱神阿芙洛狄忒的共同祝福。' },
        { type: 'quote', content: '了解每个星座的守护神，就找到了打开星座性格秘密的另一把钥匙。' }
      ],
      relatedIds: ['k3', 'k6', 'k10']
    },
    {
      id: 'k9',
      title: '星座配对的底层逻辑',
      subtitle: '为什么有些星座天生一对，有些却水火不容？',
      category: 'symbolism',
      tags: ['配对', '兼容性', '对宫', '三合', '六合'],
      author: '配对分析师',
      source: '人际占星学',
      publishDate: '2024-03-30',
      readMinutes: 14,
      summary: '星座配对并非无稽之谈，它背后有着严谨的占星学逻辑。星座之间的角度关系（相位）决定了能量流动的模式，和谐相位带来默契，紧张相位带来火花。',
      wordCount: 3200,
      sections: [
        { id: 's1', title: '星座之间的相位关系', anchor: 'aspects', level: 1 },
        { id: 's2', title: '三合相位：最默契的组合', anchor: 'trine', level: 1 },
        { id: 's3', title: '六合相位：互补的搭档', anchor: 'sextile', level: 1 },
        { id: 's4', title: '对宫相位：吸引力法则', anchor: 'opposition', level: 1 },
        { id: 's5', title: '刑克相位：激情与挑战', anchor: 'square', level: 1 }
      ],
      paragraphs: [
        { type: 'heading', content: '星座之间的相位关系', level: 1 },
        { type: 'text', content: '在占星学中，两个星座之间的配对和谐度取决于它们在黄道上的夹角。每4个星座（120度）形成"三合"、每2个星座（60度）形成"六合"、每6个星座（180度）形成"对冲"、每3个星座（90度）形成"刑克"。这些不同的角度决定了能量流动的模式。' },
        { type: 'heading', content: '三合相位：最默契的组合', level: 1 },
        { type: 'text', content: '三合相位是最和谐的配对关系，两个星座相差120度，属于同一元素组。他们之间有天然的默契，价值观相似，沟通顺畅，相处起来非常舒服。' },
        { type: 'list', content: '', items: ['火象三合：白羊 + 狮子 + 射手', '土象三合：金牛 + 处女 + 摩羯', '风象三合：双子 + 天秤 + 水瓶', '水象三合：巨蟹 + 天蝎 + 双鱼'] },
        { type: 'heading', content: '六合相位：互补的搭档', level: 1 },
        { type: 'text', content: '六合相位的两个星座相差60度，它们同属阳性或阴性星座，但元素不同（火+风，土+水）。这种组合既有吸引力，又能互补不足，是非常理想的伴侣或搭档关系。' },
        { type: 'heading', content: '对宫相位：吸引力法则', level: 1 },
        { type: 'text', content: '对宫的两个星座相差180度，如同硬币的两面，既相互吸引又相互排斥。他们往往第一眼就被对方吸引，但相处中需要大量的磨合和妥协。典型的对宫组合有白羊-天秤、金牛-天蝎等。' },
        { type: 'quote', content: '对宫星座之间的爱是最迷人也最考验人的——你们从彼此身上看到了自己缺失的那一半。' },
        { type: 'heading', content: '刑克相位：激情与挑战', level: 1 },
        { type: 'text', content: '刑克相位的两个星座相差90度，它们既不同元素也不同阴阳属性，性格和价值观存在根本差异。这种关系充满摩擦和冲突，但也最容易产生强烈的化学反应和成长动力。' },
        { type: 'text', content: '总而言之，没有绝对完美或绝对糟糕的星座配对。和谐的相位让关系更容易开始，而充满挑战的相位反而可能带来更深的成长。占星学告诉我们的不是"能不能在一起"，而是"如何更好地相处"。' }
      ],
      relatedIds: ['k2', 'k5', 'k8']
    },
    {
      id: 'k10',
      title: '天蝎座的深邃传说',
      subtitle: '猎户与巨蝎的永恒追逐',
      category: 'mythology',
      tags: ['天蝎座', '猎户座', '希腊神话', '波塞冬'],
      author: '星空叙事者',
      source: '星座神话录',
      publishDate: '2024-03-08',
      readMinutes: 9,
      summary: '天蝎座的传说与伟大的猎人奥利安紧密相连，巨蝎与猎人之间的恩怨情仇被永久定格在星空的两端，成为夜空中最壮丽的追逐。',
      wordCount: 2000,
      sections: [
        { id: 's1', title: '狂妄的猎人', anchor: 'hunter', level: 1 },
        { id: 's2', title: '赫拉的愤怒', anchor: 'hera', level: 1 },
        { id: 's3', title: '巨蝎的突袭', anchor: 'scorpion', level: 1 },
        { id: 's4', title: '星空中的永恒追逐', anchor: 'stars', level: 1 },
        { id: 's5', title: '天蝎座的深层特质', anchor: 'traits', level: 1 }
      ],
      paragraphs: [
        { type: 'heading', content: '狂妄的猎人', level: 1 },
        { type: 'text', content: '奥利安（Orion）是海神波塞冬之子，拥有超凡的力量和英俊的外貌。作为当时最伟大的猎人，他曾夸下海口："世界上没有任何野兽能逃脱我的追捕！"这句狂言传到了天后赫拉的耳中，引起了她的极度不悦。' },
        { type: 'heading', content: '赫拉的愤怒', level: 1 },
        { type: 'text', content: '赫拉决定要教训一下这个不知天高地厚的猎人。她不亲自动手，而是选择了一种更加隐秘和致命的武器——一只巨大的毒蝎。赫拉命令这只蝎子隐藏在草丛中，等待奥利安的到来。' },
        { type: 'heading', content: '巨蝎的突袭', level: 1 },
        { type: 'text', content: '当奥利安路过时，巨蝎突然从草丛中窜出，将致命的毒针刺入了猎人的脚踝。纵使奥利安英勇无比，也抵挡不住这剧毒的侵袭，他倒在了地上，而巨蝎也在激烈的战斗中被猎人踩死。' },
        { type: 'heading', content: '星空中的永恒追逐', level: 1 },
        { type: 'text', content: '宙斯将这场战斗的双方都升上了天空，成为了猎户座和天蝎座。但他们的恩怨并未就此结束——你会发现，当天蝎座从东方升起时，猎户座便从西方落下；而当猎户座出现时，天蝎座早已消失在地平线之下。这两个星座永远不会同时出现在夜空，象征着他们永恒的追逐和对峙。' },
        { type: 'quote', content: '"我宁死也不会向敌人低头。" —— 奥利安' },
        { type: 'heading', content: '天蝎座的深层特质', level: 1 },
        { type: 'text', content: '天蝎座的人继承了这只巨蝎的特质：外表冷静沉默，内心却蕴藏着强大的能量和深刻的情感。他们从不轻易出手，但一旦被激怒，反击将是致命而精准的。天蝎座的爱与恨同样深刻，忠诚与执念并存，是十二星座中最神秘也最具力量的存在。' }
      ],
      relatedIds: ['k3', 'k6', 'k8']
    },
    {
      id: 'k11',
      title: '摩羯座的神话与现实',
      subtitle: '半羊半鱼的牧神与永不言弃的攀登者',
      category: 'mythology',
      tags: ['摩羯座', '潘神', '牧神', '希腊神话'],
      author: '山林记述者',
      source: '奥林匹斯外传',
      publishDate: '2024-03-12',
      readMinutes: 8,
      summary: '摩羯座的形象是一只奇特的半羊半鱼生物，它源自牧神潘的一次惊险逃亡。这个看似怪异的形象却蕴含着脚踏实地、不断攀登的深刻寓意。',
      wordCount: 1900,
      sections: [
        { id: 's1', title: '牧神潘的身世', anchor: 'pan', level: 1 },
        { id: 's2', title: '提丰来袭的那一天', anchor: 'typhon-day', level: 1 },
        { id: 's3', title: '尼罗河中的变形', anchor: 'nile', level: 1 },
        { id: 's4', title: '山羊的精神', anchor: 'spirit', level: 1 }
      ],
      paragraphs: [
        { type: 'heading', content: '牧神潘的身世', level: 1 },
        { type: 'text', content: '潘（Pan）是希腊神话中的牧神，他是神使赫尔墨斯与仙女之子。潘的外貌与众不同——他有着人类的躯干和手臂，但头上长着山羊的犄角，下半身是山羊的腿和蹄子。尽管相貌奇特，潘却是众神的好朋友，他热爱自然、擅长音乐，尤其精通排箫。' },
        { type: 'heading', content: '提丰来袭的那一天', level: 1 },
        { type: 'text', content: '还记得提丰袭击奥林匹斯的那一场大乱吗？众神纷纷化作各种动物逃亡。牧神潘也不例外，他跳入尼罗河试图逃离怪物的追捕。在水中，他情急之下想要变成一条鱼，但变形并不完全——他的上半身还是山羊的样子，只有下半身变成了鱼尾。' },
        { type: 'heading', content: '尼罗河中的变形', level: 1 },
        { type: 'text', content: '正是这次仓促的变形，造就了摩羯座独特的"半羊半鱼"形象。山羊代表着脚踏实地、攀登向上；鱼则象征着情感深度和灵性追求。摩羯座的人正是这样的结合体——表面务实冷静，内心却有一个充满想象力和柔情的世界。' },
        { type: 'heading', content: '山羊的精神', level: 1 },
        { type: 'text', content: '山羊是最擅长攀爬的动物，它们能够在陡峭的山崖上如履平地。摩羯座的人同样拥有这种攀登者精神：目标明确、意志坚定、脚踏实地、永不言弃。他们或许起步不快，但每一步都走得坚实有力，最终往往能到达他人难以企及的高度。' },
        { type: 'quote', content: '"我不去想是否能够成功，既然选择了远方，便只顾风雨兼程。" —— 摩羯座的座右铭' }
      ],
      relatedIds: ['k3', 'k6', 'k10']
    },
    {
      id: 'k12',
      title: '十二星座的理想职业方向',
      subtitle: '找到适合你星座特质的人生赛道',
      category: 'feature',
      tags: ['职业', '事业', '天赋', '工作'],
      author: '职业规划师',
      source: '占星与职业',
      publishDate: '2024-04-01',
      readMinutes: 16,
      summary: '每个星座都有其独特的天赋和优势。了解自己的星座特质，找到最适合的职业方向，能够让你在工作中事半功倍，获得更多成就感和满足感。',
      wordCount: 3800,
      sections: [
        { id: 's1', title: '火象星座：开拓与引领', anchor: 'fire', level: 1 },
        { id: 's2', title: '土象星座：深耕与稳定', anchor: 'earth', level: 1 },
        { id: 's3', title: '风象星座：创意与沟通', anchor: 'air', level: 1 },
        { id: 's4', title: '水象星座：关怀与创造', anchor: 'water', level: 1 }
      ],
      paragraphs: [
        { type: 'heading', content: '火象星座：开拓与引领', level: 1 },
        { type: 'text', content: '火象星座的人天生具有领导力和冒险精神，他们适合需要开拓进取、承担风险、展现魅力的工作。' },
        { type: 'list', content: '', items: ['白羊座：创业者、销售经理、运动员、军人、消防员、紧急救援人员', '狮子座：企业高管、演员、主持人、政治家、公关总监、品牌策划', '射手座：律师、外交官、教授、旅行博主、哲学家、出版人'] },
        { type: 'heading', content: '土象星座：深耕与稳定', level: 1 },
        { type: 'text', content: '土象星座的人务实、细致、有耐心，适合需要专业技能、长期积累、高度责任感的工作。' },
        { type: 'list', content: '', items: ['金牛座：银行家、会计师、艺术家、厨师、房地产经纪人、花艺师', '处女座：医生、护士、程序员、数据分析、审计师、编辑校对', '摩羯座：企业家、项目经理、工程师、公务员、建筑师、金融顾问'] },
        { type: 'heading', content: '风象星座：创意与沟通', level: 1 },
        { type: 'text', content: '风象星座的人思维活跃、善于社交、适应力强，适合需要沟通、创意、信息处理的工作。' },
        { type: 'list', content: '', items: ['双子座：记者、翻译、新媒体运营、销售、培训师、程序员', '天秤座：设计师、律师、公关、咨询师、外交人员、品牌经理', '水瓶座：科学家、发明家、程序员、设计师、社工、NGO工作者'] },
        { type: 'heading', content: '水象星座：关怀与创造', level: 1 },
        { type: 'text', content: '水象星座的人情感丰富、直觉敏锐、富有同情心，适合需要共情能力、创造力、深度投入的工作。' },
        { type: 'list', content: '', items: ['巨蟹座：幼教、护士、心理咨询师、餐饮从业者、人力资源、社工', '天蝎座：心理医生、研究员、侦探、投资人、外科医生、艺术家', '双鱼座：作家、画家、音乐家、演员、设计师、慈善工作者、心理咨询师'] },
        { type: 'text', content: '当然，星座特质只是职业选择的参考因素之一。每个人都是独一无二的，教育背景、成长经历、个人兴趣都会影响职业发展。星座的意义在于帮助你发现自己的潜在优势，而不是局限你的可能性。只要你热爱、投入、坚持，任何星座都能在任何领域发光发热。' }
      ],
      relatedIds: ['k2', 'k8', 'k9']
    }
  ]
}

export const getLuckyItems = async (_signId?: string): Promise<LuckyItem[]> => {
  await delay(400)
  const shuffled = [...luckyItemsData].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 8)
}

const generateTrendScores = (baseScore: number, variance: number = 15): number => {
  const change = Math.floor(Math.random() * variance * 2) - variance
  return Math.max(50, Math.min(100, baseScore + change))
}

export const getTrendData = async (
  signId: string,
  timeRange: '7d' | '30d' | 'weekly' | 'monthly'
): Promise<TrendData> => {
  await delay(500)
  
  const today = new Date()
  let days: number
  let dateFormat: string
  let labels: string[] = []
  let dataPoints: TrendDataPoint[] = []

  switch (timeRange) {
    case '7d':
      days = 7
      dateFormat = 'MM-dd'
      break
    case '30d':
      days = 30
      dateFormat = 'MM-dd'
      break
    case 'weekly':
      days = 7 * 4
      dateFormat = "'第'II'周'"
      break
    case 'monthly':
      days = 30 * 3
      dateFormat = 'yyyy-MM'
      break
    default:
      days = 7
      dateFormat = 'MM-dd'
  }

  const baseOverall = generateRandomScore()
  const baseLove = generateRandomScore()
  const baseCareer = generateRandomScore()
  const baseWealth = generateRandomScore()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    let label: string
    if (timeRange === 'weekly') {
      const weekNum = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)
      label = `${date.getMonth() + 1}月第${weekNum}周`
    } else if (timeRange === 'monthly') {
      label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    } else {
      label = format(date, dateFormat)
    }

    if (timeRange === 'weekly') {
      const weekKey = label
      if (!labels.includes(weekKey)) {
        labels.push(weekKey)
        dataPoints.push({
          date: weekKey,
          overallScore: generateTrendScores(baseOverall, 10),
          loveScore: generateTrendScores(baseLove, 10),
          careerScore: generateTrendScores(baseCareer, 10),
          wealthScore: generateTrendScores(baseWealth, 10)
        })
      }
    } else if (timeRange === 'monthly') {
      const monthKey = label
      if (!labels.includes(monthKey)) {
        labels.push(monthKey)
        dataPoints.push({
          date: monthKey,
          overallScore: generateTrendScores(baseOverall, 8),
          loveScore: generateTrendScores(baseLove, 8),
          careerScore: generateTrendScores(baseCareer, 8),
          wealthScore: generateTrendScores(baseWealth, 8)
        })
      }
    } else {
      labels.push(label)
      dataPoints.push({
        date: label,
        overallScore: generateTrendScores(baseOverall),
        loveScore: generateTrendScores(baseLove),
        careerScore: generateTrendScores(baseCareer),
        wealthScore: generateTrendScores(baseWealth)
      })
    }
  }

  return {
    signId,
    timeRange,
    labels,
    dataPoints
  }
}

export const getRadarData = async (signId: string): Promise<RadarData> => {
  await delay(300)
  
  return {
    signId,
    love: generateRandomScore(),
    career: generateRandomScore(),
    wealth: generateRandomScore(),
    health: generateRandomScore(),
    overall: generateRandomScore()
  }
}

export const getZodiacRanking = async (date: Date): Promise<ZodiacRanking> => {
  await delay(600)
  
  const rankings = zodiacSigns.map(sign => ({
    signId: sign.id,
    signName: sign.name,
    symbol: sign.symbol,
    overallScore: generateRandomScore(),
    rank: 0
  }))
  
  rankings.sort((a, b) => b.overallScore - a.overallScore)
  rankings.forEach((item, index) => {
    item.rank = index + 1
  })

  return {
    date: format(date, 'yyyy-MM-dd'),
    rankings
  }
}

const sensitivityThresholds: Record<ReminderSensitivity, number> = {
  high: 5,
  medium: 10,
  low: 15
}

const astronomicalEventsData: AstronomicalEvent[] = [
  {
    id: 'event-1',
    type: 'mercury_retrograde',
    name: '水星逆行',
    description: '水星进入逆行期，可能影响沟通、出行、电子设备等方面。',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    icon: '☿️',
    impactLevel: 'high',
    advice: '重要文件请备份，出行提前规划，沟通多加确认，避免冲动决策。'
  },
  {
    id: 'event-2',
    type: 'full_moon',
    name: '满月',
    description: '满月期间情绪容易波动，能量达到峰值。',
    startDate: format(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    icon: '🌕',
    impactLevel: 'medium',
    advice: '注意情绪管理，避免重要决策，适合冥想和释放负能量。'
  },
  {
    id: 'event-3',
    type: 'new_moon',
    name: '新月',
    description: '新月是新的开始，适合设定目标和规划未来。',
    startDate: format(new Date(Date.now() + 19 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 19 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    icon: '🌑',
    impactLevel: 'low',
    advice: '适合立下新目标，开启新项目，是许愿和规划的好时机。'
  },
  {
    id: 'event-4',
    type: 'mars_retrograde',
    name: '火星逆行',
    description: '火星逆行期间，行动力受阻，容易冲动或拖延。',
    startDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 70 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    icon: '♂️',
    impactLevel: 'high',
    advice: '避免开始新项目，不要冲动行事，多些耐心，注意身体健康。'
  },
  {
    id: 'event-5',
    type: 'venus_retrograde',
    name: '金星逆行',
    description: '金星逆行影响感情、金钱和审美相关事务。',
    startDate: format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 130 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    icon: '♀️',
    impactLevel: 'medium',
    advice: '避免重大财务决策，感情中多沟通，不要冲动购买贵重物品。'
  },
  {
    id: 'event-6',
    type: 'solar_eclipse',
    name: '日食',
    description: '日食是强大的能量转折点，带来新的机遇和变化。',
    startDate: format(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    icon: '🌑',
    impactLevel: 'high',
    advice: '拥抱变化，把握机遇，适合做出重要决定和改变。'
  }
]

export const getAstronomicalEvents = async (): Promise<AstronomicalEvent[]> => {
  await delay(300)
  return [...astronomicalEventsData]
}

export const getActiveAstronomicalEvents = async (date: Date): Promise<AstronomicalEvent[]> => {
  await delay(200)
  const dateStr = format(date, 'yyyy-MM-dd')
  return astronomicalEventsData.filter(
    event => event.startDate <= dateStr && event.endDate >= dateStr
  )
}

export const getUpcomingAstronomicalEvents = async (days: number = 30): Promise<AstronomicalEvent[]> => {
  await delay(200)
  const today = new Date()
  const future = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  const todayStr = format(today, 'yyyy-MM-dd')
  const futureStr = format(future, 'yyyy-MM-dd')
  return astronomicalEventsData.filter(
    event => event.startDate >= todayStr && event.startDate <= futureStr
  )
}

export const generate7DayFortunes = async (signId: string, endDate: Date): Promise<DailyFortune[]> => {
  const fortunes: DailyFortune[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(endDate)
    date.setDate(date.getDate() - i)
    const fortune = await getDailyFortune(signId, date)
    fortunes.push(fortune)
  }
  return fortunes
}

export const analyzeFortuneFluctuation = async (
  signId: string,
  currentDate: Date,
  sensitivity: ReminderSensitivity = 'medium'
): Promise<FortuneFluctuation> => {
  await delay(400)
  
  const fortunes = await generate7DayFortunes(signId, currentDate)
  const currentFortune = fortunes[fortunes.length - 1]
  const previousFortunes = fortunes.slice(0, 6)
  
  const average7Days = Math.round(
    previousFortunes.reduce((sum, f) => sum + f.overallScore, 0) / previousFortunes.length
  )
  
  const fluctuation = currentFortune.overallScore - average7Days
  const fluctuationPercent = Math.round((fluctuation / average7Days) * 100)
  const threshold = sensitivityThresholds[sensitivity]
  
  let direction: 'up' | 'down' | 'neutral' = 'neutral'
  if (fluctuation >= threshold) direction = 'up'
  else if (fluctuation <= -threshold) direction = 'down'
  
  const isSignificant = direction !== 'neutral'
  
  const areaMap = [
    { key: 'love' as const, name: '爱情', score: currentFortune.loveScore, prevScore: previousFortunes.reduce((s, f) => s + f.loveScore, 0) / 6 },
    { key: 'career' as const, name: '事业', score: currentFortune.careerScore, prevScore: previousFortunes.reduce((s, f) => s + f.careerScore, 0) / 6 },
    { key: 'wealth' as const, name: '财运', score: currentFortune.wealthScore, prevScore: previousFortunes.reduce((s, f) => s + f.wealthScore, 0) / 6 },
    { key: 'health' as const, name: '健康', score: currentFortune.healthScore, prevScore: previousFortunes.reduce((s, f) => s + f.healthScore, 0) / 6 }
  ]
  
  const affectedAreas = areaMap
    .map(a => ({
      name: a.name,
      key: a.key,
      currentScore: a.score,
      fluctuation: Math.round(a.score - a.prevScore)
    }))
    .filter(a => Math.abs(a.fluctuation) >= threshold)
    .sort((a, b) => Math.abs(b.fluctuation) - Math.abs(a.fluctuation))
  
  let advice = ''
  if (direction === 'up') {
    advice = `运势上升明显，建议把握机会，在${affectedAreas.map(a => a.name).join('、') || '各领域'}方面积极行动，有望取得突破。保持积极心态，顺势而为。`
  } else if (direction === 'down') {
    advice = `运势有所下滑，建议在${affectedAreas.map(a => a.name).join('、') || '各方面'}谨慎行事，避免重大决策。调整心态，多做准备，等待时机好转。`
  } else {
    advice = '运势平稳，维持日常节奏即可。可以关注细节，积累能量，为未来做好准备。'
  }
  
  return {
    signId,
    date: format(currentDate, 'yyyy-MM-dd'),
    currentScore: currentFortune.overallScore,
    average7Days,
    fluctuation,
    fluctuationPercent,
    direction,
    isSignificant,
    affectedAreas,
    advice
  }
}

export const generateSmartReminder = async (
  signId: string,
  sensitivity: ReminderSensitivity = 'medium'
): Promise<SmartReminder | null> => {
  await delay(500)
  
  const today = new Date()
  const sign = getSignById(signId)
  if (!sign) return null
  
  const activeEvents = await getActiveAstronomicalEvents(today)
  
  if (activeEvents.length > 0) {
    const event = activeEvents[0]
    return {
      id: `smart-${Date.now()}`,
      type: 'astronomical_event',
      signId,
      title: `${sign.symbol} ${event.name}提醒`,
      content: `${event.name}期间：${event.description}`,
      direction: 'neutral',
      affectedAreas: ['沟通', '决策', '情绪'],
      advice: event.advice,
      astronomicalEvent: event,
      triggeredAt: new Date().toISOString(),
      read: false,
      sensitivity
    }
  }
  
  const fluctuation = await analyzeFortuneFluctuation(signId, today, sensitivity)
  
  if (fluctuation.isSignificant) {
    const directionText = fluctuation.direction === 'up' ? '上升' : '下降'
    const icon = fluctuation.direction === 'up' ? '📈' : '📉'
    
    return {
      id: `smart-${Date.now()}`,
      type: 'fortune_warning',
      signId,
      title: `${sign.symbol} ${sign.name}运势${directionText}预警 ${icon}`,
      content: `今日运势${directionText}${Math.abs(fluctuation.fluctuation)}分，与近7天均值${fluctuation.average7Days}分相比${directionText}明显。`,
      direction: fluctuation.direction,
      affectedAreas: fluctuation.affectedAreas.map(a => a.name),
      advice: fluctuation.advice,
      scoreChange: fluctuation.fluctuation,
      currentScore: fluctuation.currentScore,
      averageScore: fluctuation.average7Days,
      triggeredAt: new Date().toISOString(),
      read: false,
      sensitivity
    }
  }
  
  return null
}
