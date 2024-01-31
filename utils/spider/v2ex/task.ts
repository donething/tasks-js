// 检测通知
import {mAxios} from "../../http"
import {envTip} from "../base/comm"
import {NotificationResp} from "./types"
import {RetPayload} from "../../../task_notify_ckecker"

export const TAG = "v2ex"

const noUrl = "https://www.v2ex.com/api/v2/notifications"

// 环境变量的键
const ENV_KEY = "V2EX_TOKEN"

const headers = {
  "Authorization": "Bearer " + process.env[ENV_KEY]
}

// 检测是否有通知
export const ckNotification = async (lastCk: number): Promise<RetPayload> => {
  if (!process.env[ENV_KEY]) {
    console.log("😢", TAG, envTip(ENV_KEY))
    throw Error(`${TAG} ${envTip(ENV_KEY)}`)
  }

  const resp = await mAxios.get(noUrl, {headers})
  const data: NotificationResp = resp.data

  if (!data.success) {
    console.log(TAG, "获取最新通知失败：", data.message)
    throw Error(`${TAG} 获取最新通知失败：${data.message}`)
  }

  const index = data.result.findIndex(item => item.created > (lastCk || 0))
  if (index === -1) {
    return {url: ""}
  }

  return {url: "https://v2ex.com/notifications", extra: data.result[index].created}
}
