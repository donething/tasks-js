/**
 * 提取 RSS 中的帖子。如 v2ex
 */

import Parser from "rss-parser"

/**
 * 获取 Xml 页面的帖子
 * @param url RSS 订阅地址
 */
const getXmlTopics = async <F, I>(url: string) => {
  const parser = new Parser<F, I>()
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/119.0.0.0 Safari/537.36',
  }

  const resp = await fetch(url, {headers})
  const text = await resp.text()
  if (!text.includes("RSS for Node")) {
    console.log("获取的数据不正确：\n", text)
    return
  }

  return await parser.parseString(text)
}
export default getXmlTopics
