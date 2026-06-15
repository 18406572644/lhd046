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
      category: 'history',
      content: '十二星座起源于古巴比伦，当时人们为了方便观测天象，将黄道分为十二个区域，每个区域对应一个星座。后来，这种划分方式传入希腊，并与希腊神话相结合，形成了现在我们所熟知的十二星座。在占星学中，十二星座代表了十二种基本性格原型，人们出生时星体落入黄道上的位置，说明了一个人的先天性格及天赋。'
    },
    {
      id: 'k2',
      title: '四象星座：火风土水',
      category: 'symbolism',
      content: '十二星座按元素可分为火象、土象、风象、水象四类。火象星座（白羊、狮子、射手）热情奔放，行动力强；土象星座（金牛、处女、摩羯）稳重务实，脚踏实地；风象星座（双子、天秤、水瓶）思维活跃，善于沟通；水象星座（巨蟹、天蝎、双鱼）情感丰富，直觉敏锐。了解四象可以帮助我们更好地理解不同星座的性格特点。'
    },
    {
      id: 'k3',
      title: '白羊座的神话故事',
      category: 'mythology',
      content: '在希腊神话中，白羊座的起源与金羊毛的故事有关。传说中，为了拯救被献祭的王子佛里克索斯和赫勒，神使赫尔墨斯派遣了一只长着金羊毛的会飞的公羊。公羊驮着王子穿越欧亚大陆，途中赫勒不幸跌落海中。为了纪念这只公羊，宙斯将它升上天空，成为白羊座。而金羊毛则成为了英雄伊阿宋追寻的宝物。'
    },
    {
      id: 'k4',
      title: '占星学与天文学的区别',
      category: 'science',
      content: '很多人会混淆占星学和天文学，但它们实际上是两个完全不同的领域。天文学是一门科学，研究宇宙中的天体、星系、行星等，基于观测和数学计算。而占星学是一种信仰体系，认为天体的位置和运动会影响人类的性格和命运。从科学角度来看，没有证据支持占星学的预测能力，但它作为一种文化现象和心理慰藉，仍然被很多人喜爱。'
    },
    {
      id: 'k5',
      title: '黄道十二宫的真正含义',
      category: 'symbolism',
      content: '黄道十二宫是太阳在天球上运行的轨迹，每年太阳会依次经过十二个星座。但由于岁差现象，现在的黄道十二宫位置与两千多年前相比已经偏移了约一个星座。占星学中使用的是回归黄道，以春分点为起点，将黄道等分为十二个30度的区域，每个区域对应一个星座名称。因此，占星学中的星座与实际的天文星座位置并不完全一致。'
    },
    {
      id: 'k6',
      title: '双鱼座的浪漫传说',
      category: 'mythology',
      content: '双鱼座的神话与爱神阿芙洛狄忒和她的儿子厄洛斯有关。传说中，大地女神盖亚的儿子巨怪提丰袭击众神，众神纷纷变形逃跑。阿芙洛狄忒和厄洛斯变成两条鱼，用绳子将彼此的尾巴绑在一起，以免在混乱中失散。宙斯为了纪念他们，将这对母子变成了天上的双鱼座。双鱼座象征着永恒的爱和深深的羁绊。'
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
