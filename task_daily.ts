/**
 * 执行每日任务
 * 注意设置 环境变量
 */

// new Env('每日任务')
// cron: 10 0,21 * * *

import startLocTask from "./utils/spider/hostloc/award"

const TAG = "每日任务"

// 开始每日任务
const startTask = async () => {
  // 执行任务
  console.log("🤨", TAG, "开始执行")

  // await Promise.allSettled([startTask])
  await startLocTask()

  console.log("🤨", TAG, "已执行完毕")
}

startTask()
