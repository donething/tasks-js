import {expect} from "chai"
import pushBullet from "../utils/bulletpush"

// 加载 .env 文件中的环境变量
require('dotenv').config()

describe('pushBullet function test', () => {
  it('pushBullet note should be true', async () => {
    const result = await pushBullet("文本消息标题", "文本消息内容")
    console.log(result)
    expect(result).to.true
  }).timeout(0)

  it('pushBullet link should be true', async () => {
    const result = await pushBullet("链接消息标题", "链接消息内容", "https://baidu.com")
    console.log(result)
    expect(result).to.true
  }).timeout(0)
})
