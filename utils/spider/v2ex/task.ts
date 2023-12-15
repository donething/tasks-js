// 检测通知
import {mAxios} from "../../http"
import {envTip} from "../base/comm"
import {NotificationResp} from "./types"
import {readJSON} from "../../file"
import {Result} from "../../types/result"

export const TAG = "v2ex"

const noUrl = "https://www.v2ex.com/api/v2/notifications"

// 环境变量的键
const ENV_KEY = "V2EX_TOKEN"

const headers = {
  "Authorization": "Bearer " + process.env[ENV_KEY]
}

// 保存上次检测的的时间戳，避免重复通知
const dbPath = "./db/notifiy_ckecker_v2ex.json"

// 保存的数据
type Data = {
  lastCkeckNo: number
}

// 检测是否有通知
export const ckeckV2exNotifily = async (): Promise<Result<boolean>> => {
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

  // 读取已提示的帖子列表（ID 列表）
  const dbData = readJSON<Data>(dbPath)
  if (!dbData.lastCkeckNo) {
    dbData.lastCkeckNo = 0
  }

  const index = data.result.findIndex(item => item.created > dbData.lastCkeckNo)

  return {tag: TAG, data: index !== -1}
}
