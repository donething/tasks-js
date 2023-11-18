/**
 * cloudcone 黑色星期五活动是否已开启
 */

// new Env('cloudcone黑五活动开启')
// cron: 1 * * * *

const {sendNotify} = require("./utils/sendNotify")

// API 的响应
type CCResp = {
  status: number
  message: string
  __data: {
    html: string
    ttr: number
    vps_data: boolean
    sc2_data: boolean
  }
}

const check = async () => {
  const response = await fetch('https://app.cloudcone.com/blackfriday/offers')
  if (!response.ok) {
    console.log("活动状态的响应出错：", response.statusText)
    await sendNotify("[青龙] CC黑五", `活动状态的响应出错：${response.statusText}`)
    return
  }

  const data: CCResp = await response.json()
  if (data.status === 0) {
    console.log("活动还未开启：", data.message)
    return
  }

  console.log("活动已开启：", data.message)
  await sendNotify("[青龙] CC黑五", "活动已开启，网址：https://app.cloudcone.com/blackfriday")
}

check()