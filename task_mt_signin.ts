/**
 * 馒头PT 签到
 * 先增加环境变量"MT_USER_PWD"，值用"//"来分隔用户名和密码。如"username//password"
 * @see https://kp.m-team.cc/
 */

// new Env('馒头签到')
// cron: 1 9,21 * * *

import {mAxios, UserAgents} from "./utils/http"
import {parseSetCookie, TGSender} from "do-utils"
import {pushTGMsg, pushTGSign} from "./utils/tgpush"

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
    throw Error("响应头中没有'set-cookie'值")
  }

  // 登录失败时，消息会通过响应 set-cookie 中的字段 flash_msg 显示
  const cookies = parseSetCookie(setCookies)
  const flashMsg = cookies["flash_msg"]
  if (flashMsg) {
    throw Error(`返回的消息 '${TGSender.escapeMk(flashMsg.toString())}'`)
  }

  // 登录成功
  const redirect = loginResp.headers["location"]
  if (!redirect) {
    throw Error(`重定向的地址为空`)
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
    throw Error(`其它原因：${text.substring(text.indexOf("<body"))}`)
  }

  // 登录成功
  console.log('😊 签到成功！')
  await pushTGSign(TAG, "签到成功", `签到成功！`)
}

// 执行
if (process.env.MT_USER_PWD) {
  const [username, password] = process.env.MT_USER_PWD.split("//")
  loginToMT(username, password).catch(err => {
    console.log(TAG, "签到出错：", err)
    pushTGMsg("签到出错", err, TAG)
  })
} else {
  console.log("😢 签到失败：环境变量'MT_USER_PWD'为空！")
}
