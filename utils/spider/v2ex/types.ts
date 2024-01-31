// 主题的信息
export interface Item {
  // 标题。如 "[宽带症候群] 安卓 TV 哪个免费 IPTV 播放器好用？"
  title: string
  // 地址。如 "https://www.v2ex.com/t/994843#reply0"
  link: string
  // ID。如 "tag:www.v2ex.com,2023-11-24:/t/994843"
  id: string
  // 发布时间。如 "2023-11-24T06:50:17Z"
  pubDate: string
  // 作者信息。如 "jgh004"
  author: string
  // 内容。如 "<p>看到 windows</p>"
  content: string
}

// RSS 信息
export interface RSS {
  title: string
  subtitle: string
  link: string
  id: string
  updated: string
}


// 最新通知的响应
export interface NotificationResp {
  success: boolean
  message: string
  result: Notification[]
}

export interface Notification {
  // 消息 ID
  id: number
  // 发表回复的用户的 ID
  member_id: number
  // 收到消息提醒的用户 ID
  for_member_id: number
  // 含主题标题、链接等信息的 HTML 超链接
  text: string
  // 回复内容
  payload: string
  // 回复内容。推荐这个
  payload_rendered: string
  // 回复时间戳（秒）
  created: number
  member: {
    username: string
  }
}
