/**
 * 检测网站站内的通知
 * 注意设置各个任务的`环境变量`
 */

import puppeteer from "puppeteer-core"
import {PupOptions} from "./utils/spider/base/puppeteer/puppeteer"
import {parseAxiosErr} from "./utils/comm"
import {ckeckLocNotifily} from "./utils/spider/hostloc/task"
import {ckeckV2exNotifily} from "./utils/spider/v2ex/task"

// new Env('站内通知检测')
// cron: */1 * * * *

// 执行检测
const startCheck = async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch(PupOptions)

  const pageNS = await browser.newPage()
  const pageLoc = await browser.newPage()

  pageNS.setDefaultTimeout(30 * 1000)
  pageLoc.setDefaultTimeout(5 * 1000)

  // 注意调用返回 Promise，而不是传递函数的引用，否则不会运行
  const results = await Promise.allSettled(
    [ckeckLocNotifily(pageLoc), ckeckV2exNotifily()]
  )

  for (let result of results) {
    if (result.status === "rejected") {
      const err = parseAxiosErr(result.reason)
      console.log("😱 执行失败：", err.message, err.stack)
      continue
    }

    console.log("执行结果：", result.value.tag, result.value.data)
  }

  await browser.close()
}

startCheck()
