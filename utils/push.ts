import {WXQiYe} from "do-utils"

// 微信推送实例
let wxPush: WXQiYe | undefined = undefined
// 消息频道 ID
let user = ""
let agentid = 0

// 初始化微信推送实例
const initWXPush = async (): Promise<boolean> => {
  if (!process.env.QYWX_KEY) {
    console.log("无法推送消息，企业微信的 KEY 为空。请先设置环境变量'QYWX_KEY'")
    return false
  }

  if (!wxPush) {
    const [corpid, secret, u, id] = process.env.QYWX_KEY.split(",")
    wxPush = new WXQiYe(corpid, secret)
    user = u
    agentid = Number(id)
  }

  return true
}

// 推送微信卡片消息
export const pushCardMsg = async (title: string, description: string, url: string, btnTxt: string) => {
  if (!(await initWXPush()) || !wxPush) {
    return
  }

  let error = await wxPush.pushCard(agentid, title, description, user, url, btnTxt)
  if (error) {
    console.log("推送微信卡片消息失败", error)
    return
  }

  console.log("推送微信卡片消息成功：", title)
}

// 推送微信文本消息
export const pushTextMsg = async (title: string, content: string) => {
  if (!(await initWXPush()) || !wxPush) {
    return
  }

  let error = await wxPush.pushText(agentid, `${title}\n\n${content}`, user)
  if (error) {
    console.log("推送微信文本消息失败", error)
    return
  }

  console.log("推送微信文本消息成功：", title)
}

// 推送微信 Markdown 消息（暂只支持企业微信接收）
export const pushMarkdownMsg = async (content: string) => {
  if (!(await initWXPush()) || !wxPush) {
    return
  }

  let error = await wxPush.pushMarkdown(agentid, content, user)
  if (error) {
    console.log("推送微信 Markdown 消息失败", error)
    return
  }

  console.log("推送微信 Markdown 消息成功")
}