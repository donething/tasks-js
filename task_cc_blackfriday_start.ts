/**
 * cloudcone 黑色星期五活动是否已开启
 * 使用：需要设置环境变量"CC_COOKIE"值为 Cookie
 */

// new Env('cloudcone黑五活动开启')
// cron: */10 * * * * *

import {pushCardMsg, pushTextMsg} from "./utils/push"
import {request} from "do-utils"

const TAG = "CC黑五活动"

const host = "app.cloudcone.com"
const addr = `https://${host}`

// API 的响应
type CCResp = {
  status: number
  message: string
  __data: {
    html: string
    vps_data: Record<string, VPSInfo>
    sc2_data: Record<string, VPSInfo>
  };
}

type VPSInfo = {
  id: number
  name: string
  cpu: number
  ram: string
  disk: number
  bandwidth: string
  usd_price: number
  order_url: string
}

const check = async () => {
  const response = await fetch(`${addr}/blackfriday/offers`)
  if (!response.ok) {
    console.log("😱 获取活动状态的响应出错：", response.statusText)
    await pushTextMsg(`${TAG} 获取出错`, `响应码有误：\n\n${response.statusText}`)
    return
  }

  const data: CCResp = await response.json()
  if (data.status === 0) {
    console.log("😪 活动还未开启：", JSON.stringify(data))
    return
  }

  console.log("😊 活动已开启：", data.message)
  const cookie = process.env.CC_COOKIE

  if (!cookie) {
    console.log("😢 Cookie 为空，无法自动下订单。只发送通知提醒。")
    await pushCardMsg(`${TAG} 已开始`, "活动已开始！", `${addr}/blackfriday`, "点击访问")
    return
  }

  const vpsInfos = Object.keys(data.__data.vps_data)
  if (vpsInfos.length === 0) {
    console.log("😢 没有需要订购的 VPS：\n", JSON.stringify(data))
    return
  }

  await order(cookie, data.__data.vps_data[vpsInfos[0]])
}

// 下订单
const order = async (cookie: string, vpsInfo: VPSInfo) => {
  const orderAddr = `${addr}/vps/${vpsInfo.id}/create?token=${vpsInfo.name}`
  console.log(`🤨 开始订购 【${vpsInfo.name}】：${orderAddr}`)
  const response = await fetch(orderAddr)
  const htmlText = await response.text()

  // 使用正则表达式来从文本中提取 _token 的值
  const tokenMatch = htmlText.match(/var\s+_token.+?"(.+?)"/)
  if (!tokenMatch || !tokenMatch[1]) {
    console.log("😱 获取 token 失败，无法在网页中匹配到'_token'：", htmlText)
    return
  }

  let token = tokenMatch[1]
  console.log(`🤨 提取到的 Token："${token}"`)
  // 发现 token 是固定值，没有获取到时（此时为 null）设置
  if (token === "null") {
    console.log("😢 token 为空，将使用默认值")
    token = "3g787lYC"
  }
  const data = new FormData()
  data.append('os', "878")
  data.append('hostname', '')
  data.append('contract', 'Y')
  data.append('coupon-apply', '')
  data.append('coupon', '')
  data.append('plan', '138')
  data.append('method', 'provision')
  data.append('_token', token)
  const headers = {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "x-requested-with": "XMLHttpRequest",
    "cookie": cookie,
    "Referer": addr,
    "Referrer-Policy": "strict-origin-when-cross-origin"
  }
  const orderResp = await request(`${addr}/ajax/vps`, data, {headers})
  const orderText = await orderResp.text()

  console.log("🤨 自动下订单：", orderText)
}

check()