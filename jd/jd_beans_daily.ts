const {USERAGENT_IOS} = require("../utils/useragent")
const {date, request} = require("../utils/utils")

// cookie
const jdCookie: string = process.env.JD_COOKIE || ""
// 指定获取最近几天内，每日京东的变化量，不指定时为 30 天内
const jdBeansRecentDay: number = Number(process.env.JD_BEANS_RECENT_DAY) || 30

const headers = {
  "accept": "application/json, text/javascript, */*; q=0.01",
  "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
  "cookie": jdCookie,
  "origin": "https://bean.m.jd.com",
  "referer": "https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean",
  "user-agent": USERAGENT_IOS,
  "x-requested-with": "XMLHttpRequest"
}

// 获取京豆详细的响应内容
interface BeanDetail {
  jingDetailList: JingDetailList[]  // 京豆变化事件
  code: string  // 0 为正常
  pin: string   // 用户名，中间部分显示为星号 *
  success: boolean
}

interface JingDetailList {
  amount: string        // 此次京东的变化量，如 2
  eventMassage: string  // 说明文本，如“东东农场转盘抽奖活动”
  date: string          // 发生的时间，如"2022-04-18 00:14:26"
}

// 获取最近几天内，每日京东的变化量，默认 30 天内（包含）
const getBeansInDay = async (day: number): Promise<Map<string, number>> => {
  let expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + day)
  let expiration = date(expirationDate, "YYYY-mm-dd")

  // 按天保存京豆的变化量，如{"2022-04-18": 130, "2022-04-19": 152}
  let beansMap = new Map<string, number>()

  let page = 1
  while (true) {
    let resp = await request(
      "https://bean.m.jd.com/beanDetail/detail.json",
      `page=${page}`,
      {headers: headers}
    )

    let obj: BeanDetail = await resp.json()
    if (obj.code !== "0") {
      console.warn("获取京豆变化的详细信息失败", obj)
      return beansMap
    }

    // 已读取完所有页
    if (!obj.jingDetailList || obj.jingDetailList.length === 0) {
      return beansMap
    }

    // 计数
    for (let item of obj.jingDetailList) {
      // 提取 日期、京豆变化量
      let mdate = item.date.substring(0, item.date.indexOf(" "))
      let num = Number(item.amount) + (beansMap.get(mdate) || 0)

      // 如果该日期超出了指定的天数内，就可以停止继续获取京豆变化量了
      if (mdate > expiration) {
        return beansMap
      }

      beansMap.set(mdate, num)
    }

    // 继续下一页
    page++
  }
}

// 展示数据
const printBeans = async () => {
  if (!jdCookie) {
    console.log("Cookie 为空，无法获取京豆变化量")
    return
  }

  let beans = await getBeansInDay(jdBeansRecentDay)
  console.log("每日京豆变化：")
  for (let [k, v] of Object.entries(beans)) {
    console.log(k, v)
  }
}

printBeans()