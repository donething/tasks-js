/**
 * 当有人出低价 CC VPS 时，发送通知
 */

// new Env('CC出价')
// cron: */30 * * * * *

import {request} from "do-utils"
import * as cheerio from 'cheerio'
import {UserAgents} from "./utils/utils"
import {readJSON, writeJSON} from "./utils/file"
import {pushTextMsg} from "./utils/wxpush"

const TAG = "CC出价"

// 只匹配 cloudcone 有关的帖子
const ccRegex = /\b(cc|cloudcone)\b/i

const host = "hostloc.com"
const addr = `https://${host}`
const indexUrl = `${addr}/forum.php?mod=forumdisplay&fid=45&orderby=dateline&mobile=1`

// 保存数据的文件路径
const FILE_CC_LOW_PRICE = "./db/cc_low_price.json"

// 提取的主题关键信息
interface Thread {
  // 标题
  title: string
  // 帖子ID。如"123"
  tid: string
}

const scan = async () => {
  // 读取帖子列表
  const threads = await getIndexTids()

  // 读取已提示的帖子列表（ID列表）
  const data = readJSON<{ tids: string[] }>(FILE_CC_LOW_PRICE)
  if (!data.tids) {
    data.tids = []
  }

  let tips: string[] = []
  let i = 1
  for (const t of threads) {
    const url = `${addr}/thread-${t.tid}-1-1.html`

    // 只匹配指定帖子
    if (!ccRegex.test(t.title)) {
      console.log(`😒 跳过帖子：`, t.title, "\n  ", url, "\n")
      continue
    }
    // 已通知过帖子
    if (data.tids.includes(t.tid)) {
      console.log(`😂 已通知过：`, t.title, "\n  ", url, "\n")
      continue
    }

    console.log(`😊 通知新帖：`, t.title, "\n  ", url, "\n")
    tips.push(`${i}.<a href="${url}">${t.title}</a>`)
    data.tids.push(t.tid)

    i++
  }

  // 没有新帖
  if (tips.length === 0) {
    console.log("\n😪 此次刷新没有相关的新帖")
    return
  }

  await pushTextMsg(TAG, `新的低价CC的帖子列表：\n\n${tips.join("\n")}`)
  writeJSON(FILE_CC_LOW_PRICE, data)
}

// 获取首页帖子
const getIndexTids = async (): Promise<Thread[]> => {
  const headers = {
    "Referer": addr,
    "User-Agent": UserAgents.Win
  }

  const resp = await request(indexUrl, undefined, {headers})
  const text = await resp.text()

  const tids: Thread[] = []
  // 解析
  const $ = cheerio.load(text)
  if (!$("title").text()) {
    console.log("😢 解析不到标志元素。可能是被风控，导致获取的数据不正确：\n", "  ", text)
    return []
  }

  for (let item of $("table#threadlisttableid tbody[id^='normalthread'] th.new a.xst")) {
    const t = $(item)
    const title = t.text().trim()

    const path = t.attr("href")
    if (!path) {
      console.log("😢 获取帖子 ID 失败：路径 path 为空：", t.toString())
      continue
    }
    const m = path.match(/thread-(\d+)/)
    if (!m || m.length <= 1) {
      console.log("😢 获取帖子 ID 失败：没有匹配到帖子的 tid：", path)
      continue
    }
    const id = m[1]
    const thread: Thread = {title, tid: id}

    tids.push(thread)
  }

  return tids
}

scan()
