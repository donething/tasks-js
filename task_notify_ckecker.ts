/**
 * 检测网站站内的通知
 * 注意设置各个任务的`环境变量`
 */

import puppeteer from "puppeteer-core"
import {PupOptions} from "./utils/spider/base/puppeteer/puppeteer"
import {parseAxiosErr} from "./utils/comm"
import * as hostloc from "./utils/spider/hostloc/task"
import * as v2ex from "./utils/spider/v2ex/task"
import {pushTGMsg} from "./utils/tgpush"
import {pushBulletNotify} from "./utils/bulletpush"
import {readJSON, writeJSON} from "./utils/file"
import {PromiseName} from "./utils/types/result"

// new Env('站内通知检测')
// cron: */3 * * * *

const TAG = "站内通知"

// 保存上次检测的的时间戳，避免重复通知
const dbPath = "./db/notify_ckecker.json"

// 任务返回时的 tag 类型
export type RetTag = "v2ex" | "hostloc" | "nodeseek"
// 任务返回时的 data 类型
export type RetPayload = { url: string, extra?: any }

// 保存到文件的数据
type FData = {
  v2ex: Site
  hostloc: Site
  nodeseek: Site
}
type Site = {
  // 已发送通知。当已发送通知时要设为true
  // 用于判断，检测到本次有新通知时，如果此值为true则不发送重复通知；
  // 检测到没有新通知，要设为 false，以便下次检测做判断
  hadNotify?: boolean
  // 额外需要保存的数据。v2ex中要保存记录上次发送的通知ID（因为API中通知没有“未读”属性）
  // 传递参数时，接收端不会判断类型
  data?: any
}

// 执行检测
const startCheck = async () => {
  // 读取已提示的帖子列表（ID 列表）
  let fData = readJSON<FData>(dbPath, {v2ex: {}, hostloc: {}, nodeseek: {}})

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch(PupOptions)

  // const pageNS = await browser.newPage()
  const pageLoc = await browser.newPage()

  // pageNS.setDefaultTimeout(30 * 1000)
  pageLoc.setDefaultTimeout(5 * 1000)

  // 注意调用返回 Promise，而不是传递函数的引用，否则不会运行
  const promises: PromiseName<RetTag, Promise<RetPayload>>[] = [{
    tag: hostloc.TAG,
    promise: hostloc.ckNotifily(pageLoc)
  }, {
    tag: v2ex.TAG,
    promise: v2ex.ckNotifily(fData.v2ex.data)
  }]
  const results = await Promise.allSettled(promises.map(p => p.promise))

  for (const [i, result] of results.entries()) {
    if (result.status === "rejected") {
      const err = parseAxiosErr(result.reason)
      console.log("😱 执行失败：", promises[i].tag, err.message, err.stack)
      pushTGMsg("执行失败", err.message, `${TAG} ${promises[i].tag}`)
      continue
    }

    // 根据 data 判断是否有新通知
    if (result.value.url) {
      if (fData[promises[i].tag].hadNotify) {
        console.log("😂", promises[i].tag, "有新通知，但已发送过通知，此次不再发送")
        continue
      }

      console.log("😊", promises[i].tag, "有新通知", result.value.url)
      pushBulletNotify(`${TAG} ${promises[i].tag}`, "有新通知", result.value.url)
      fData[promises[i].tag].hadNotify = true

      if (result.value.extra) {
        fData[promises[i].tag].data = result.value.extra
      }
    } else {
      console.log("😪", promises[i].tag, "没有新通知")
      fData[promises[i].tag].hadNotify = false
    }
  }

  // 保存文件
  writeJSON(dbPath, fData)

  console.log("🤨", "已执行完毕")

  await browser.close()
}

startCheck()
