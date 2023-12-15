/**
 * 推送 TG 消息
 * 注意：在环境变量中添加键`TG_KEY`，值为"token,chatid"（以英文逗号分隔）
 */

import {TGSender} from "do-utils"
import {Topic} from "./spider/types"
import pushWxMsg from "./wxpush"

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

// 推送消息。需要自行转义 Markdown v2
const push = async (title: string, content: string, t: Token): Promise<boolean> => {
  if (!process.env.TG_KEY) {
    console.log("😢 无法推送 TG 消息，请先设置环境变量'TG_KEY'")
    return false
  }

  const tg = new TGSender(t.token)

  const response = await tg.sendMessage(t.chatID, `${title}\n\n${content}`)

  if (!response.ok) {
    console.log("😱 推送 TG 消息失败：", response.error_code, response.description, `\n\n${title}：\n\n${content}`)
    await pushWxMsg(`${response.error_code}：${response.description}\n\n"${title}"`, "推送 TG 消息失败")
    return false
  }

  console.log(`😊 推送 TG 消息成功："${title}"`)
  return true
}

/**
 * 推送普通 TG 消息
 * @param title 标题。如 "京豆签到"
 * @param content 消息
 * @param tag 标签。用于 TG 中用井号分类。如 "jd"
 */
export const pushTGMsg = async (title: string, content: string, tag = "") => {
  const caption = (tag ? `\\#${TGSender.escapeMk(tag)} ` : "") + `${TGSender.escapeMk(title)}`
  return push(caption, TGSender.escapeMk(content), tgKey.main)
}

/**
 * 推送新帖的 TG 消息
 * @param tag 标签。如 "v2ex"
 * @param t 主题信息
 */
export const pushTGTopic = async (tag: string, t: Topic) => {
  const topicStr = `*[${TGSender.escapeMk(t.title)}](${TGSender.escapeMk(t.url)})*\n\n\\#${TGSender.escapeMk(t.name)} \\#${TGSender.escapeMk(t.author || "[作者未知]")} _${TGSender.escapeMk(t.pub || "[日期未知]")}_`
  return push(`\\#${TGSender.escapeMk(tag)} 新帖`, topicStr, tgKey.freshPost)
}

/**
 * 推送每日任务执行结果的 TG 消息。需要自行转义 Markdown v2
 * @param tag 标签。如 "daily"
 * @param result 成功或失败。如 "签到失败"
 * @param tips 消息内容
 */
export const pushTGDaily = async (tag: string, result: string, tips: string) => {
  return push(`\\#${TGSender.escapeMk(tag)} ${TGSender.escapeMk(result)}`, TGSender.escapeMk(tips), tgKey.signBot)
}
