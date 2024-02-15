/**
 * 执行 hostloc 任务
 */

import {Page} from "puppeteer-core"
import {evalText, waitForNavNoThrow} from "../base/puppeteer/puppeteer"
import {envTip} from "../base/comm"
import {sleep} from "do-utils"
import {RetPayload} from "../../../task_notify_ckecker"
import Hostloc from "./hostloc"
import {mAxios, UserAgents} from "../../http"
import {isQL} from "../../utils"

// 需要访问空间的用户 uid
const uids = ["66244", "61525", "62920", "61253", "62278", "29148",
  "62445", "59122", "24752", "32049", "65872", "62181"]
// 访问空间有奖励的次数
const SPACE_NUM = 10

// 环境变量的键
const ENV_KEY = "LOC_USER_PWD"

const addr = "https://hostloc.com"

const headersGet = {
  "referer": addr,
  "user-agent": UserAgents.Win,
}
const headersPost = {
  "origin": addr,
  "referer": addr,
  "content-type": "application/x-www-form-urlencoded",
  "user-agent": UserAgents.Win
}

// 执行 hostloc 的任务
const startLocTask = async (page: Page): Promise<string> => {
  if (!process.env[ENV_KEY]) {
    console.log("😢", Hostloc.TAG, envTip(ENV_KEY))
    throw Error(`${Hostloc.TAG} ${envTip(ENV_KEY)}`)
  }

  const [username, password] = process.env[ENV_KEY].split("//")

  console.log("🤨", Hostloc.TAG, "开始执行任务")

  // 登录
  await login(username, password, page)

  console.log("😊", Hostloc.TAG, "登录成功")

  // 完成任务发送的通知
  let message = ""

  // 访问空间
  let spaceAward = 0
  for (let uid of uids) {
    const ok = await accessSpace(uid, page)
    if (ok) {
      spaceAward++
    }
  }

  // 消息
  const spaceMsg = spaceAward >= SPACE_NUM ? "已完成 访问空间的任务" :
    `未完成 访问空间的任务。只成功领取 ${spaceAward}/${SPACE_NUM} 次奖励`
  message += spaceMsg
  console.log("🤨", Hostloc.TAG, spaceMsg)

  return message
}

// 登录
const login = async (username: string, password: string, page: Page): Promise<boolean> => {
  await page.goto("https://hostloc.com/")

  // 等待输入框出现后，输入用户名、密码后，点击“登录”
  await page.waitForSelector("form#lsform #ls_username")

  await page.type("form#lsform #ls_username", username)
  // await page.waitForSelector("#ls_password")
  await page.type("form#lsform #ls_password", password)

  await page.click("form#lsform button[type='submit']")

  // 等待登录后的页面
  await waitForNavNoThrow(page)

  // 检查是否登录成功
  const pcInnerElem = await page.$("div.pc_inner")
  if (pcInnerElem) {
    const text = await page.evaluate(el => el.textContent, pcInnerElem)
    // 每天登录奖励的消息提示，不是登录失败
    if (text?.includes("每天登录")) {
      return true
    }

    throw Error(`${Hostloc.TAG} 检查到未处理的提示文本：\n${text}`)
  }

  // 可能登录成功
  // 获取用户名的元素来验证
  const name = await evalText(page, "div#um p strong a")
  if (name !== username) {
    throw Error(`${Hostloc.TAG} 解析的用户名和登录的用户名不匹配`)
  }

  // 登录成功
  return true
}

// 访问用户的空间，获取奖励
const accessSpace = async (uid: string, page: Page): Promise<boolean> => {
  const url = `https://hostloc.com/space-uid-${uid}.html`

  await page.goto(url)

  try {
    const selector = "div.pc_inner div#creditpromptdiv"
    await page.waitForSelector(selector)
    await sleep(1000)
    const tip = await evalText(page, selector)

    // 成功访问空间
    if (tip.includes("访问别人空间")) {
      console.log("😊", Hostloc.TAG, `已访问空间 ${page.url()}`)
      return true
    }

    console.log("😢", Hostloc.TAG, "访问空间失败", page.url(), `\n${tip}`)
  } catch (e) {
    console.log("😢", Hostloc.TAG, "没有出现奖励提示。可能今日已访问过该用户的空间", page.url())
  }

  return false
}

// 检测是否有通知
const ckNotificationPuppeteer = async (page: Page): Promise<RetPayload> => {
  if (!process.env[ENV_KEY]) {
    console.log("😢", Hostloc.TAG, envTip(ENV_KEY))
    throw Error(`${Hostloc.TAG} ${envTip(ENV_KEY)}`)
  }

  const [username, password] = process.env[ENV_KEY].split("//")

  await login(username, password, page)

  await page.goto("https://hostloc.com/")

  await page.waitForSelector("a#myprompt")

  const text = await evalText(page, "a#myprompt")

  return {url: text.includes("提醒(") ? "https://hostloc.com/home.php?mod=space&do=notice" : ""}
}

// 登录(Post)
const postLogin = async (username: string, password: string): Promise<boolean> => {
  // 提取 formhash
  const respHtml = await mAxios.get(addr, {headers: headersGet})
  const hashText = respHtml.data
  const formReg = /<input.+?name="formhash"\s+value="(.+?)"/s
  const formMatch = hashText.match(formReg)
  if (!formMatch || formMatch.length <= 1) {
    throw Error(`提取 formhas 失败：${hashText}`)
  }

  const formhash = formMatch[1]
  !isQL && console.log(`🤨 提取的登录信息 formhash: ${formhash}`)

  // 登录
  !isQL && console.log(`🤨 登录信息 username='${username}', password='${password}'`)
  const data = `fastloginfield=username&username=${decodeURIComponent(username)}&password=${decodeURIComponent(password)}&formhash=${formhash}&quickforward=no&handlekey=ls`

  const loginPostUrl = `${addr}/member.php?mod=logging&action=login&loginsubmit=yes&infloat=yes&lssubmit=yes&inajax=1`
  const respPost = await mAxios.post(loginPostUrl, data, {headers: headersPost})
  const postText = respPost.data

  // 判断是否成功
  if (!postText.includes("window.location.href")) {
    console.log("登录失败：\n", postText)
    throw Error(`登录失败：'${postText}'`)
  }

  return true
}

// 检测通知(Get)
const ckNotification = async () => {
  if (!process.env[ENV_KEY]) {
    console.log("😢", Hostloc.TAG, envTip(ENV_KEY))
    throw Error(`${Hostloc.TAG} ${envTip(ENV_KEY)}`)
  }

  const [username, password] = process.env[ENV_KEY].split("//")

  await postLogin(username, password)

  const respHtml = await mAxios.get(addr, {headers: headersGet})
  const text = respHtml.data

  return {url: text.includes("a showmenu new") ? "https://hostloc.com/home.php?mod=space&do=notice" : ""}
}

// Hostloc 的任务
const HostlocTask = {startLocTask, ckNotification, ckNotificationPuppeteer}

export default HostlocTask
