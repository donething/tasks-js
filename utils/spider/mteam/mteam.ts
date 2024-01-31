/**
 * 馒头PT
 * @see https://kp.m-team.cc/
 */

import {mAxios, UserAgents} from "../../http"
import {parseSetCookie} from "do-utils"
import {envTip} from "../base/comm"
import {SiteName} from "../types"

const TAG: SiteName = "mteam"

const addr = "https://kp.m-team.cc"
const loginUrl = `${addr}/takelogin.php`

// 环境变量的键
const ENV_KEY = "MT_USER_PWD"

// 开始 馒头PT 的任务
const startTask = async (): Promise<string> => {
  if (!process.env[ENV_KEY]) {
    console.log("😢", TAG, envTip(ENV_KEY))
    throw Error(`${TAG} ${envTip(ENV_KEY)}`)
  }

  console.log("🤨", TAG, "开始执行任务")

  const [username, password] = process.env[ENV_KEY].split("//")

  // 登录
  await login(username, password)

  console.log("😊", TAG, "登录成功")

  // 完成任务发送的通知
  let message = ""

  // 每日登录，避免账号被清空
  message += "已完成 每日访问的任务"

  // 完成任务
  return message
}

// 登录
// 当登录失败时，要获取 set-cookie 中的消息；成功时需要获取 set-cookie 设置的"tp"键值，再次请求时携带该 cookie
// 需要用 axios，而 fetch 无法读取到 set-cookie
const login = async (username: string, password: string): Promise<boolean> => {
  const data = `username=${username}&password=${password}`
  const headers = {
    "origin": addr,
    "referer": `${addr}/login.php`,
    "user-agent": UserAgents.Win,
    "content-type": "application/x-www-form-urlencoded"
  }

  // 因为登录失败时会在`set-cookie`中返回提示
  // 所以不要重定向
  const resp = await mAxios.post(loginUrl, data, {headers, maxRedirects: 0})

  // POST 登录后会返回 set-cookie
  const setCookies = resp.headers["set-cookie"]

  if (!setCookies) {
    throw Error(`${TAG} 响应头中没有'set-cookie'值`)
  }

  // 登录失败时，消息会通过响应 set-cookie 中的字段 flash_msg 显示
  const cookies = parseSetCookie(setCookies)
  if (cookies["flash_msg"]) {
    throw Error(decodeURIComponent(String(cookies["flash_msg"])))
  }

  // 应该登录成功，验证
  const redirectResp = await mAxios.get(addr, {headers})
  const text = redirectResp.data

  // 不包括用户名，登录失败
  if (!text.includes(username)) {
    console.log(TAG, "其它原因：\n", text)
    throw Error(`${TAG} 其它原因`)
  }

  // 登录成功
  return true
}

// 馒头PT
const MTeam = {TAG, startTask}

export default MTeam
