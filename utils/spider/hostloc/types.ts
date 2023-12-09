// RSS 帖子的信息
export interface Item {
  // 标题。如 "搭了个二级域名分发系统玩玩"
  title: string
  // 链接。如 "https://hostloc.com/thread-1243759-1-1.html"
  link: string
  // 内容。如 "不知道搭什么，搭了个二级域名分发系统玩玩 不接受违规站点，仅供测试，大佬勿喷！ 注册赠送2积分，进群扣群主..."
  description: string
  // 所在的分区。如 "美国VPS综合讨论"
  category: string
  // 作者。如 "文心小助手"
  author: string
  // 发布日期。如 "Sat, 02 Dec 2023 17:40:14 +0000"
  pubDate: string
}

// RSS
export interface LocRSS {
  title: string;
  link: string;
  description: string;
  copyright: string;
  generator: string;
  lastBuildDate: string;
  ttl: number;
  image: {
    url: string;
    title: string;
    link: string;
  };
  items: Item[];
}

// https://hostloc.mjj.sale/
export interface LocSaleLJ {
  new_data: LocSaleLJItem[][]
}

export interface LocSaleLJItem {
  主题ID: string
  主题: string
  发布者: string
  发布者链接: string
  发布时间: string
  主题内容: string[] | string
  主题链接: string
}
