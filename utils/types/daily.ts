// 调用任务的返回消息
export interface Message {
  ok: boolean
  name: string
  message: string
  err?: Error
}
