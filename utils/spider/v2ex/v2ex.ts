import Parser from "rss-parser"
import {Topic} from "../types"
import {TOPIC_TIME, truncate4tg} from "../base/comm"
import {date} from "do-utils"
import {Item, V2RSS} from "./types"
import {mAxios} from "../../http"

const tidReg = /\/t\/(\d+)$/i
const name = "v2ex"
const rssUrl = "https://www.v2ex.com/index.xml"

const parser = new Parser<V2RSS, Item>()

/**
 * 解析 v2ex 的最新帖子
 */
const parseV2exRss = async (): Promise<Topic[]> => {
  const resp = await mAxios.get(rssUrl)
  const rss = await parser.parseString(resp.data)

  const topics: Topic[] = []
  for (let item of rss.items) {
    const m = item.id.match(tidReg)
    if (!m || m.length <= 1) {
      throw Error(`无法解析帖子的 ID: "${item.id}"`)
    }

    const tid = m[1]
    const title = item.title
    const url = item.link
    const author = item.author
    // xmlparser 将 description 解析到了 content 变量
    const content = truncate4tg(item.content || "")
    const pub = date(new Date(item.pubDate), TOPIC_TIME)

    topics.push({name, tid, title, url, author, content, pub})
  }

  return topics
}

export default parseV2exRss
