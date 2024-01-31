/**
 * 执行每日任务
 * 注意设置各个任务的`环境变量`
 */

// new Env('每日任务')
// cron: 10 8 * * *

import {parseAxiosErr} from "./utils/comm"
import puppeteer from "puppeteer-core"
import {PupOptions} from "./utils/spider/base/puppeteer/puppeteer"
import {pushTGDaily} from "./utils/push/tgpush"
import {PromiseName} from "./utils/types/result"
import Hostloc from "./utils/spider/hostloc/hostloc"
import HostlocTask from "./utils/spider/hostloc/task"
import MTeam from "./utils/spider/mteam/mteam"

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
  const promises: PromiseName<RetTag, Promise<string>>[] = [{
    tag: Hostloc.TAG,
    promise: HostlocTask.startLocTask(page)
  }, {
    tag: MTeam.TAG,
    promise: MTeam.startTask()
  }]
  const results = await Promise.allSettled(promises.map(p => p.promise))
  for (const [i, result] of results.entries()) {
    if (result.status === "rejected") {
      const err = parseAxiosErr(result.reason)
      console.log("😱 执行失败：", promises[i].tag, err.message, err.stack)
      pushTGDaily(TAG, `${promises[i].tag} 执行失败`, err.message)
      continue
    }

    console.log("🤨 执行结果：", promises[i].tag, result.value)
    pushTGDaily(TAG, `${promises[i].tag} 执行完成`, result.value)
  }

  console.log("🤨", TAG, "已执行完毕")

  await browser.close()
}

startTask()
