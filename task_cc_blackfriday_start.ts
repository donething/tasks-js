/**
 * cloudcone 黑色星期五活动是否已开启
 */

// new Env('cloudcone黑五活动开启')
// cron: */10 * * * * *

import {pushCardMsg, pushTextMsg} from "./utils/push"

const TAG = "CC黑五活动"

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
    console.log("获取活动状态的响应出错：", response.statusText)
    await pushTextMsg(`${TAG} 获取出错`, `响应码有误：\n\n${response.statusText}`)
    return
  }

  const data: CCResp = await response.json()
  if (data.status === 0) {
    console.log("活动还未开启：", JSON.stringify(data))
    return
  }

  console.log("活动已开启：", JSON.stringify(data))
  await pushCardMsg(`${TAG} 已开始`, "活动已开始！",
    "https://app.cloudcone.com/blackfriday", "点击访问")
}

check()