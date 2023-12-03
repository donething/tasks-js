/**
 * 执行每日任务
 * 先增加环境变量
 */

// new Env('每日任务')
// cron: 10 9,21 * * *

import startLocTask, {tagHostloc} from "./utils/spider/hostloc/award"
import {pushTGMsg, pushTGSign} from "./utils/tgpush"

const TAG = "Daily"

// 开始每日任务
const startTask = async () => {
  let msg = ""

  try {
    msg += `> ${tagHostloc}\n`

    const loc = await startLocTask()
    msg += `${loc}\n`
  } catch (e) {
    console.log("😢", tagHostloc, "执行任务出错：", e)
    msg += `执行任务出错：${e}\n`
  }

  await pushTGSign(TAG, "每日任务", msg)
}

startTask()