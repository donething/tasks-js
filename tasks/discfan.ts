/**
 * 港知堂 开放注册
 * 检测PT分享站“港知堂”是否开放开放注册
 * cron 0 * * * *
 */

const TAG = "[PT站H知堂]"

// 是否为青龙环境
const isQL = !!process.env.cmd_ql
const axios = require('axios')
const {sendNotify} = require(isQL ? "./utils/sendNotify" : "../utils/sendNotify")

const headers = {
  // 请求头不能含有 host ，否则目标网站会返回SSL错误
  // "host": "https://discfan.net",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/107.0.0.0 Safari/537.36",
  "accept": "text/html"
}

/**
 * 检测是否开放注册
 */
const check = async () => {
  let resp = await axios.get("https://discfan.net/signup.php", {headers: headers})
  let text: string = await resp.data

  if (text.indexOf("自由註冊當前關閉") >= 0) {
    console.log(TAG, "还未开放注册")
    return
  } else if (text.indexOf("password") >= 0) {
    console.log(TAG, "已开放注册，将发送通知提醒")
    await sendNotify(`[青龙] ${TAG}`, "已开放注册，可以去注册了：https://discfan.net/signup.php")
    return
  }

  console.log(TAG, "解析网页内容出错：", text)
  await sendNotify(`[青龙] ${TAG}`, "解析网页内容出错", text)
}

check()
