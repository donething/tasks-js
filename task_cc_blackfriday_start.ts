/**
 * cloudcone 黑色星期五活动是否已开启
 * 使用：需要设置环境变量：
 * "CC_COOKIE"值为 Cookie
 * "CC_TOKEN" 值为 token。可在网页端登录后再控制台执行`window._token`获取（重新登录后旧token会失效）
 */

// new Env('cloudcone黑五活动开启')
// cron: */1 * * * * *

import {pushCardMsg, pushTextMsg} from "./utils/push"
import {request} from "do-utils"

const TAG = "CC黑五活动"

const host = "app.cloudcone.com"
const addr = `https://${host}`

// 活动开始信息 API 的响应
type CCResp = {
  // 为 1 表示活动已开始；为 0 表示还未开始
  status: number
  // 消息
  message: string
  // 具体数据（活动开始后）
  __data: {
    // 被嵌入的 HTML
    html: string
    // 等待时长
    ttr: number
    // VPS 数据
    vps_data: Record<string, VPSInfo>
    // SC 数据
    sc2_data: Record<string, VPSInfo>
  };
}
type VPSInfo = {
  // ID：142
  id: number
  // "bf-r-22-wL13y32N3"
  name: string
  // 数量：2
  cpu: number
  // "1.25 GB"
  ram: string
  // 磁盘（单位 GB）。60
  disk: number
  // 流量。"2 TB"
  bandwidth: string
  // 年费。10.92
  usd_price: number
  // 和 id、name 对应："/vps/142/create?token=bf-r-22-wL13y32N3"
  order_url: string
}

// 检测
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
  const token = process.env.CC_TOKEN
  if (!cookie || !token) {
    console.log("😢 Cookie、Token 为空，无法自动下订单。只发送通知提醒。")
    await pushCardMsg(`${TAG} 已开始`, "活动已开始！", `${addr}/blackfriday`, "点击访问")
    return
  }

  if (Object.keys(data.__data.vps_data).length === 0) {
    console.log("😢 没有需要订购的 VPS：\n", JSON.stringify(data))
    return
  }

  // 订购
  for (const info of Object.values(data.__data.vps_data)) {
    order(cookie, token, info)
  }
}

// 下订单
const order = async (cookie: string, token: string, vpsInfo: VPSInfo) => {
  const title = `【${vpsInfo.name}(${vpsInfo.id})】`

  const data = new FormData()
  data.append('os', "878")
  data.append('hostname', '')
  data.append('contract', 'Y')
  data.append('coupon-apply', '')
  data.append('coupon', '')
  data.append('plan', vpsInfo.id.toString())
  data.append('method', 'provision')
  data.append('_token', token)
  const headers = {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "x-requested-with": "XMLHttpRequest",
    "cookie": cookie,
    "Referer": addr,
    "Referrer-Policy": "strict-origin-when-cross-origin"
  }
  const resp = await request(`${addr}/ajax/vps`, data, {headers})
  const text = await resp.text()

  console.log(`🤨 自动下单 ${title} ${addr}${vpsInfo.order_url}：`, `响应状态 ${resp.status}：\n`, text)
}

// 开始
check()