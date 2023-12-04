/**
 * 执行每日任务
 * 先增加环境变量
 */

// new Env('每日任务')
// cron: 10 0,21 * * *

import startLocTask, {tagHostloc} from "./utils/spider/hostloc/award"
import {pushTGSign} from "./utils/tgpush"
import {TGSender} from "do-utils"

const TAG = "Daily"

// 开始每日任务
const startTask = async () => {
  let msg = ""

  msg += `*${tagHostloc}*:\n`
  let tmp: string
  try {
    const loc = await startLocTask()
    tmp = `${loc}`
  } catch (e) {
    console.log("😢", tagHostloc, "执行任务出错：", e)
    tmp = `执行任务出错：${e}`
  }
  msg += TGSender.escapeMk(tmp)

  await pushTGSign(TAG, "每日任务", msg)
}

startTask()
