/**
 * nodeseek 的任务
 * 因为 cloudflare 限制，需要通过无头浏览器 puppeteer 完成
 */

import puppeteer from "puppeteer-core"
import Parser from "rss-parser"
import {Item, NSRss} from "./types"
import {Topic} from "../types"
import {date} from "do-utils"
import {TOPIC_TIME, truncate4tg} from "../base/comm"
import {PupOptions} from "../base/puppeteer/puppeteer"

// 匹配 Rss 地址的正则
const rssReg = /\.xml$/i

const name = "nodeseek"
const rssUrl = "https://www.nodeseek.com/rss.xml"
const ua = "Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0"

const parser = new Parser<NSRss, Item>()

/**
 * 获取 RSS 订阅的文本内容
 */
const getRssContent = async (): Promise<string | null> => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch(PupOptions)

  const page = await browser.newPage()

  // 绕过 Cloudflare: https://stackoverflow.com/questions/71923946/cloudflare-bypass-with-puppeteer
  await page.setUserAgent(ua)

  let xmlText = ""

  // 通过捕获请求事件，获取 RSS 响应内容
  page.on("response", async response => {
    const request = response.request()
    const url = request.url()

    // 必须过滤掉其它内容
    if (!rssReg.test(url)) {
      return
    }

    // 获取响应的原始数据
    const buffer = await response.buffer()
    // 将响应数据转换为字符串形式
    xmlText = buffer.toString()
  })

  // Navigate the page to a URL
  await page.goto(rssUrl, {waitUntil: "networkidle0"})

  await browser.close()

  return xmlText
}

// 解析帖子
const parseNSRss = async (): Promise<Topic[]> => {
  const rssContent = await getRssContent()
  if (!rssContent) {
    throw Error("获取的 RSS 内容为空")
  }

  const rss = await parser.parseString(rssContent)

  const topics: Topic[] = []
  for (let item of rss.items) {
    const tid = item.guid
    const title = item.title
    const url = item.link
    const author = item.creator
    // xmlparser 将 description 解析到了 content 变量
    const content = truncate4tg(item.description || item.content || "")
    const pub = date(new Date(item.pubDate), TOPIC_TIME)

    topics.push({name, tid, title, url, author, content, pub})
  }

  return topics
}

export default parseNSRss
