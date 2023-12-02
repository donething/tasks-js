// 网站名
export type SiteName = "v2ex" | "hostloc" | "nodeseek"

// 提取的主题关键信息
export interface Topic {
  // 网站名
  name: SiteName

  // 帖子 ID。如"123"
  tid: string

  // 标题
  title: string

  // URL
  url: string

  // 作者
  author: string

  // 前几百个字符的内容
  content: string

  // 发布时间
  pub: string
}

// 请求头
export type ReqHeaders = { [key: string]: string }

// 获取帖子时，需要传递的信息
export interface UrlInfo {
  name: SiteName
  // 网址
  url: string
  // 携带的请求头
  headers: ReqHeaders
  // 是否成功获取的标志性文本。如 网站的标题
  check: string
  // 获取帖子的超链接A的选择器。如 "table#threadlisttableid tbody[id^='normalthread'] th.new a.xst"
  selector: string
  // 根据超链接URL，获取帖子的 ID。如 /thread-(\d+)/
  tidReg: RegExp
}

// 需要获取帖子的网站（即需要调用的函数）
export type TopicFunc = (...args: any[]) => Promise<Topic[]>

// 需要获取帖子的任务信息
export type TopicTaskInfo = {
  fun: TopicFunc
  // TopicSite.getTids 需要指定的节点/分区/分区号。如 "tech"、"45"
  node: string
}
