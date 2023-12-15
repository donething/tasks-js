/**
 * 当 v2ex 有 vps 相关的主题时，发送通知
 */

// new Env('V2exVPS新帖')
// cron: */2 * * * *

import notifyTopics, {TaskInfo} from "./utils/topicsFile"
import parseV2exRss from "./utils/spider/v2ex/v2ex"

const TAG = "V2exVPS"

// 任务信息
const taskInfo: TaskInfo = {
  // 需要扫描帖子的网址及节点
  topicTaskInfos: [
    {
      fun: parseV2exRss,
      node: ""
    }
  ],

  // 只匹配 VPS 有关的帖子
  reg: /\b(vps)\b/i,

  // 保存数据的文件路径
  filepath: "./db/v2ex_vps_topics.json",

  // 发送通知时的提示文本
  tag: TAG
}

notifyTopics(taskInfo)
