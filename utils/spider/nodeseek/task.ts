import puppeteer, {Page} from "puppeteer-core"
import {envTip} from "../base/comm"
import {evalText, PupOptions, waitForNavNoThrow} from "../base/puppeteer/puppeteer"
import {SignResp} from "./types"
import {sleep} from "do-utils"
import {TAG} from "./nodeseek"

// 环境变量的键
const ENV_KEY = "NODESEEK_USER_PWD"

// 登录
const login = async (page: Page): Promise<boolean> => {
  if (!process.env[ENV_KEY]) {
    console.log("😢", TAG, envTip(ENV_KEY))
    throw Error(`${TAG} ${envTip(ENV_KEY)}`)
  }

  const [username, password] = process.env[ENV_KEY].split("//")

  await page.goto("https://www.nodeseek.com/signIn.html")

  await sleep(15 * 1000)
  for (let i = 0; i < 3; i++) {
    const iframe = await page.$('iframe')
    if (!iframe) {
      break
    }

    const frame = await iframe.contentFrame()
    if (!await frame.$("input[type='checkbox']")) {
      break
    }

    await frame.click("input[type='checkbox']")
    await sleep(10 * 1000)
  }

  // 等待输入框出现后，输入用户名、密码后，点击“登录”
  await page.waitForSelector("form input#stacked-email")

  await page.type("form input#stacked-email", username)
  // await page.waitForSelector("#ls_password")
  await page.type("form input#stacked-password", password)

  await page.click("form div#login-btn-group button")

  // 等待登录后的页面
  await waitForNavNoThrow(page)

  // 检查是否登录成功
  const msg = await pickMsg(page)
  if (msg) {
    throw new Error(`登录失败："${msg}"`)
  }

  // 可能登录成功
  // 获取用户名的元素来验证
  const name = await evalText(page, "div.user-card a.Username")
  if (name !== username) {
    throw Error("解析的用户名和登录的用户名不匹配")
  }

  // 登录成功
  return true
}

// 签到
export const sign = async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch(PupOptions)

  const page = await browser.newPage()

  page.setDefaultTimeout(60 * 1000)

  if (!(await login(page))) {
    return
  }

  // 在浏览器上下文中发送 fetch 请求
  const resp: SignResp = await page.evaluate(async () => {
    // 这里是在浏览器环境中执行的代码
    const resp = await fetch("https://www.nodeseek.com/api/attendance?random=true", {
      "referrer": "https://www.nodeseek.com/board",
      "body": null,
      "method": "POST",
      "mode": "cors",
      "credentials": "include"
    })

    return await resp.json()
  })

  if (!resp.success) {
    console.log(TAG, "签到失败：", resp.message)
    return
  }

  console.log(TAG, "签到成功：", resp.message)
}

// 检测通知
export const ckNotifily = async (page: Page): Promise<string> => {
  if (!(await login(page))) {
    return ""
  }

  await page.goto("https://www.nodeseek.com/")

  // 等待输入框出现后，输入用户名、密码后，点击“登录”
  await page.waitForSelector("div.user-card")

  const count = await evalText(page, "div.user-card span.notify-count")

  return !!count ? "https://www.nodeseek.com/notification" : ""
}

// 提取网页弹出的消息
const pickMsg = async (page: Page): Promise<string> => {
  const msgElem = await page.$("div.msc-content .msc-title")

  if (msgElem) {
    const msg = await page.evaluate(el => el.textContent, msgElem)
    return (msg || "").trim()
  }

  return ""
}
