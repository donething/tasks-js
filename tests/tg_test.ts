import {pushTGMsg} from "../utils/push/tgpush"
import {expect} from "chai"
import {TGSender} from "do-utils"


describe('pushTGMsg function test', () => {
  it('pushTGMsg should not null', async () => {
    const result = await pushTGMsg("#测试 消息", TGSender.escapeMk("内容！"))
    console.log(result)
    expect(result).to.true
  }).timeout(0)
})
