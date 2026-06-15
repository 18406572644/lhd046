import type { ZodiacSign } from '@/types'

export const zodiacSigns: ZodiacSign[] = [
  {
    id: 'aries',
    name: '白羊座',
    symbol: '♈',
    dateRange: '3月21日 - 4月19日',
    startDate: { month: 3, day: 21 },
    endDate: { month: 4, day: 19 },
    element: 'fire',
    rulingPlanet: '火星',
    luckyColor: '红色',
    luckyNumber: [1, 9]
  },
  {
    id: 'taurus',
    name: '金牛座',
    symbol: '♉',
    dateRange: '4月20日 - 5月20日',
    startDate: { month: 4, day: 20 },
    endDate: { month: 5, day: 20 },
    element: 'earth',
    rulingPlanet: '金星',
    luckyColor: '绿色',
    luckyNumber: [2, 6]
  },
  {
    id: 'gemini',
    name: '双子座',
    symbol: '♊',
    dateRange: '5月21日 - 6月21日',
    startDate: { month: 5, day: 21 },
    endDate: { month: 6, day: 21 },
    element: 'air',
    rulingPlanet: '水星',
    luckyColor: '黄色',
    luckyNumber: [3, 5]
  },
  {
    id: 'cancer',
    name: '巨蟹座',
    symbol: '♋',
    dateRange: '6月22日 - 7月22日',
    startDate: { month: 6, day: 22 },
    endDate: { month: 7, day: 22 },
    element: 'water',
    rulingPlanet: '月亮',
    luckyColor: '银色',
    luckyNumber: [2, 7]
  },
  {
    id: 'leo',
    name: '狮子座',
    symbol: '♌',
    dateRange: '7月23日 - 8月22日',
    startDate: { month: 7, day: 23 },
    endDate: { month: 8, day: 22 },
    element: 'fire',
    rulingPlanet: '太阳',
    luckyColor: '金色',
    luckyNumber: [1, 10]
  },
  {
    id: 'virgo',
    name: '处女座',
    symbol: '♍',
    dateRange: '8月23日 - 9月22日',
    startDate: { month: 8, day: 23 },
    endDate: { month: 9, day: 22 },
    element: 'earth',
    rulingPlanet: '水星',
    luckyColor: '灰色',
    luckyNumber: [4, 8]
  },
  {
    id: 'libra',
    name: '天秤座',
    symbol: '♎',
    dateRange: '9月23日 - 10月23日',
    startDate: { month: 9, day: 23 },
    endDate: { month: 10, day: 23 },
    element: 'air',
    rulingPlanet: '金星',
    luckyColor: '粉色',
    luckyNumber: [3, 6]
  },
  {
    id: 'scorpio',
    name: '天蝎座',
    symbol: '♏',
    dateRange: '10月24日 - 11月22日',
    startDate: { month: 10, day: 24 },
    endDate: { month: 11, day: 22 },
    element: 'water',
    rulingPlanet: '冥王星',
    luckyColor: '深紫色',
    luckyNumber: [4, 9]
  },
  {
    id: 'sagittarius',
    name: '射手座',
    symbol: '♐',
    dateRange: '11月23日 - 12月21日',
    startDate: { month: 11, day: 23 },
    endDate: { month: 12, day: 21 },
    element: 'fire',
    rulingPlanet: '木星',
    luckyColor: '紫色',
    luckyNumber: [3, 12]
  },
  {
    id: 'capricorn',
    name: '摩羯座',
    symbol: '♑',
    dateRange: '12月22日 - 1月19日',
    startDate: { month: 12, day: 22 },
    endDate: { month: 1, day: 19 },
    element: 'earth',
    rulingPlanet: '土星',
    luckyColor: '咖啡色',
    luckyNumber: [4, 7]
  },
  {
    id: 'aquarius',
    name: '水瓶座',
    symbol: '♒',
    dateRange: '1月20日 - 2月18日',
    startDate: { month: 1, day: 20 },
    endDate: { month: 2, day: 18 },
    element: 'air',
    rulingPlanet: '天王星',
    luckyColor: '古铜色',
    luckyNumber: [5, 11]
  },
  {
    id: 'pisces',
    name: '双鱼座',
    symbol: '♓',
    dateRange: '2月19日 - 3月20日',
    startDate: { month: 2, day: 19 },
    endDate: { month: 3, day: 20 },
    element: 'water',
    rulingPlanet: '海王星',
    luckyColor: '海蓝色',
    luckyNumber: [6, 12]
  }
]

export const getSignById = (id: string): ZodiacSign | undefined => {
  return zodiacSigns.find(sign => sign.id === id)
}

export const getSignByDate = (date: Date): ZodiacSign | undefined => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  return zodiacSigns.find(sign => {
    const startMonth = sign.startDate.month
    const startDay = sign.startDate.day
    const endMonth = sign.endDate.month
    const endDay = sign.endDate.day
    
    if (startMonth <= endMonth) {
      return (month > startMonth || (month === startMonth && day >= startDay)) &&
             (month < endMonth || (month === endMonth && day <= endDay))
    } else {
      return (month > startMonth || (month === startMonth && day >= startDay)) ||
             (month < endMonth || (month === endMonth && day <= endDay))
    }
  })
}
