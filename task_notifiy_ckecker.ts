/**
 * 检测网站站内的通知
 * 注意设置各个任务的`环境变量`
 */

import puppeteer from "puppeteer-core"
import {PupOptions} from "./utils/spider/base/puppeteer/puppeteer"
import {parseAxiosErr} from "./utils/comm"
import {ckeckLocNotifily} from "./utils/spider/hostloc/task"
import {ckeckV2exNotifily} from "./utils/spider/v2ex/task"
import {pushTGMsg} from "./utils/tgpush"
import {pushBulletNotify} from "./utils/bulletpush"

// new Env('站内通知检测')
// cron: */3 * * * *

const TAG = "站内通知"

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
      pushTGMsg("执行失败", err.message, TAG)
      continue
    }

    // 根据 data 判断是否有新通知
    if (result.value.data) {
      console.log("😊 有新通知", result.value.tag, result.value.data)
      pushBulletNotify(TAG, result.value.tag, result.value.data)
    } else {
      console.log("😪", TAG, result.value.tag, "没有新通知")
    }
  }

  console.log("🤨", TAG, "已执行完毕")

  await browser.close()
}

startCheck()
