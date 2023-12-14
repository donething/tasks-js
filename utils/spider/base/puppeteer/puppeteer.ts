import puppeteer, {Page, PuppeteerLaunchOptions, PuppeteerLifeCycleEvent} from "puppeteer-core"
import {isQL} from "../../../utils"

// Puppeteer 选项
export const PupOptions: PuppeteerLaunchOptions = {
  // 先安装 chromium 依赖包
  executablePath: isQL ? "/usr/bin/chromium-browser" : "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: isQL ? "new" : false,
  defaultViewport: {width: 1920, height: 1080},
  args: ["--no-sandbox", "--disabled-setupid-sandbox", "--start-maximized"]
}

/**
 * waitForNavigation 超时而不抛出错误
 *
 * 因为有些页面一直在请求，无法等待完成，所以会超时，此时可以避免抛出错误
 */
export const waitForNavNoThrow = async (page: Page,
                                        waitUntil: PuppeteerLifeCycleEvent = "networkidle0",
                                        timeout = 3000) => {
  try {
    await page.waitForNavigation({waitUntil, timeout})
  } catch (err) {
    // 不抛出错误
  }
}

/**
 * 获取元素的 textContent
 */
export const evalText = async (page: Page, selector: string): Promise<string> => {
  const elem = await page.$(selector)

  if (!elem) {
    throw new Error("元素不存在")
  }

  const text = await page.evaluate(el => el.textContent, elem)

  return text || ""
}
