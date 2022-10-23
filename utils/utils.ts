// 用户代理 iOS
exports.USERAGENT_IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/99.0.4844.59 Mobile/15E148 Safari/604.1"

/**
 * 格式化日期
 * @param date 日期
 * @param fmt 返回的可读日期。默认"YYYY-mm-dd HH:MM:SS"，对应日期 "2022-03-30 22:50:39"
 * @see https://www.jianshu.com/p/49fb78bca621
 */
exports.date = function (date = new Date(), fmt = "YYYY-mm-dd HH:MM:SS"): string {
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

/**
 * 调用青龙的通知
 * @param title 标题
 * @param msg 内容
 */
exports.notify = async (title: string, msg?: string) => {
  // 青龙自带的通知
  try {
    const {sendNotify} = require('./sendNotify')
    await sendNotify(title, msg)
    console.log(`已发送通知消息："${title}"`)
  } catch (e) {
    // @ts-ignore
    if (e instanceof Error && e?.code === "MODULE_NOT_FOUND") {
      console.warn("推送消息失败，没有找到通知模块：'./sendNotify'")
    } else {
      throw e
    }
  }
}