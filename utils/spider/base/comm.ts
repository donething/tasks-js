// 发送消息到 TG 时，时间的格式
export const TOPIC_TIME = "YYYY-mm-dd HH:MM:SS"

const TOPIC_MAX = 100
// 发送到 TG 消息中的帖子的最大长度
export const truncate4tg = (content: string) => {
  // 解析 rss 时，可能生成多个空白行，去除
  const str = content.replace(/\s/g, "")

  return str.length > TOPIC_MAX ? str.substring(0, TOPIC_MAX) + "\n..." : str
}

// 在环境变量中增加变量的提示
export const envTip = (keyName: string): string => {
  return `请先设置环境变量"${keyName}"`
}
