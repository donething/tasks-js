import {expect} from "chai"
import Hostloc from "../utils/spider/hostloc/hostloc"
import Nodeseek from "../utils/spider/nodeseek/nodeseek"
import parseLocRss from "../utils/spider/hostloc/hostloc"
import parseNSRss from "../utils/spider/nodeseek/nodeseek"
import parseV2exRss from "../utils/spider/v2ex/v2ex"

describe('parseLocRss function test', () => {
  it('parseLocRss "45" should not null', async () => {
    const topics = await parseLocRss("45")
    console.log(topics)
    expect(topics).to.be.not.empty
  }).timeout(0)

  it('parseNSRss "Index" should not null', async () => {
    const topics = await parseNSRss()
    console.log(topics)
    expect(topics).to.be.not.empty
  }).timeout(0)

  it('parseV2exRss should not null', async () => {
    const topics = await parseV2exRss()
    console.log(topics)
    expect(topics).to.be.not.empty
  }).timeout(0)
})
