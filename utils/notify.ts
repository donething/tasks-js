/**
 * 扫描网站并通知有关的新帖
 */
import {Topic, TopicTaskInfo} from "./spider/types"
import {readJSON, writeJSON} from "./file"
import {isQL} from "./utils"
import {parseAxiosErr} from "./comm"
import {pushBulletTopic} from "./push/bulletpush"
import {pushTGMsg} from "./push/tgpush"

// 需要保存到文件的数据结构
export interface Notify {
  // 主题信息的列表
  topics: Topic[]
}

// 扫描并通知有关的新帖的任务信息
export type TaskInfo = {
  // 数据文件的保存路径。如 BACKUPS + "/cc_low_price.json"
  filepath: string
  // 需要获取的网站及节点的信息
  topicTaskInfos: TopicTaskInfo[]
  // 发送通知时的提示文本。如 "CC有售"
  tag: string
}

/**
 * 扫描并通知有关的新帖
 */
const notifyTopics = async (taskInfo: TaskInfo) => {
  // 读取已提示的帖子列表（ID 列表）
  const data = readJSON<Notify>(taskInfo.filepath, {topics: []})

  // 临时保存已发送的帖子
  const hadSend: Topic[] = []
  // 异步执行所有任务
  const tasks = taskInfo.topicTaskInfos.map(async task => {
    const topics = await task.fun(task.node)

    !isQL && console.log(`[${task.tag}]获取的主题：\n`, topics)

    for (const t of topics) {
      // 只匹配指定帖子
      if (!task.needNotify(t)) {
        console.log(`😒 跳过帖子：`, t.title, "\n  ", t.url, "\n")
        continue
      }

      // 已通知过帖子
      if (data.topics.find((item) => item.tag === t.tag && item.tid === t.tid)) {
        console.log(`😂 已通知过：`, t.title, "\n  ", t.url, "\n")
        continue
      }

      console.log(`😊 通知新帖：`, t.title, "\n  ", t.url, "\n")
      // const ok = await pushTGTopic(taskInfo.tag, t)
      // const ok = await pushWxMsg(`${t.title}\n\n${t.url}`, `${taskInfo.tag} ${t.title}`)
      const ok = await pushBulletTopic(taskInfo.tag, t)
      if (!ok) {
        continue
      }

      // 保存到文件时，不记录 content 属性
      const tNoContent = {...t, content: ""}
      hadSend.push(tNoContent)
    }
  })

  // 等待所有任务执行完毕
  const results = await Promise.allSettled(tasks)
  for (const [i, result] of results.entries()) {
    if (result.status === "rejected") {
      const err = parseAxiosErr(result.reason)
      console.log(`😱 执行失败 ${taskInfo.tag}`, taskInfo.topicTaskInfos[i].tag, err.message, err.stack)
      pushTGMsg("执行失败", err.message, taskInfo.tag + " " + taskInfo.topicTaskInfos[i].tag)
    }
  }

  if (hadSend.length === 0) {
    console.log("🤨 本次没有发送相关的新帖")
    return
  }

  // 保存文件
  data.topics.push(...hadSend)
  writeJSON(taskInfo.filepath, data)

  console.log("😊 已完成执行任务")
}

export default notifyTopics
