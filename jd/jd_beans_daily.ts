/**
 * 展示最近几天内京豆的变化
 * cron 5 0 * * *  jd_beans_daily.ts
 */
const axios = require('axios')
const {date, notify, USERAGENT_IOS} = require("../utils/utils")

// cookie
const jdCookie: string = process.env.JD_COOKIE || ""
// 指定获取最近几天内，每日京东的变化量，不指定时为 7 天内
const jdBeansRecentDay: number = Number(process.env.JD_BEANS_RECENT_DAY) || 7

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

// 获取过去几天内，每日京东的变化量，默认 30 天内。不包含支出的京豆
const getBeansInDay = async (day: number): Promise<Map<string, number>> => {
  // 计算截止日期
  let expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() - day)
  let expiration = date(expirationDate, "YYYY-mm-dd")
  console.log(`查询截止日(包含)：${expiration}`)

  // 按天保存京豆的变化量，如{"2022-04-18": 130, "2022-04-19": 152}
  let beansMap = new Map<string, number>()

  // 初始化 每日、对应的京豆(0)
  for (let d = 0; d < day; d++) {
    let c = new Date()
    c.setDate(c.getDate() - d)
    beansMap.set(date(c, "YYYY-mm-dd"), 0)
  }

  // 开始联网获取京豆变化
  let page = 1
  while (true) {
    let resp = await axios.post("https://bean.m.jd.com/beanDetail/detail.json",
      `page=${page}`, {headers: headers})
    let obj: BeanDetail = resp.data

    if (obj.code && obj.code !== "0") {
      console.warn("获取京豆变化的详细信息失败：", obj)
      return beansMap
    }

    // 已读取完所有页
    if (!obj.code || !obj.jingDetailList || obj.jingDetailList.length === 0) {
      console.log("已读取完所有页，返回")
      return beansMap
    }

    // 计数
    for (let item of obj.jingDetailList) {
      // 提取 日期、京豆变化量
      let mdate = item.date.substring(0, item.date.indexOf(" "))
      // 如果该日期超出了指定的天数内，就可以停止继续获取京豆变化量了
      if (mdate <= expiration) {
        return beansMap
      }
      // 当前日期是否在初始化日期内（可选判断）
      if (beansMap.get(mdate) === undefined) {
        console.log(`当前日期"${mdate}"不在初始化日期内，退出`)
        return beansMap
      }

      // 不计算支出的京豆
      if (Number(item.amount) < 0) {
        continue
      }
      let num = Number(item.amount) + (beansMap.get(mdate) || 0)
      beansMap.set(mdate, num)
    }

    // 继续下一页
    console.log(`已获取第 ${page} 页，继续获取下一页`)
    page++
  }
}

// 展示数据
const printBeans = async (day?: number) => {
  if (!jdCookie) {
    console.log("Cookie 为空，无法获取京豆变化量")
    return
  }

  let beans = await getBeansInDay(day || jdBeansRecentDay)
  let total = 0
  let msg = "\n[每日京豆变化]\n"

  beans.forEach((v, k) => {
    total += v
    msg += `${k}: ${v}\n`
  })

  msg += `共 ${beans.size} 天，平均每天增加 ${Math.round(total / beans.size)} 个京豆`
  console.log(msg)
  notify("京豆变化", msg)
}

printBeans()