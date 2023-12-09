import {AxiosError} from "axios"

export const TAG = "青龙"

// 如果是 AxiosError 类型的错误，提取 URL 到 message 中
export const parseAxiosErr = (err: any): Error => {
  if (err instanceof AxiosError && err.config) {
    return {...err, message: `${err.message} ${err.config.url}`}
  }

  return err
}
