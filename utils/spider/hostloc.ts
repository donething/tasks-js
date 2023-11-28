import {UserAgents} from "../http"
import {Topic, TopicSite} from "./types"
import {getTopics} from "./base"

const name = "hostloc"
const host = "hostloc.com"
const addr = `https://${host}`

// 提取网页中的信息
const selector = "table#threadlisttableid tbody[id^='normalthread'] th.new a.xst"
const tidReg = /thread-(\d+)/
const check = "全球主机交流论坛"

// Hostloc
const Hostloc: TopicSite = {
  /**
   * 获取 HOSTLOC 的帖子
   * @param fid 分区的 ID。如 "45"，表示“美国VPS综合讨论”
   */
  getTids: async (fid: string): Promise<Topic[]> => {
    const url = `${addr}/forum.php?mod=forumdisplay&fid=${fid}&orderby=dateline`
    const headers = {
      "Referer": addr,
      "User-Agent": UserAgents.Win
    }

    return getTopics({url, headers, check, selector, tidReg, name})
  }
}

export default Hostloc
