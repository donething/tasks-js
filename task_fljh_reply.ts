/**
 * 福利江湖 回帖
 * 该站已墙
 */

// new Env('福利江湖 回帖')
// cron: */10 * * * *

import * as cheerio from 'cheerio'
import makeFetchCookie from 'fetch-cookie'
import {UserAgents, isQL, calStr, fillInitCookies, sleep, random} from "./utils/utils"
import {readJSON, writeJSON} from "./utils/file"

const {sendNotify} = require("./utils/sendNotify")

// 保存到文件的数据
type FData = {
  // 已回复过的帖子（ID）的列表
  tids?: string[]
}
// 保存数据的文件路径
const FLJH_FILE = "./db/fljh.json"

const TAG = "[FLJH]"

// 标签
// 回复的内容
const content = encodeURIComponent("感谢分享！！")

// Jar
const jar = new makeFetchCookie.toughCookie.CookieJar()
const fetchCookie = makeFetchCookie(fetch, jar)

const start = async (cookie: string) => {
  // 注入初始 Cookie
  if (!cookie) {
    console.log("请先设置环境变量 Cookie，名为'FLJH_COOKIE'\n")
    return
  }
  await fillInitCookies(jar, cookie, "https://fulijianghu.org/")

  // 获取帖子列表（ID列表）
  const tids = await getIndexTids()
  // 读取已回复的帖子列表（ID列表）
  const data = readJSON<FData>(FLJH_FILE)
  if (!data.tids) {
    data.tids = []
  }

  // 依次回复主题
  for (const [index, tid] of tids.entries()) {
    const no = index + 1
    if (data.tids.includes(tid)) {
      console.log(`${no}. 已回复过该贴(${tid})，跳过\n`)
      continue
    }

    // 回帖、处理回帖的响应
    const err = await reply(tid)

    // 限制回帖次数。需要立即停止回复剩下的帖子
    if (err && err.message.includes("所在的用户组每小时限制发回帖")) {
      // 用 break 不用 return ，是为了退出循环后，保存数据
      console.log(`${no}. 限制每小时限制发回帖的次数，退出本次回帖：\n${err.message}\n`)
      break
    }

    // 其它错误
    if (err) {
      console.log(`${no}. 回帖出错(${tid})：\n${err}`)
      await sendNotify(TAG, `回帖出错(${tid})`)
      continue
    }

    // 回帖成功
    console.log(`${no}. 回帖成功(${tid})\n`)
    data.tids.push(tid)

    // 默认要等待 15 秒，再继续回帖
    if (index !== tids.length - 1) {
      const sec = random(20, 60)
      console.log(`随机等待 ${sec} 秒后继续回复……\n`)
      await sleep(sec * 1000)
    }
  }

  writeJSON(FLJH_FILE, data)
}

const reply = async (tid: string): Promise<Error | null> => {
  const topicheaders = {
    "referer": "https://fulijianghu.org",
    "user-agent": UserAgents.Win
  }
  // 获取验证回答需要的 hashid
  const topicURL = `https://fulijianghu.org/forum.php?mod=viewthread&tid=${tid}`
  const topicResp = await fetchCookie(topicURL, {headers: topicheaders})
  const hashText = await topicResp.text()
  if (hashText.includes("您需要登录后才可以回帖")) {
    return new Error("需要登录后才可以回帖")
  }

  const reg = /<input.+?name="formhash"\s+value="(?<formhash>.+?)".+?<span\s+id="secqaa_(?<hashid>\S+)">/s
  const match = hashText.match(reg)
  if (!match || !match.groups) {
    return new Error(`提取 formhash、hashid 失败：${hashText}`)
  }
  const {formhash, hashid} = match.groups

  // 获取验证回答
  const qaa = await getSecqaa(hashid)
  !isQL && console.log(`提取帖子(${tid})的信息 formhash: ${formhash} , hashid: ${hashid} , qaa: ${qaa}`)

  // 回复
  const replyHeaders = {
    "origin": "https://fulijianghu.org",
    "referer": "https://fulijianghu.org",
    "content-type": "application/x-www-form-urlencoded",
    "user-agent": UserAgents.Win
  }
  const replyURL = "https://fulijianghu.org/forum.php?mod=post&action=reply&replysubmit=yes&" +
    "handlekey=fastpost&inajax=1&tid=" + tid
  const now = parseInt("" + Date.now() / 1000)
  const body = `message=${content}&secqaahash=${hashid}&secanswer=${qaa}&posttime=${now}&formhash=${formhash}` +
    "&usesig=1&subject=++"
  const method = "POST"
  const replyResp = await fetchCookie(replyURL, {body, headers: replyHeaders, method})
  const replyText = await replyResp.text()

  // 解析响应
  // 回帖太频繁。等待一些秒数后再回复
  if (replyText.includes("两次发表间隔少于")) {
    await sleep(random(20, 60))
    return await reply(tid)
  }

  // 回帖失败的其它原因
  if (!replyText.includes("回复发布成功")) {
    return new Error(`回帖失败：${replyText}`)
  }

  // 回帖成功
  return null
}

/**
 * 获取某栏目首页的帖子列表（id 列表）
 */
const getIndexTids = async (): Promise<string[]> => {
  const tids: string[] = []

  const headers = {
    "referer": "https://fulijianghu.org",
    "user-agent": UserAgents.Win
  }
  const url = `https://fulijianghu.org/forum.php?mod=forumdisplay&fid=63&filter=sortall&sortall=1`
  const resp = await fetchCookie(url, {headers})
  const text = await resp.text()

  // 解析
  const $ = cheerio.load(text)
  for (let item of $("table#threadlisttableid tbody[id^='normalthread']")) {
    const idStr = $(item).attr("id")
    if (!idStr) {
      console.log(`无法获取元素的属性 id：${$(item).text()}\n`)
      continue
    }

    const id = idStr.substring(idStr.indexOf("_") + 1)
    tids.push(id)
  }

  return tids
}

/**
 * 获取验证回答
 * @param hashid 该验证的 ID。如"qSnm317v"，
 * 可以从回复页面的源码中获取：`<div class="mtm"><span id="secqaa_qSnm317v"></span>`
 */
const getSecqaa = async (hashid: string): Promise<number> => {
  const headers = {
    "referer": "https://fulijianghu.org",
    "user-agent": UserAgents.Win
  }
  const url = `https://fulijianghu.org/misc.php?mod=secqaa&action=update&idhash=${hashid}&${Math.random()}`
  const resp = await fetchCookie(url, {headers})
  const text = await resp.text()
  const match = text.match(/class="vm"\s\/><\/span>'.+?'(?<expression>.+?)=/s)
  if (!match || !match.groups) {
    throw `提取验证回答失败：` + text
  }

  const {expression} = match.groups

  return calStr(expression)
}

//
// 执行
// 先设置环境变量 Cookie。如在本地 Powershell中：$env:FLJH_COOKIE="my cookie ..."
start(process.env.FLJH_COOKIE || "")

export {}