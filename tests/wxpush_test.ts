import {expect} from "chai"
import pushWxMsg from "../utils/push/wxpush"
// 加载 .env 文件中的环境变量
require('dotenv').config()

describe('pushWxMsg function test', () => {
  it('pushWxMsg card should be true', async () => {
    const result = await pushWxMsg("卡片内容", "测试消息标题", "https://baidu.com")
    console.log(result)
    expect(result).to.true
  }).timeout(0)

  it('pushWxMsg text should be true', async () => {
    const result = await pushWxMsg("文本内容", "测试消息标题")
    console.log(result)
    expect(result).to.true
  }).timeout(0)

  it('pushWxMsg markdown should be true', async () => {
    const result = await pushWxMsg("Markdown 内容：**标题**完成，显示_内容_")
    console.log(result)
    expect(result).to.true
  }).timeout(0)
})
