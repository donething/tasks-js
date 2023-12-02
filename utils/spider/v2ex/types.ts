// 主题的信息
export interface Item {
  // 标题。如 "[宽带症候群] 安卓 TV 哪个免费 IPTV 播放器好用？"
  title: string
  // 地址。如 "https://www.v2ex.com/t/994843#reply0"
  link: string
  // ID。如 "tag:www.v2ex.com,2023-11-24:/t/994843"
  id: string
  // 发布时间。如 "2023-11-24T06:50:17Z"
  published: string
  // 更新时间。如 "2023-11-24T06:50:17Z"
  updated: string
  // 作者信息
  author: {
    // 用户名。如 "jgh004"
    name: string
    // 用户主页。如 "https://www.v2ex.com/member/jgh004"
    uri: string
  }
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
