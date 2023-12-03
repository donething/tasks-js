import {PuppeteerLaunchOptions} from "puppeteer-core"
import {isQL} from "../../utils"

// 发送消息到 TG 时，时间的格式
export const TOPIC_TIME = "YYYY-mm-dd HH:MM:SS"

const TOPIC_MAX = 100
// 发送到 TG 消息中的帖子的最大长度
export const truncate4tg = (content: string) => {
  const str = content.trim()

  return str.length > TOPIC_MAX ? str.substring(0, TOPIC_MAX) + "\n..." : str
}

// Puppeteer 选项
export const PupOptions: PuppeteerLaunchOptions = {
  // 先安装 chromium 依赖包
  executablePath: isQL ? "/usr/bin/chromium-browser" : "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  defaultViewport: {width: 1920, height: 1080},
  args: ["--no-sandbox", "--disabled-setupid-sandbox"]
}
