import {pushTGMsg} from "../utils/tgpush"
import {expect} from "chai"


describe('pushTGMsg function test', () => {
  it('pushTGMsg should not null', async () => {
    const result = await pushTGMsg("测试消息")
    console.log(result)
    expect(result).to.true
  }).timeout(0)
})
