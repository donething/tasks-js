import axios from "axios"
import {isQL} from "./utils"

// 用户代理
export const UserAgents = {
  Android: "Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/116.0.0.0 Mobile Safari/537.36",
  Win: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/119.0.0.0 Safari/537.36",
  iOS: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) " +
    "CriOS/99.0.4844.59 Mobile/15E148 Safari/604.1"
}

/**
 * axios 自定义的实例
 */
export const mAxios = axios.create({
  // 传递 Cookie
  withCredentials: true,

  // 当响应码 非200-299 时，不作为错误抛出
  validateStatus: status => {
    // 只将状态码为 200 到 399 视为成功，其他状态码视为失败
    // return status >= 200 && status < 400
    return true
  }
})
