// 账号
export interface User {
  email: string
  psw: string
}

// 存储到文件的数据
export interface FData {
  // 已订购过的账号（邮箱），一号限购一台
  hadOrder: string[]
}
