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
