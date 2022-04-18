/**
 * 执行网络请求
 * 因为使用了 fetch，仅支持在类 chromium 中调用
 * @param url 目标链接
 * @param data 需要 POST 的数据
 * @param init 其它选项
 */
exports.request = async function (url: string, data?: FormData | object | string, init?: RequestInit) {
  let ops: RequestInit = init || {}

  // 是否为POST请求
  if (data) {
    ops.method = "POST"
    ops.headers = new Headers(init?.headers)

    // 判断POST的数据类型
    if (data instanceof FormData) {
      // POST 二进制数据，不需要指定类型
      ops.body = data
    } else if (typeof data === "object") {
      // POST json 数据
      ops.body = JSON.stringify(data)
      // 如果参数 headers 中有指定 Content-Type，则使用已指定的值，否则设为 json
      if (!ops.headers.get("Content-Type")) {
        ops.headers.append("Content-Type", "application/json")
      }
    } else {
      // typeof data === "string"
      // POST 表单
      ops.body = data
      if (!ops.headers.get("Content-Type")) {
        // 如果参数 headers 中有指定 Content-Type，则使用已指定的值，否则设为 form
        ops.headers.append("Content-Type", "application/x-www-form-urlencoded")
      }
    }
  }

  return await fetch(url, ops)
}

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
