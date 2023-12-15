import axios from "axios"
import {CookieJar} from 'tough-cookie'
import {wrapper} from "axios-cookiejar-support"

// 增加属性
declare module 'axios' {
  interface AxiosRequestConfig {
    jar?: CookieJar;
  }

  interface AxiosInstance {
    setCookie: (cookie: string, addr: string) => void
  }
}

// 最大重试次数
const MAX_RETRY = 3

/**
 * axios 自定义的实例
 *
 * 自动处理 Cookie、非200-299 时不报错、本地环境时使用代理
 * @see https://stackoverflow.com/questions/72919223
 */
const client = axios.create({
  // 接受 Cookie
  withCredentials: true,

  // 当响应码 非200-299 时，不作为错误抛出。或者直接不将状态码视作异常的条件
  validateStatus: status => {
    // 只将状态码为 200 到 399 视为成功，其他状态码视为失败
    // return status >= 200 && status < 400
    return true
  },

  // 不要用`proxy`属性，连接到代理时报错 "proxy/http: failed to read http request"
  // axios-cookiejar-supporth 和 httpsAgent 冲突；而 换用 http-cookie-agent 会报上面`proxy`同样的的错误
  // httpsAgent: isQL ? false : new HttpsCookieAgent({}),

  // 自动处理 Cookie
  jar: new CookieJar(),

  // 超时
  timeout: 3000
})

// 添加响应拦截器：增加超时时重试
client.interceptors.response.use((response) => {
  // 对响应数据做一些处理
  return response
}, (error) => {
  // 处理响应错误
  if (error.code === "ECONNABORTED" && error.message.toLowerCase().includes("timeout")) {
    // 重试次数计数器
    let retryCount = error.config.retryCount || 0

    if (retryCount < MAX_RETRY) {
      // 增加重试次数
      retryCount++

      // 更新请求配置
      const config = {
        ...error.config,
        retryCount
      }

      // 重新发送请求
      // return client.request(config)
      // 延迟1秒钟后重新发送请求
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`🤨 开始第 ${retryCount + 1} 次重试`)
          resolve(client.request(config))
        }, 1000) // 1秒钟的延迟
      })
    }
  }

  return Promise.reject(error)
})

/**
 * axios 可自动处理 Cookie
 */
export const mAxios = wrapper(client)

/**
 * 设置 Cookie
 * @param cookie Cookie 字符串。如 "name=Li; age=23"
 * @param addr 地址。如 "https://example.com"
 */
mAxios.setCookie = (cookie: string, addr: string) => {
  if (!mAxios.defaults.jar) {
    // 创建一个 CookieJar
    mAxios.defaults.jar = new CookieJar()
  }

  const items = cookie.split(";")
  for (let item of items) {
    mAxios.defaults.jar.setCookieSync(item, addr, {ignoreError: false})
  }
}

// 用户代理
export const UserAgents = {
  Android: "Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/116.0.0.0 Mobile Safari/537.36",

  Win: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/119.0.0.0 Safari/537.36",

  iOS: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) " +
    "CriOS/99.0.4844.59 Mobile/15E148 Safari/604.1"
}
