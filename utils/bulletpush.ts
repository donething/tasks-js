import {mAxios} from "./http"
import {Topic} from "./spider/types"
import pushWxMsg from "./wxpush"

const TAG = "pushbullet"

// 消息类型
type MsgType = "note" | "link" | "file"

// 发送消息成功的响应
interface RespOK {
  active: boolean
  iden: string
  created: number
  modified: number
  type: MsgType
  dismissed: boolean
  direction: string
  sender_iden: string
  sender_email: string
  sender_email_normalized: string
  sender_name: string
  receiver_iden: string
  receiver_email: string
  receiver_email_normalized: string
  title: string
  body: string
  url?: string
}

// 发送消息失败的响应
interface RespErr {
  error_code: string    // 如 ""invalid_param""
  error: {
    code: string        // 如 ""invalid_param""
    type: string        // 如 "invalid_request"
    message: string     // 如 ""The param 'type' has an invalid value.""
    param: string       // 如 "type"
    cat: string         // 如  ">:3"
  }
}

// 推送 token
interface PushToken {
  token: string
  channels: {
    newTopics: string
  }
}

// 推送地址
const pushUrl = "https://api.pushbullet.com/v2/pushes"

const pushToken: PushToken = JSON.parse(process.env.PUSHBULLET_TOKEN || "{}")

/**
 * pushbullet 推送消息
 * @param title 标题
 * @param body 内容
 * @param url 链接
 * @param channel_tag 频道标签，存在则推送到频道。如 "topics"
 */
const pushBullet = async (title: string, body: string, url?: string, channel_tag?: string): Promise<boolean> => {
  if (!process.env.PUSHBULLET_TOKEN) {
    console.log("😢", TAG, "请先设置环境变量'PUSHBULLET_TOKEN'")
    return false
  }

  // 发送
  const data = {
    title,
    body,
    url,
    channel_tag,
    type: url ? "link" : "note"
  }

  const headers = {
    "Access-Token": pushToken.token
  }
  const resp = await mAxios.post(pushUrl, data, {headers})
  const obj: RespOK & RespErr = resp.data

  // 推送失败
  if (obj.error_code) {
    console.log("😱", TAG, "推送消息失败：", obj.error.code, obj.error.message)
    await pushWxMsg(`${obj.error.code}：${obj.error.message}\n\n"${title}"`, "推送 Pushbullet 消息失败")
    return false
  }

  console.log("😊", TAG, `推送消息成功："${title}"`)
  return true
}

// 推送新帖
export const pushBulletTopic = async (tag: string, t: Topic) => {
  return pushBullet(`[${tag}] ${t.title}`, t.content, t.url, pushToken.channels.newTopics)
}

export default pushBullet
