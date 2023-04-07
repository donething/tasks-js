/**
 * 福利江湖
 * 回复帖子。该站已墙
 * cron * * * * *
 */

import * as cheerio from 'cheerio'
import makeFetchCookie from 'fetch-cookie'
import {UserAgents, isQL, calStr, fillInitCookies, sleep} from "./utils/utils"
import {readJSON, writeJSON} from "./utils/file"

const {sendNotify, Env} = require("./utils/sendNotify")
new Env("福利江湖回帖")

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
    console.log("请先设置环境变量 Cookie，名为'FLJH_COOKIE'")
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
    if (data.tids.includes(tid)) {
      !isQL && console.log(`已回复过该贴(${tid})，跳过`)
      continue
    }

    const err = await reply(tid)
    if (err) {
      console.log(`回帖出错(${tid})：\n${err}`)
      await sendNotify(TAG, `回帖出错(${tid})`)
      continue
    }

    data.tids.push(tid)
    // 默认要等待 15 秒
    if (index !== tids.length - 1) {
      console.log("等待几秒后继续回复…")
      await sleep(18000)
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
  if (!replyText.includes("回复发布成功")) {
    return new Error(`回帖失败：${replyText}`)
  }

  console.log(`回帖(${tid})成功`)
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
      console.log("无法获取元素的属性 id：", $(item).text())
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
  !isQL && console.log("验证回答的问题：", expression)

  return calStr(expression)
}

//
// 执行
// 先设置环境变量 Cookie。如在本地 Powershell中：$env:FLJH_COOKIE="my cookie ..."
start(process.env.FLJH_COOKIE || "")

export {}