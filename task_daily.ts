/**
 * 执行每日任务
 * 注意设置各个任务的`环境变量`
 */

// new Env('每日任务')
// cron: 10 0 * * *

import startLocTask from "./utils/spider/hostloc/award"
import startMtTask from "./utils/spider/mteam/mteam"
import {parseAxiosErr} from "./utils/comm"

const TAG = "每日任务"

// 开始每日任务
const startTask = async () => {
  // 执行任务
  console.log("🤨", TAG, "开始执行")

  // 注意调用返回 Promise，而不是传递函数的引用，否则不会运行
  const results = await Promise.allSettled([startMtTask(), startLocTask()])
  for (let result of results) {
    if (result.status === "rejected") {
      console.log("😱 执行失败：", parseAxiosErr(result.reason).message)
    }
  }

  console.log("🤨", TAG, "已执行完毕")
}

startTask()
