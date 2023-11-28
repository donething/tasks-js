/**
 * 推送 TG 消息
 * 注意：在环境变量中添加键`TG_KEY`，值为"token,chatid"（以英文逗号分隔）
 */

import {TGSender} from "do-utils"

// TG 的 Token
interface TGKey {
  token: string
  // 标准通知
  chatNo: string
  // 新帖的通知
  chatTopic: string
}

// TG 推送实例
let tg: TGSender | undefined = undefined
// 通知频道的 ID
let tgKey: TGKey

// 初始化 TG 推送实例
const init = async (): Promise<boolean> => {
  if (!process.env.TG_KEY) {
    console.log("😢 无法推送 TG 消息，请先设置环境变量'TG_KEY'")
    return false
  }

  if (!push) {
    tgKey = JSON.parse(process.env.TG_KEY)
    tg = new TGSender(tgKey.token)
  }

  return true
}

// 推送消息（可 Markdown 格式）
const push = async (text: string, chatid: string) => {
  if (!(await init()) || !tg) {
    return
  }

  const response = await tg.sendMessage(text, chatid)

  if (!response.ok) {
    console.log("😱 推送 TG 消息失败：", response.error_code, response.description)
    return
  }

  console.log("😊 推送 TG 消息成功")
}

// 推送通用 TG 消息
export const pushTGMsg = async (text: string) => {
  return push(text, tgKey.chatNo)
}

// 推送新帖的 TG 消息
export const pushTopicMsg = async (tag: string, topics: string[]) => {
  return push(`#${tag} 新帖\n\n${topics.join("\n")}\n`, tgKey.chatTopic)
}
