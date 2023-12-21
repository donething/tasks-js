import {expect} from "chai"
import {parseLocRss, parseLocSaleLJ} from "../utils/spider/hostloc/hostloc"
import parseLocHtml from "../utils/spider/hostloc/hostloc"
import parseV2exRss from "../utils/spider/v2ex/v2ex"
import {parseNsRss} from "../utils/spider/nodeseek/nodeseek"

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
    const topics = await parseNsRss()
    console.log(topics)
    expect(topics).to.be.not.empty
  }).timeout(0)

  it('parseV2exRss should not null', async () => {
    const topics = await parseV2exRss()
    console.log(topics)
    expect(topics).to.be.not.empty
  }).timeout(0)
})
