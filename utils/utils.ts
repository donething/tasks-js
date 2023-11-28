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
