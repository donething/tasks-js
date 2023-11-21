/**
 * 馒头PT 签到
 * 先增加环境变量"MT_USER_PWD"，值用"//"来分隔用户名和密码。如"username//password"
 * @see https://kp.m-team.cc/
 */

// new Env('馒头签到')
// cron: * 9,21 * * *

import {pushTextMsg} from "./utils/push"
import {request} from "do-utils"
import {UserAgents} from "./utils/utils"

const tag = "[青龙] 馒头签到"
const host = "kp.m-team.cc"
const addr = `https://${host}`
const loginUrl = `${addr}/takelogin.php`

// 签到
const loginToMT = async (username: string, password: string): Promise<void> => {
  const headers = {
    "authority": host,
    "origin": addr,
    "referer": `${addr}/login.php`,
    "user-agent": UserAgents.Win
  }

  const data = `username=${username}&password=${password}`
  const resp = await request(loginUrl, data, {headers})
  const text = await resp.text()

  // 不包括用户名，登录失败
  if (!text.includes(username)) {
    console.log("登录失败：\n", text.substring(text.indexOf("<body")))
    await pushTextMsg(tag, "登录失败：可在面板查看该脚本的执行日志")

    return
  }

  // 登录成功
  console.log('签到成功！')
  await pushTextMsg(tag, `签到成功！`)
}

// 执行
if (process.env.MT_USER_PWD) {
  const [username, password] = process.env.MT_USER_PWD.split("//")
  loginToMT(username, password)
}
