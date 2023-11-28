import {Topic, TopicSite} from "./types"
import {UserAgents} from "../http"
import {getTopics} from "./base"

const name = "nodeseek"
const host = "www.nodeseek.com"
const addr = `https://${host}`

// 提取网页中的信息
const check = "新帖子"
const selector = "div#nsk-body ul.post-list li.post-list-item div.post-title a"
const tidReg = /post-(\d+)-/

// Nodeseek
const Nodeseek: TopicSite = {
  /**
   * 获取 NODESEEK 的帖子
   * @param categories 分区名，为空""时则获取首页帖子。如 "tech"，表示“技术板块”
   */
  getTids: async (categories: string): Promise<Topic[]> => {
    const path = !categories ? "/" : `/categories/${categories}`
    const url = addr + path + "?sortBy=postTime"
    const headers = {
      "Referer": addr,
      "User-Agent": UserAgents.Win
    }

    return getTopics({url, headers, check, selector, tidReg, name})
  }
}

export default Nodeseek
