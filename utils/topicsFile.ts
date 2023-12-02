/**
 * 扫描网站并通知有关的新帖
 */
import {Topic, TopicTaskInfo} from "./spider/types"
import {readJSON, writeJSON} from "./file"
import {pushTGTopics} from "./tgpush"
import {TGSender} from "do-utils"

// 需要保存到文件的数据结构
export interface TopicsFile {
  // 主题信息的列表
  topics: Topic[]
}

// 扫描并通知有关的新帖的任务信息
export type TaskInfo = {
  // 数据文件的保存路径。如 ""./db/cc_low_price.json""
  filepath: string
  // 需要获取的网站及节点的信息
  topicTaskInfos: TopicTaskInfo[]
  // 用来判断帖子标题是否需要通知。如 /\b(cc|cloudcone)\b/i
  reg: RegExp
  // 发送通知时的提示文本。如 "CC有售"
  tag: string
}

/**
 * 扫描并通知有关的新帖
 */
const notifyTopics = async (taskInfo: TaskInfo) => {
  // 读取已提示的帖子列表（ID列表）
  const data = readJSON<TopicsFile>(taskInfo.filepath)
  if (!data.topics) {
    data.topics = []
  }

  // 临时保存，需要发送通知，每一项表示一个主题
  let topicStrList: string[] = []

  // 读取帖子列表
  let i = 1
  for (const task of taskInfo.topicTaskInfos) {
    const topics = await task.fun(task.node)

    for (const t of topics) {
      // 只匹配指定帖子
      if (!taskInfo.reg.test(t.title)) {
        console.log(`😒 跳过帖子：`, t.title, "\n  ", t.url, "\n")
        continue
      }
      // 已通知过帖子
      if (data.topics.find(item => item.name === t.name && item.tid === t.tid)) {
        console.log(`😂 已通知过：`, t.title, "\n  ", t.url, "\n")
        continue
      }

      console.log(`😊 通知新帖：`, t.title, "\n  ", t.url, "\n")
      topicStrList.push(`${i}\\.[${TGSender.escapeMk(t.title)}](${TGSender.escapeMk(t.url)})\n\n${TGSender.escapeMk(t.content)}\n\n#${t.name} #${TGSender.escapeMk(t.author)} ${t.pub}`)
      data.topics.push(t)

      i++
    }
  }

  // 没有新帖
  if (topicStrList.length === 0) {
    console.log("\n😪 此次刷新没有相关的新帖")
    return
  }

  await pushTGTopics(taskInfo.tag, topicStrList)

  writeJSON(taskInfo.filepath, data)
}

export default notifyTopics
