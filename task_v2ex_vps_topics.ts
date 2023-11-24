/**
 * 当出现和 VPS 有关的新帖时，发送通知
 */

// new Env('VPS新帖')
// cron: */2 * * * * *

import Parser from 'rss-parser'
import {readJSON, writeJSON} from "./utils/file"
import {pushTGMsg} from "./utils/tgpush"

const TAG = "VPS新帖"

// 只匹配 cloudcone 有关的帖子
const vpsRegex = /(\bvps\b)/i

const FILE_VPS_RELATED = "./db/topics_vps_related.json"

const parser = new Parser<Feed, Item>()

// RSS 总概括信息
interface Feed {
  // V2EX
  title: string
  // way to explore
  subtitle: string
  // https://www.v2ex.com/
  link: string
  // https://www.v2ex.com/
  id: string
  // 2023-11-24T06:54:11Z
  updated: string
}

// RSS 主题信息
interface Item {
  // [宽带症候群] 安卓 TV 哪个免费 IPTV 播放器好用？
  title: string
  // https://www.v2ex.com/t/994843#reply0
  link: string
  // tag:www.v2ex.com,2023-11-24:/t/994843
  id: string
  // 2023-11-24T06:50:17Z
  published: string
  // 2023-11-24T06:50:17Z
  updated: string
  author: {
    // jgh004
    name: string
    // https://www.v2ex.com/member/jgh004
    uri: string
  }
  // <p>看到 windows</p>
  content: string
}

// 存储到文件的数据结构
interface Data {
  v2ex?: string[]
}

// 扫描帖子
const scan = async () => {
  let feed = await parser.parseURL("https://www.v2ex.com/index.xml")

  // 读取已提示的帖子列表（ID列表）
  const data = readJSON<Data>(FILE_VPS_RELATED)
  if (!data.v2ex) {
    data.v2ex = []
  }

  let tips: string[] = []
  let i = 1
  for (let item of feed.items) {
    // 帖子的 ID。如"12345"
    const idResult = item.id.match(/\/t\/(\d+)$/)
    if (!idResult || !idResult[1]) {
      console.log(`😢 没有匹配到帖子的 ID："${item.id}"`)
      continue
    }
    const tid = idResult[1]

    // 只匹配指定帖子
    if (!vpsRegex.test(item.title)) {
      console.log(`😒 跳过帖子：`, item.title, "\n  ", item.link, "\n")
      continue
    }

    // 已通知过帖子
    if (data.v2ex.includes(tid)) {
      console.log(`😂 已通知过：`, item.title, "\n  ", item.link, "\n")
      continue
    }

    console.log(`😊 通知新帖：`, item.title, "\n  ", item.link, "\n")
    tips.push(`${i}.<a href="${item.link}">${item.title}</a>`)
    data.v2ex.push(tid)

    i++
  }

  // 没有新帖
  if (tips.length === 0) {
    console.log("\n😪 此次刷新没有相关的新帖")
    return
  }

  await pushTGMsg(`*VPS*相关的新帖列表：\n\n${tips.join("\n")}`)
  writeJSON(FILE_VPS_RELATED, data)
}

// 执行
scan()
