// 帖子的信息
export type Item = {
  // 标题。如 "（已出）RN 第四波，100出"
  title: string
  // 内容
  description: string
  // 地址：。如 "https://www.nodeseek.com/post-44076-1"
  link: string
  // ID。如 "44076"
  guid: string
  // 所属的节点。如 "tech"
  category: string
  // 作者。如 "a1195992737"
  creator: string
  // 发布时间。如 "Sat, 02 Dec 2023 16:24:07 GMT"
  pubDate: string
}

// RSS
export type NSRss = {
  title: string
  description: string
  link: string
  image: {
    url: string
    title: string
    link: string
  }
  generator: string
  lastBuildDate: string
  atomLink: {
    href: string
    rel: string
    type: string
  }
  pubDate: string
  copyright: string
  language: string
  managingEditor: string
  webMaster: string
  ttl: number
  category: string[]
  items: Item[]
}
