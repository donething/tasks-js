/**
 * 馒头PT 签到
 * 先增加环境变量"MT_USER_PWD"，值用"//"来分隔用户名和密码。如"username//password"
 * @see https://kp.m-team.cc/
 */

// new Env('馒头签到')
// cron: 1 9,21 * * *

import {mAxios, UserAgents} from "./utils/http"
import {parseSetCookie} from "do-utils"
import {pushTGSign} from "./utils/tgpush"

const TAG = "馒头签到"

const host = "kp.m-team.cc"
const addr = `https://${host}`
const loginUrl = `${addr}/takelogin.php`

// 签到
// 当登录失败时，要获取 set-cookie 中的消息；成功时需要获取 set-cookie 设置的"tp"键值，再次请求时携带该 cookie
// 需要用 axios，而 fetch 无法读取到 set-cookie
const loginToMT = async (username: string, password: string): Promise<void> => {
  const data = `username=${username}&password=${password}`
  const headers = {
    "authority": host,
    "origin": addr,
    "referer": `${addr}/login.php`,
    "user-agent": UserAgents.Win,
    "content-type": "application/x-www-form-urlencoded"
  }

  // 不重定向、携带cookie
  const loginResp = await mAxios.post(loginUrl, data, {
    headers,
    maxRedirects: 0,
  })

  // POST登录后会返回 set-cookie
  const setCookies = loginResp.headers["set-cookie"]

  if (!setCookies) {
    console.log("😢 签到失败：响应头中没有'set-cookie'值")
    await pushTGSign(TAG, "签到失败", "响应头中没有'set-cookie'值")
    return
  }
  // console.log("🤨 Set-Cookie:", setCookies)

  // 登录失败时，消息会通过响应 set-cookie 中的字段 flash_msg 显示
  const cookies = parseSetCookie(setCookies)
  const flashMsg = cookies["flash_msg"]
  if (flashMsg) {
    console.log("😢 签到失败：", "返回的消息：", flashMsg)
    await pushTGSign(TAG, "签到失败", `返回的消息：${flashMsg}`)
    return
  }

  // 登录成功
  const redirect = loginResp.headers["location"]
  if (!redirect) {
    console.log('😢 签到失败，重定向的地址为空：\n', loginResp.headers, "\n", loginResp.data)
    await pushTGSign(TAG, "签到失败", "重定向的地址为空")
    return
  }

  const redirectHeaders = {
    "authority": host,
    "host": host,
    "Cookie": `tp=${cookies["tp"]}`
  }
  const redirectResp = await mAxios.get(redirect, {
    headers: redirectHeaders,
    maxRedirects: 20,
  })
  const text = redirectResp.data

  // 不包括用户名，登录失败
  if (!text.includes(username)) {
    console.log("😢 登录失败：\n", text.substring(text.indexOf("<body")))
    await pushTGSign(TAG, "签到失败", "登录失败：可在面板查看该脚本的执行日志")

    return
  }

  // 登录成功
  console.log('😊 签到成功！')
  await pushTGSign(TAG, "签到成功", `签到成功！`)
}

// 执行
if (process.env.MT_USER_PWD) {
  const [username, password] = process.env.MT_USER_PWD.split("//")
  loginToMT(username, password)
} else {
  console.log("😢 签到失败：环境变量'MT_USER_PWD'为空！")
  pushTGSign(TAG, "签到失败", "环境变量'MT_USER_PWD'为空")
}
