/**
 * 执行 hostloc 任务
 */

import puppeteer, {Page} from "puppeteer-core"
import {evalText, PupOptions, waitForNavNoThrow} from "../base/puppeteer"
import {pushTGSign} from "../../tgpush"
import {envTip} from "../base/comm"
import {typeError} from "do-utils"

export const TAG = "hostloc"

// 需要访问空间的用户 uid
const uids = ["66244", "61525", "62920", "61253", "62278", "29148",
  "62445", "59122", "24752", "6382", "65872", "62181"]
// 访问空间有奖励的次数
const SPACE_NUM = 10

// 环境变量的键
const ENV_KEY = "LOC_USER_PWD"

// 执行 hostloc 的任务
const startLocTask = async () => {
  if (!process.env[ENV_KEY]) {
    console.log("😢", TAG, envTip(ENV_KEY))
    return
  }

  const [username, password] = process.env[ENV_KEY].split("//")

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch(PupOptions)

  const page = await browser.newPage()

  page.setDefaultTimeout(5000)

  console.log("🤨", TAG, "开始执行任务")

  // 登录
  try {
    await login(username, password, page)
  } catch (e) {
    console.log("😱", TAG, "登录失败：", e)
    await pushTGSign(TAG, "登录失败", `${typeError(e).message}`)

    await browser.close()
    return
  }

  console.log("😊", TAG, "登录成功")

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
  const spaceMsg = `未完成 访问空间的任务。只成功领取 ${spaceAward}/${SPACE_NUM} 次奖励`
  message += spaceAward >= SPACE_NUM ? "已完成 访问空间的任务" : spaceMsg
  console.log("🤨", TAG, spaceMsg)

  // 已完成所有任务，关闭浏览器
  await browser.close()

  await pushTGSign(TAG, "每日任务", message)
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
    throw new Error(`${text}`)
  }

  // 可能登录成功
  // 获取用户名的元素来验证
  const name = await evalText(page, "div#um p strong a")
  if (name !== username) {
    throw Error("解析的用户名和登录的用户名不匹配")
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
    const tip = await evalText(page, selector)

    // 成功访问空间
    if (tip.includes("访问别人空间")) {
      console.log("😊", TAG, `已访问空间 ${page.url()}`)
      return true
    }

    console.log("😢", TAG, "访问空间失败", page.url(), `\n${tip}`)
  } catch (e) {
    console.log("😢", TAG, "没有出现奖励提示。可能今日已访问过该用户的空间", page.url())
  }

  return false
}

export default startLocTask
