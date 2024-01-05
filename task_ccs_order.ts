/**
 * 订购 CCS 的 VPS
 */
// new Env('订购CCS')
// cron: */3 * * * * *

import CCS from "./utils/vpsgrab/ccs/ccs"
import {User} from "./utils/vpsgrab/ccs/types"

// 环境变量的键
const ENV_KEY = "CCS_ORDER_EMAIL_PSW"

// 执行
const startTask = async () => {
  if (!process.env[ENV_KEY]) {
    console.log(`请添加环境变量'${ENV_KEY}'，值为"邮箱,密码"，注意英文逗号。可用英文分号";"分隔多个账号，每号限购一台`)
    return
  }

  const accounts = process.env[ENV_KEY].split(";")
  const users: User[] = accounts.map(accountStr => {
    // 处理密码可能包含分隔符","的情况
    const [email, ...pswList] = accountStr.split(",")
    return {email, psw: pswList.join(",")}
  })

  await CCS.startOrder(users)
}

startTask()
