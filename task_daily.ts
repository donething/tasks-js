/**
 * 执行每日任务
 * 注意设置各个任务的`环境变量`
 */

// new Env('每日任务')
// cron: 10 0 * * *

import startLocTask from "./utils/spider/hostloc/task"
import startMtTask from "./utils/spider/mteam/mteam"
import {parseAxiosErr} from "./utils/comm"
import puppeteer from "puppeteer-core"
import {PupOptions} from "./utils/spider/base/puppeteer/puppeteer"
import {pushTGDaily} from "./utils/tgpush"

const TAG = "每日任务"

// 任务返回时的 tag 类型
export type RetTag = "mteam" | "hostloc" | "nodeseek"

// 开始每日任务
const startTask = async () => {
  // 执行任务
  console.log("🤨", TAG, "开始执行")

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch(PupOptions)

  const page = await browser.newPage()

  page.setDefaultTimeout(5 * 1000)

  // 注意调用返回 Promise，而不是传递函数的引用，否则不会运行
  const results = await Promise.allSettled([startMtTask(), startLocTask(page)])
  for (let result of results) {
    if (result.status === "rejected") {
      const err = parseAxiosErr(result.reason)
      console.log("😱 执行失败：", err.message, err.stack)
      pushTGDaily(TAG, "执行失败", err.message)
      continue
    }

    console.log("🤨 执行结果：", result.value.tag, result.value.data)
    pushTGDaily(TAG, `${result.value.tag} 执行完成`, result.value.data)
  }

  console.log("🤨", TAG, "已执行完毕")

  await browser.close()
}

startTask()
