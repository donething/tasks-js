/**
 * 推送企业微信消息
 * 注意：在环境变量中添加键`QYWX_KEY`，值为"id,secret,touser,agentid"（以英文逗号分隔）
 */
import {WXQiYe} from "do-utils"

const TAG = "[青龙]"

// 微信推送实例
let push: WXQiYe | undefined = undefined
// 消息频道 ID
let user = ""
let agentid = 0

// 初始化微信推送实例
const init = async (): Promise<boolean> => {
  if (!process.env.QYWX_KEY) {
    console.log("😢 无法推送企业微信消息，请先设置环境变量'QYWX_KEY'")
    return false
  }

  if (!push) {
    const [corpid, secret, u, id] = process.env.QYWX_KEY.split(",")
    push = new WXQiYe(corpid, secret)
    user = u
    agentid = Number(id)
  }

  return true
}

// 推送微信卡片消息
export const pushCardMsg = async (title: string, description: string, url: string, btnTxt: string) => {
  if (!(await init()) || !push) {
    return
  }

  let error = await push.pushCard(agentid, `${TAG} ${title}`, description, user, url, btnTxt)
  if (error) {
    console.log("😱 推送微信卡片消息失败", error)
    return
  }

  console.log("😊 推送微信卡片消息成功：", title)
}

// 推送微信文本消息
export const pushTextMsg = async (title: string, content: string) => {
  if (!(await init()) || !push) {
    return
  }

  let error = await push.pushText(agentid, `${TAG} ${title}\n\n${content}`, user)
  if (error) {
    console.log("😱 推送微信文本消息失败", error)
    return
  }

  console.log("😊 推送微信文本消息成功：", title)
}

// 推送微信 Markdown 消息（暂只支持企业微信接收）
export const pushMarkdownMsg = async (content: string) => {
  if (!(await init()) || !push) {
    return
  }

  let error = await push.pushMarkdown(agentid, content, user)
  if (error) {
    console.log("😱 推送微信 Markdown 消息失败", error)
    return
  }

  console.log("😊 推送微信 Markdown 消息成功")
}
