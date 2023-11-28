import {mAxios} from "../http"
import * as cheerio from "cheerio"
import {Topic, UrlInfo} from "./types"

/**
 * 获取页面的帖子
 */
export const getTopics = async (urlInfo: UrlInfo): Promise<Topic[]> => {
  const resp = await mAxios.get(urlInfo.url, {headers: urlInfo.headers})
  const text: string = await resp.data

  if (!text.includes(urlInfo.check)) {
    console.log(`😢 获取帖子失败：解析不到标志"${urlInfo.check}"。可能被风控：${urlInfo.url}\n`, "  ", text)
    // await pushTGMsg(`获取帖子失败：解析不到标志"${urlInfo.check}"。可能被风控：\n${urlInfo.url}`)
    return []
  }

  // 解析
  const tids: Topic[] = []
  const $ = cheerio.load(text)
  for (let item of $(urlInfo.selector)) {
    const t = $(item)
    // 标题
    const title = t.text().trim()

    const path = t.attr("href")
    if (!path) {
      console.log("😢 获取帖子 ID 失败：路径 path 为空：", t.toString())
      continue
    }
    const m = path.match(urlInfo.tidReg)
    if (!m || m.length <= 1) {
      console.log("😢 获取帖子 ID 失败：没有匹配到帖子的 tid：", path)
      continue
    }

    // 帖子 ID
    const tid = m[1]

    // 帖子 URL
    let url = ""
    const baseUrl = new URL(urlInfo.url).origin
    // 检查 href 是否为相对路径
    if (path.startsWith('//')) {
      // 处理协议相对 URL
      url = baseUrl.startsWith('https') ? `https:${path}` : `http:${path}`
    } else if (!path.startsWith('http')) {
      // 如果是相对路径，拼接基础 URL 和 href
      url = new URL(path, baseUrl).href
    }

    const name = urlInfo.name

    tids.push({title, tid, url, name})
  }

  return tids
}
