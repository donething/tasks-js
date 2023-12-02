import {expect} from "chai"
import Hostloc from "../utils/spider/hostloc/hostloc"
import Nodeseek from "../utils/spider/nodeseek/nodeseek"

describe('getXXTids function test', () => {
  it('getHostlocTids "45" should not null', async () => {
    const topics = await Hostloc.getTids("45")
    console.log(topics)
    expect(topics).to.be.not.empty
  }).timeout(0)

  it('getNodeseekTids "Index" should not null', async () => {
    const topics = await Nodeseek.getTids("")
    console.log(topics)
    expect(topics).to.be.not.empty
  }).timeout(0)
  it('getNodeseekTids "Tech" should not null', async () => {
    const topics = await Nodeseek.getTids("tech")
    console.log(topics)
    expect(topics).to.be.not.empty
  }).timeout(0)
})
