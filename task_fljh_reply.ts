/**
 * 福利江湖
 * 回复帖子。该站已墙
 * cron * * * * *
 */
import makeFetchCookie from 'fetch-cookie'
import {UserAgents, isQL, calStr, fillInitCookies} from "./utils/utils"

// 标签
const TAG = "[FLJH]"
// 回复的内容
const content = encodeURIComponent("感谢分享！！")

// Jar
const jar = new makeFetchCookie.toughCookie.CookieJar()
const fetchCookie = makeFetchCookie(fetch, jar)

const start = (cookie: string) => {
  if (!cookie) {
    console.log(TAG, "请先设置环境变量 Cookie，名为'FLJH_COOKIE'")
    return
  }

  fillInitCookies(jar, cookie, "https://fulijianghu.org/")

  reply("57099")
}

const reply = async (tid: string) => {
  const headers = {
    "origin": "https://fulijianghu.org",
    "referer": "https://fulijianghu.org",
    "user-agent": UserAgents.Win
  }

  // 获取验证回答需要的 hashid
  const topicURL = `https://fulijianghu.org/forum.php?mod=viewthread&tid=${tid}`
  const topicResp = await fetchCookie(topicURL, {headers})
  const hashText = await topicResp.text()
  if (hashText.includes("您需要登录后才可以回帖")) {
    console.log(TAG, "需要登录后才可以回帖")
    throw `${TAG} 需要登录后才可以回帖`
  }

  const reg = /<input.+?name="formhash"\s+value="(?<formhash>.+?)".+?<span\s+id="secqaa_(?<hashid>\S+)">/s
  const match = hashText.match(reg)
  if (!match || !match.groups) {
    console.log(TAG, "提取 formhash、hashid 失败：", hashText)
    throw `${TAG} 提取 formhash、hashid 失败`
  }
  const {formhash, hashid} = match.groups

  // 获取验证回答
  const qaa = await getSecqaa(hashid)
  !isQL && console.log(TAG, `提取帖子(${tid})的信息 formhash: ${formhash} , hashid: ${hashid} , qaa: ${qaa}`)

  // 回复
  const replyURL = "https://fulijianghu.org/forum.php?mod=post&action=reply&replysubmit=yes&" +
    "handlekey=fastpost&inajax=1&tid=" + tid
  const now = parseInt("" + Date.now() / 1000)
  const body = `message=${content}&secqaahash=${hashid}&secanswer=${qaa}&posttime=${now}&formhash=${formhash}` +
    "&usesig=1&subject=++"
  const replyResp = await fetchCookie(replyURL, {body, headers})
  const replyText = await replyResp.text()
  if (!replyText.includes("回复发布成功")) {
    console.log(TAG, "回复失败：", replyText)
    throw `${TAG} 回复失败`
  }

  console.log(`回复帖子(${tid})成功`)
}

/**
 * 获取验证回答
 * @param hashid 该验证的 ID。如"qSnm317v"，
 * 可以从回复页面的源码中获取：`<div class="mtm"><span id="secqaa_qSnm317v"></span>`
 */
const getSecqaa = async (hashid: string): Promise<number> => {
  const headers = {
    "referer": "https://fulijianghu.org",
    "user-agent": UserAgents.Win
  }
  const url = `https://fulijianghu.org/misc.php?mod=secqaa&action=update&idhash=${hashid}&${Math.random()}`
  const resp = await fetchCookie(url, {headers})
  const text = await resp.text()
  const match = text.match(/class="vm"\s\/><\/span>'.+?'(?<expression>.+?)=/s)
  if (!match || !match.groups) {
    console.log(TAG, "提取验证回答失败：", text)
    throw `${TAG} 提取验证回答失败`
  }

  const {expression} = match.groups
  !isQL && console.log(TAG, "验证回答的问题：", expression)

  return calStr(expression)
}


//
// 执行
// 先设置环境变量 Cookie。如在本地 Powershell中：$env:FLJH_COOKIE="my cookie ..."
start(process.env.FLJH_COOKIE || "")

export {}