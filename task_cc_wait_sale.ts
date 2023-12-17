/**
 * 当有人出售 CC VPS 时，发送通知
 */

// new Env('CC有售')
// cron: */10 * * * * *

import notifyTopics, {TaskInfo} from "./utils/notify"
import {parseLocSaleLJ} from "./utils/spider/hostloc/hostloc"
import parseNSRss from "./utils/spider/nodeseek/nodeseek"

const TAG = "CC有售"

// 任务信息
const taskInfo: TaskInfo = {
  // 需要扫描帖子的网址及节点
  topicTaskInfos: [
    {
      fun: parseLocSaleLJ,
      // VPS 综合讨论区
      node: "45"
    },
    {
      fun: parseNSRss,
      // （首页）所有新帖
      node: ""
    }
  ],

  // 只匹配 cloudcone 有关的帖子
  reg: /\b(cc)(?!s)|(cloudcone)\b/i,

  // 保存数据的文件路径
  filepath: "./db/cc_wait_sale.json",

  // 发送通知时的提示文本
  tag: TAG,
}

notifyTopics(taskInfo)
