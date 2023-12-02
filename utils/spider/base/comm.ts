// 发送消息到 TG 时，时间的格式
export const TOPIC_TIME = "YYYY-mm-dd HH:MM:SS"

const TOPIC_MAX = 100
// 发送到 TG 消息中的帖子的最大长度
export const truncate4tg = (content: string) => {
  return content.length > TOPIC_MAX ? content.substring(0, TOPIC_MAX) + "..." : content
}
