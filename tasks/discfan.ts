/**
 * 港知堂 开放注册
 * 检测PT分享站“港知堂”是否开放开放注册
 * cron 0 * * * *
 */

// 是否为青龙环境
const isQL = !!process.env.cmd_ql

const axios = require('axios')
const {sendNotify} = require(isQL ? "./utils/sendNotify" : "../utils/sendNotify")

/**
 * 检测是否开放注册
 */
const check = async () => {
  let resp = await axios.get("https://discfan.net/signup.php")
  let text = await resp.data

  if (text.indexOf("自由註冊當前關閉") >= 0) {
    console.log("PT站H知堂 还未开放注册")
    return
  }

  console.log("PT站H知堂 正在开放注册，将发送通知提醒：", text)
  await sendNotify("[青龙] 开放注册", "PT站H知堂 已开放注册，可以去注册了：https://discfan.net/signup.php")
}

check()
