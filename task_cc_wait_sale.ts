/**
 * 当有人出售 CC VPS 时，发送通知
 */

// new Env('CC有售')
// cron: */30 * * * * *

import notifyTopics, {TaskInfo} from "./utils/topicsFile"
import Nodeseek from "./utils/spider/nodeseek"
import Hostloc from "./utils/spider/hostloc"

// 任务信息
const taskInfo: TaskInfo = {
  // 需要扫描帖子的网址及节点
  topicTaskInfos: [
    {
      Site: Hostloc,
      // VPS综合讨论区
      node: "45"
    },
    {
      Site: Nodeseek,
      // （首页）所有新帖
      node: ""
    }
  ],

  // 只匹配 cloudcone 有关的帖子
  reg: /\b(cc|cloudcone)\b/i,

  // 保存数据的文件路径
  filepath: "./db/cc_low_price.json",

  // 发送通知时的提示文本
  tag: "CC有售",
}

notifyTopics(taskInfo)
