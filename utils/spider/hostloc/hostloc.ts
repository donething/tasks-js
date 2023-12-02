/**
 * 解析 hostloc 的帖子
 */

import {Topic} from "../types"
import Parser from "rss-parser"
import {Item, LocRSS} from "./types"
import {TOPIC_TIME, truncate4tg} from "../base/comm"
import {date} from "do-utils"
import {mAxios, UserAgents} from "../../http"

const name = "hostloc"

// 匹配帖子的 ID
const tidReg = /\/thread-(\d+)-/i
const parser = new Parser<LocRSS, Item>()

const headers = {"User-Agent": UserAgents.Win}

/**
 * 解析 hostloc 的最新帖子
 * @param fid 板块的 ID，为空""表示获取所有新帖。如 "45"表示获取“美国VPS综合讨论”分区的新帖
 */
const parseLocRss = async (fid = ""): Promise<Topic[]> => {
  const url = `https://hostloc.com/forum.php?mod=rss&fid=${fid}`
  const resp = await mAxios.get(url, {headers})
  const rss = await parser.parseString(resp.data)

  const topics: Topic[] = []
  for (let item of rss.items) {
    const m = item.link.match(tidReg)
    if (!m || m.length <= 1) {
      console.log(`无法解析帖子的 ID: '${item.link}'`)
      return []
    }

    const tid = m[1]
    const title = item.title
    const url = item.link
    const author = item.author
    // xmlparser 将 description 解析到了 content 变量
    const content = truncate4tg(item.description || item.content || "")
    const pub = date(new Date(item.pubDate), TOPIC_TIME)

    topics.push({name, tid, title, url, author, content, pub})
  }

  return topics
}

export default parseLocRss