import {expect} from "chai"
import Hostloc from "../utils/spider/hostloc/hostloc"
import Nodeseek from "../utils/spider/nodeseek/nodeseek"
import V2ex from "../utils/spider/v2ex/v2ex"

describe('parseLocRss function test', () => {
  it('parseLocHtml "45" should not null', async () => {
    const topics = await Hostloc.parseHtml("45")
    console.log(topics)
    expect(topics).to.be.not.empty
  }).timeout(0)

  it('parseLocRss Index should not null', async () => {
    const topics = await Hostloc.parseRss()
    console.log(topics)
    expect(topics).to.be.not.empty
  }).timeout(0)

  it('parseLocSaleLJ Index should not null', async () => {
    const topics = await Hostloc.parseSaleLJ()
    console.log(topics)
    expect(topics).to.be.not.empty
  }).timeout(0)

  it('parseNSRss "Index" should not null', async () => {
    const topics = await Nodeseek.parseRss()
    console.log(topics)
    expect(topics).to.be.not.empty
  }).timeout(0)

  it('parseV2exRss should not null', async () => {
    const topics = await V2ex.parseRss()
    console.log(topics)
    expect(topics).to.be.not.empty
  }).timeout(0)
})
