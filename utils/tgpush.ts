/**
 * 推送 TG 消息
 * 注意：在环境变量中添加键`TG_KEY`，值为"token,chatid"（以英文逗号分隔）
 */

import {TGSender} from "do-utils"
import {pushTextMsg} from "./wxpush"

// TG 的 Token、频道 ID
interface TGKey {
  token: string
  // 标准通知
  chatNo: string
  // 新帖的通知
  chatTopic: string
  // 签到的通知
  chatSign: string
}

// TG 消息的键
let tgKey: TGKey = JSON.parse(process.env.TG_KEY || "{}")
// TG 推送实例
let tg: TGSender | undefined = undefined

// 初始化 TG 推送实例
const init = async (): Promise<void> => {
  if (!process.env.TG_KEY) {
    console.log("😢 无法推送 TG 消息，请先设置环境变量'TG_KEY'")
    return
  }

  if (!push) {
    tg = new TGSender(tgKey.token)
    console.log("🤨 已初始化 TG 消息推送")
  }
}

// 推送消息（可 Markdown 格式）
const push = async (text: string, chatid: string) => {
  await init()
  if (!tg) {
    return
  }

  const response = await tg.sendMessage(text, chatid)

  if (!response.ok) {
    console.log("😱 推送 TG 消息失败：", response.error_code, response.description)
    pushTextMsg("推送 TG 消息失败", `${response.error_code}：${response.description}`)
    return
  }

  console.log("😊 推送 TG 消息成功")
}

// 推送通用 TG 消息
export const pushTGMsg = async (text: string) => {
  return push(text, tgKey.chatNo)
}

// 推送新帖的 TG 消息
export const pushTGTopic = async (tag: string, topics: string[]) => {
  return push(`#${tag} 新帖\n\n${topics.join("\n")}\n`
    , tgKey.chatTopic)
}

// 推送签到的 TG 消息
export const pushTGSign = async (tag: string, result: string, tips: string) => {
  return push(
    `#${tag} ${result}\n${tips}`
    , tgKey.chatSign)
}
