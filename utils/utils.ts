export const UserAgents = {
  Android: "Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
  iOS: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/99.0.4844.59 Mobile/15E148 Safari/604.1",
  Win: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
}

// 是否为青龙环境
export const isQL = !!process.env.cmd_ql

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
