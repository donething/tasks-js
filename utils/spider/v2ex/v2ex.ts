import Parser from "rss-parser"
import {SiteName, Topic} from "../types"
import {TOPIC_TIME, truncate4tg} from "../base/comm"
import {date} from "do-utils"
import {Item, RSS} from "./types"
import {mAxios} from "../../http"

const tidReg = /\/t\/(\d+)$/i
const rssUrl = "https://www.v2ex.com/index.xml"

const parser = new Parser<RSS, Item>()

const TAG: SiteName = "v2ex"

/**
 * 解析 v2ex 的最新帖子
 */
const parseRss = async (): Promise<Topic[]> => {
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

    topics.push({tag: TAG, tid, title, url, author, content, pub})
  }

  return topics
}

// V2ex
const V2ex = {TAG, parseRss}

export default V2ex
