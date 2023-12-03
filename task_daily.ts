/**
 * 执行每日任务
 * 先增加环境变量
 */

// new Env('每日任务')
// cron: 10 9,21 * * *

import startLocTask from "./utils/spider/hostloc/award"
import {pushTGMsg, pushTGSign} from "./utils/tgpush"

const TAG = "Daily"

// 开始每日任务
const startTask = async () => {
  let msg = ""

  const loc = await startLocTask()
  msg += `${loc}\n\n`

  await pushTGSign(TAG, "每日任务", msg)
}

startTask().catch(err => {
  console.log(TAG, "执行每日任务出错：", err)
  pushTGMsg("执行每日任务出错", err, TAG)
})
