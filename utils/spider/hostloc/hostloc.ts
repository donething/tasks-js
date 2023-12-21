/**
 * 解析 hostloc 的帖子
 */

import {Topic, UrlInfo} from "../types"
import Parser from "rss-parser"
import {Item, LocRSS, LocSaleLJItem} from "./types"
import {TOPIC_TIME, truncate4tg} from "../base/comm"
import {date} from "do-utils"
import {mAxios, UserAgents} from "../../http"
import {getHTMLTopics} from "../base/html"

export const TAG = "hostloc"

// 匹配帖子的 ID
const tidReg = /thread-(\d+)-/i
const check = "全球主机交流论坛"
const selector = "table#threadlisttableid tbody[id^='normalthread'] th.new a.xst"
const parser = new Parser<LocRSS, Item>()

const headers = {"User-Agent": UserAgents.Win}

/**
 * 解析 hostloc 的最新帖子
 * @param fid 板块的 ID，为空""表示获取所有新帖。如 "45"表示获取“美国VPS综合讨论”分区的新帖
 */
export const parseLocRss = async (fid = ""): Promise<Topic[]> => {
  const url = `https://hostloc.com/forum.php?mod=rss&fid=${fid}`
  const resp = await mAxios.get(url, {headers})
  const rss = await parser.parseString(resp.data)

  const topics: Topic[] = []
  for (let item of rss.items) {
    const m = item.link.match(tidReg)
    if (!m || m.length <= 1) {
      throw Error(`无法解析帖子的 ID: ${item.link}`)
    }

    const tid = m[1]
    const title = item.title
    const url = item.link
    const author = item.author
    // xmlparser 将 description 解析到了 content 变量
    const content = truncate4tg(item.description || item.content || "")
    const pub = date(new Date(item.pubDate), TOPIC_TIME)

    topics.push({tag: TAG, tid, title, url, author, content, pub})
  }

  return topics
}

/**
 * 解析 hostloc 的最新帖子
 * @param fid 板块的 ID，为空""表示获取所有新帖。如 "45"表示获取“美国VPS综合讨论”分区的新帖
 */
const parseLocHtml = async (fid = ""): Promise<Topic[]> => {
  const url = `https://hostloc.com/forum.php?mod=forumdisplay&fid=${fid}&orderby=dateline`
  const info: UrlInfo = {include: check, headers, name: TAG, selector, tidReg, url}

  return await getHTMLTopics(info)
}

// 解析 https://hostloc.mjj.sale/
export const parseLocSaleLJ = async () => {
  const resp = await mAxios.get("https://hostloc.mjj.sale/")
  const data: LocSaleLJItem[] = resp.data.new_data[0]

  const topics: Topic[] = []
  for (let item of data) {
    const m = item.主题链接.match(/(?:thread-|tid=)(\d+)/i)
    if (!m || m.length <= 1) {
      console.log(item)
      throw Error(`无法解析帖子的 ID: ${item.主题链接}`)
    }

    const tid = m[1]
    const title = item.主题
    const url = item.主题链接
    const author = item.发布者
    // xmlparser 将 description 解析到了 content 变量
    const content = truncate4tg(typeof item.主题内容 === "string" ? item.主题内容 : item.主题内容.join("\n"))

    const dStr = item.发布时间.trim().replaceAll("\\", "")
    const d = dStr.substring(0, dStr.lastIndexOf(" "))
    const pub = date(new Date(d), TOPIC_TIME)

    topics.push({tag: TAG, tid, title, url, author, content, pub})
  }

  return topics
}

export default parseLocHtml
