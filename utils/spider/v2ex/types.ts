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
export interface V2RSS {
  title: string
  subtitle: string
  link: string
  id: string
  updated: string
}
