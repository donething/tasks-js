/**
 * 推送 TG 消息
 * 注意：在环境变量中添加键`TG_KEY`，值为"token,chatid"（以英文逗号分隔）
 */

import {TGSender} from "do-utils"

// TG 推送实例
let push: TGSender | undefined = undefined
// 通知频道的 ID
let chatid: string = ""

// 初始化 TG 推送实例
const init = async (): Promise<boolean> => {
  if (!process.env.TG_KEY) {
    console.log("😢 无法推送 TG 消息，请先设置环境变量'TG_KEY'")
    return false
  }

  if (!push) {
    const [token, msgchatid] = process.env.TG_KEY.split(",")
    push = new TGSender(token)
    chatid = msgchatid
  }

  return true
}

// 推送 TG 消息（可 Markdown 格式）
export const pushTGMsg = async (text: string) => {
  if (!(await init()) || !push) {
    return
  }

  const response = await push.sendMessage(chatid, text)

  console.log("响应：", response)
  if (!response.ok) {
    console.log("😱 推送 TG 消息失败：", response.error_code, response.description)
    return
  }

  console.log("😊 推送 TG 消息成功")
}
