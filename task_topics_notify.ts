/**
 * 当有人发布指定内容的帖子时，发送通知
 */

// new Env('新帖相关')
// cron: */30 * * * * *

import notifyTopics, {TaskInfo} from "./utils/notify"
import {Root} from "./utils/comm"
import Hostloc from "./utils/spider/hostloc/hostloc"
import Nodeseek from "./utils/spider/nodeseek/nodeseek"
import V2ex from "./utils/spider/v2ex/v2ex"

const TAG = "新帖相关"

// 任务信息
const taskInfo: TaskInfo = {
  // 需要扫描帖子的网址及节点
  topicTaskInfos: [
    {
      tag: Hostloc.TAG,
      fun: Hostloc.parseSaleLJ,
      // 只匹配 cloudcone 有关的帖子
      needNotify: t => /\b(cc)(?!s)|(cloudcone)\b/i.test(t.title),
      // VPS 综合讨论区
      node: "45"
    },
    {
      tag: Nodeseek.TAG,
      fun: Nodeseek.parseRss,
      needNotify: t => t.category === "trade",
      // （首页）所有新帖
      node: ""
    },
    {
      tag: V2ex.TAG,
      fun: V2ex.parseRss,
      needNotify: t => /\b(vps)\b/i.test(t.title),
      node: ""
    }
  ],

  // 保存数据的文件路径
  filepath: Root + "/topics_notify.json",

  // 发送通知时的提示文本
  tag: TAG,
}

notifyTopics(taskInfo)
