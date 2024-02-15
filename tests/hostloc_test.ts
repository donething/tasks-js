import {expect} from "chai"
import HostlocTask from "../utils/spider/hostloc/task"

// 加载 .env 文件中的环境变量
require('dotenv').config()

describe('hostloc function test', () => {
  it('hostloc notication check', async () => {
    const result = await HostlocTask.ckNotification()
    console.log("通知地址：", result)
  }).timeout(0)
})
