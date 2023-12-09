import {expect} from "chai"
import {parseLocRss, parseLocSaleLJ} from "../utils/spider/hostloc/hostloc"
import parseLocHtml from "../utils/spider/hostloc/hostloc"
import parseNSRss from "../utils/spider/nodeseek/nodeseek"
import parseV2exRss from "../utils/spider/v2ex/v2ex"

describe('parseLocRss function test', () => {
  it('parseLocHtml "45" should not null', async () => {
    const topics = await parseLocHtml("45")
    console.log(topics)
    expect(topics).to.be.not.empty
  }).timeout(0)

  it('parseLocRss Index should not null', async () => {
    const topics = await parseLocRss()
    console.log(topics)
    expect(topics).to.be.not.empty
  }).timeout(0)

  it('parseLocSaleLJ Index should not null', async () => {
    const topics = await parseLocSaleLJ()
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
