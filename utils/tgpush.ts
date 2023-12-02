/**
 * 推送 TG 消息
 * 注意：在环境变量中添加键`TG_KEY`，值为"token,chatid"（以英文逗号分隔）
 */

import {pushTextMsg} from "./wxpush"
import {TGSender} from "do-utils"
import {Topic} from "./spider/types"

interface Token {
  token: string
  chatID: string
}

// TG 的 Token、频道 ID
interface TGKeys {
  // 标准通知
  main: Token,
  // 新帖的通知
  signBot: Token,
  // 签到的通知
  freshPost: Token
}

// TG 消息的键
let tgKey: TGKeys = JSON.parse(process.env.TG_KEY || "{}")

// 推送消息（可 Markdown 格式）
const push = async (text: string, t: Token): Promise<boolean> => {
  if (!process.env.TG_KEY) {
    console.log("😢 无法推送 TG 消息，请先设置环境变量'TG_KEY'")
    return false
  }

  const tg = new TGSender(t.token)

  const response = await tg.sendMessage(t.chatID, text)

  if (!response.ok) {
    console.log("😱 推送 TG 消息失败：", response.error_code, response.description, "：\n", text)
    await pushTextMsg("推送 TG 消息失败", `${response.error_code}：${response.description}`)
    return false
  }

  console.log("😊 推送 TG 消息成功")
  return true
}

// 推送通用 TG 消息
export const pushTGMsg = async (text: string) => {
  return push(text, tgKey.main)
}

// 推送新帖的 TG 消息
export const pushTGTopics = async (tag: string, topics: Topic[]) => {
  const strs = topics.map((t, i) => `${i + 1}\\. *[${TGSender.escapeMk(t.title)}](${TGSender.escapeMk(t.url)})*\n_${TGSender.escapeMk(t.content)}_\n\\#${TGSender.escapeMk(t.name)} \\#${TGSender.escapeMk(t.author)} _${TGSender.escapeMk(t.pub)}_`)
  return push(`\\#${tag} 新帖\n\n${strs.join("\n\n")}\n`, tgKey.freshPost)
}

// 推送每日签到的 TG 消息
export const pushTGSign = async (tag: string, result: string, tips: string) => {
  return push(`\\#${tag} ${result}\n\n${tips}`, tgKey.signBot)
}
