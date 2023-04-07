// 用户代理
const httpsProxyAgent = require('https-proxy-agent')

export const UserAgents = {
  iOS: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/99.0.4844.59 Mobile/15E148 Safari/604.1",
  Win: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
}

/**
 * 格式化日期
 * @param date 日期
 * @param fmt 返回的可读日期。默认"YYYY-mm-dd HH:MM:SS"，对应日期 "2022-03-30 22:50:39"
 * @see https://www.jianshu.com/p/49fb78bca621
 */
export const date = function (date = new Date(), fmt = "YYYY-mm-dd HH:MM:SS"): string {
  const opt = {
    "Y+": date.getFullYear().toString(),        // 年
    "m+": (date.getMonth() + 1).toString(),     // 月
    "d+": date.getDate().toString(),            // 日
    "H+": date.getHours().toString(),           // 时
    "M+": date.getMinutes().toString(),         // 分
    "S+": date.getSeconds().toString()          // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  }

  let ret: RegExpExecArray | null
  for (const [key, value] of Object.entries(opt)) {
    ret = new RegExp("(" + key + ")").exec(fmt)
    if (ret) {
      fmt = fmt.replace(
        ret[1],
        ret[1].length === 1 ? value : value.padStart(ret[1].length, "0")
      )
    }
  }

  return fmt
}

// 是否为青龙环境
export const isQL = !!process.env.cmd_ql

// axios 是否用代理
export const axiosHttpsAgent = !!process.env.cmd_ql ? {} : new httpsProxyAgent({host: "127.0.0.1", port: 1081})

// 计算字符串型的数学计算
// @see https://stackoverflow.com/a/73250658
export const calStr = (expression: string) => {
  return new Function(` return ${expression}`)()
}

/**
 * 填充初始 Cookie
 * @param jar CookieJar 的实例
 * @param cookies 可多个 Cookie。如 "name=Li; age=23"
 * @param url 域名。如 "http://127.0.0.1:12345"
 */
export const fillInitCookies = async (jar: any, cookies: string, url: string) => {
  const items = cookies.split(";")
  for (let item of items) {
    await jar.setCookie(item, url, {ignoreError: false})
  }
}

/**
 * 等待毫秒
 * @param ms 毫秒
 */
export const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * 返回两数之间（包含）的随机数
 * @param min 最小值
 * @param max 最大值
 */
export const random = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}