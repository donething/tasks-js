/**
 * 检测网站站内的通知
 * 注意设置各个任务的`环境变量`
 */
import puppeteer from "puppeteer-core"
import {PupOptions} from "./utils/spider/base/puppeteer/puppeteer"
import {parseAxiosErr} from "./utils/comm"
import {ckeckNotifily} from "./utils/spider/nodeseek/award"

// new Env('站内通知检测')
// cron: 1 * * * *

const startCheck = async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch(PupOptions)

  const page = await browser.newPage()

  page.setDefaultTimeout(60 * 1000)

  // 注意调用返回 Promise，而不是传递函数的引用，否则不会运行
  const results = await Promise.allSettled([ckeckNotifily(page)])
  for (let result of results) {
    if (result.status === "rejected") {
      console.log("😱 执行失败：", parseAxiosErr(result.reason).message, result.reason)
    }
  }

  await browser.close()
}

startCheck()
