// 检测通知
import {mAxios} from "../../http"
import {envTip} from "../base/comm"
import {NotificationResp} from "./types"
import {Result} from "../../types/result"
import {RetPayload, RetTag} from "../../../task_notify_ckecker"

export const TAG = "v2ex"

const noUrl = "https://www.v2ex.com/api/v2/notifications"

// 环境变量的键
const ENV_KEY = "V2EX_TOKEN"

const headers = {
  "Authorization": "Bearer " + process.env[ENV_KEY]
}

// 检测是否有通知
export const ckeckV2exNotifily = async (lastCk: number): Promise<Result<RetTag, RetPayload>> => {
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

  const index = data.result.findIndex(item => item.created > lastCk)
  if (index === -1) {
    return {tag: TAG, data: {url: ""}}
  }

  return {tag: TAG, data: {url: "https://v2ex.com/notifications", extra: data.result[index].created}}
}
