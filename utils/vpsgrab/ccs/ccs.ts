import {mAxios} from "../../http"
import {FData, User} from "./types"
import {readJSON, writeJSON} from "../../file"
import {pushTGMsg} from "../../tgpush"
import * as cheerio from "cheerio"
import {Root} from "../../comm"

const TAG = "订购CCS"

// 需要订购的产品
const productList = [
  "https://cloud.colocrossing.com/aff.php?aff=&pid=23",
  "https://cloud.colocrossing.com/aff.php?aff=&pid=24",
  "https://cloud.colocrossing.com/aff.php?aff=&pid=25"
]
// 需要所在的数据中心
// const dcList = ["Los Angeles", "New York"]
const dcList = ["Los Angeles"]

// 网站地址
const addr = "https://cloud.colocrossing.com"

// 数据文件的路径
const dbPath = Root + "/ccs_order.json"

/**
 * 登录
 * 登录失败时，会直接抛出错误
 */
const login = async (user: User) => {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/119.0.0.0 Safari/537.36',
    "Origin": addr,
    "Referer": addr,
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
  }

  const loginHtmlResp = await mAxios.get(`${addr}/index.php?rp=/login`, {headers})
  const result = /csrfToken = '(.+)'/.exec(loginHtmlResp.data)
  if (!result || result.length < 2) {
    throw Error("解析登录页面的 csrf token 出错")
  }

  const data = `token=${result[1]}&username=${encodeURIComponent(user.email)}&password=${encodeURIComponent(user.psw)}`
  const resp = await mAxios.post(`${addr}/index.php?rp=/login`, data, {headers})

  if (resp.data.includes("<title>Login</title>")) {
    throw Error(`用户名或密码错误：'${user.email}','${user.psw}'`)
  }

  // 登录成功
}

// 订购
const order = async (productUrl: string, user: User): Promise<boolean> => {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/119.0.0.0 Safari/537.36',
    "Origin": addr,
    "Referer": addr,
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
  }

  // 从产品页面获取需要的表单
  const productHtmlResp = await mAxios.get(productUrl, {headers})
  if (productHtmlResp.data.trim() === "") {
    console.log(`无货 ${productUrl}`)
    return false
  }

  // 按照指定次序，提取选项中的数据中心。{"New York": "174"}
  const $ = cheerio.load(productHtmlResp.data)
  const rootpw = $('input[name="rootpw"]').val() as string
  const hostname = $("#inputHostname").val() as string
  const dcOptions = $("#inputConfigOption72 option")
  let dc = undefined
  // 先提取所有数据中心
  // 在 jQuery 中，.map()方法返回的是一个 jQuery 对象，而不是一个标准的 JavaScript 数组
  // 最后要用 `.get()`提取实际值
  const dcs = dcOptions.map((_, el) =>
    ({name: $(el).text().trim(), id: $(el).attr('value')})).get()
  // 按指定的数据中心的次序优先选择
  for (let dcitem of dcList) {
    dc = dcs.find(el => el.name.includes(dcitem))
    if (dc) {
      break
    }
  }
  // 只对指定数据中心的 VPS 下订单
  if (!dc) {
    console.log(`不下单，DC不满足要求。[${hostname}]可选的DC为`, dcs)
    pushTGMsg("不下单，DC不满足要求",
      `[${hostname}]可选的DC为：\n"${JSON.stringify(dcs, null, "  ")}"\n\n${productUrl}`,
      TAG
    )
    return false
  }

  // 有一个重要参数 i 是重定向到产品真正购买页面后的 URL 中
  const params = new URLSearchParams(new URL(productHtmlResp.request.res.responseUrl).searchParams)
  const i = params.get("i")

  // 先登录
  await login(user)

  // POST 加入购物车
  const data = `ajax=1&a=confproduct&configure=true&i=${i}&billingcycle=annually&rootpw=${decodeURIComponent(rootpw)}&hostname=${decodeURIComponent(hostname)}&ns1prefix=ns1&ns2prefix=ns2&configoption%5B72%5D=${dc.id}&configoption%5B75%5D=0&configoption%5B77%5D=209`
  const cartResp = await mAxios.post(`${addr}/cart.php`, data, {headers})
  if (cartResp.data.trim() !== "") {
    throw Error(`加入购物车出错："${cartResp.data}"`)
  }

  console.log(`已加入购物车：Hostname: ${hostname}, DC: ${dc.name}`)

  // 从结算页面，获取 csrfToken、account_id（当前付费账号非用户账号的ID）
  const checkoutHtmlResp = await mAxios.get(`${addr}/cart.php?a=confdomains`)
  if (checkoutHtmlResp.data.includes("Your Shopping Cart is Empty")) {
    throw Error("购物车为空，加入购物车失败")
  }

  const tokenResult = /csrfToken = '(?<csrfToken>.+)'([^]+?)name="account_id" value="(?<accountId>\d+)"/.exec(checkoutHtmlResp.data)
  if (!tokenResult?.groups) {
    throw Error("解析结算页面的 token、账号 ID 出错")
  }

  // 提取信息
  const {csrfToken, accountId} = tokenResult.groups

  // POST 结算
  const checkoutData = `token=${csrfToken}&submit=true&custtype=existing&account_id=${accountId}&paymentmethod=paypal&applycredit=1`
  const checkoutResp = await mAxios.post(`${addr}/cart.php?a=checkout`, checkoutData, {headers})

  if (!checkoutResp.data.includes("redirected to the gateway you chose to make payment")) {
    throw Error(`结算失败：${checkoutResp.data}`)
  }

  // 成功订购
  console.log(`订购成功：Hostname: ${hostname}, DC: ${dc.name}`)
  return true
}

// 是否有货
const hasStock = async (url: string): Promise<boolean> => {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/119.0.0.0 Safari/537.36',
    "Referer": addr,
  }

  const resp = await mAxios.get(url, {headers})
  return resp.data.trim() !== ""
}

// 开始订购
const startOrder = async (users: User[]) => {
  // 读取数据
  const fData = readJSON<FData>(dbPath, {hadOrder: [], hadNotifyUnavailable: false})
  const available = users.filter(u => !fData.hadOrder.includes(u.email))
  if (available.length === 0) {
    console.log("环境变量的账号列表中，没有还未订购VPS的账号")
    return
  }
  fData.hadNotifyUnavailable = false

  // 判断需购买的VPS是否有货
  const promises = productList.map(u => ({tag: u, promise: hasStock(u)}))

  // 根据是否有货判断购买
  const results = await Promise.allSettled(promises.map(p => p.promise))
  for (const [i, result] of results.entries()) {
    if (result.status === "rejected") {
      console.log("检查是否有货时出错", promises[i].tag, result.reason)
      pushTGMsg("检查是否有货时出错", result.reason, TAG)
      continue
    }

    // 是否有货，有就订购
    if (!result.value) {
      console.log("无货", promises[i].tag)
      continue
    }
    // 订购
    console.log("有货，开始订购", promises[i].tag)
    const success = await order(promises[i].tag, available[0])
    if (!success) {
      continue
    }

    // 订购成功，处理数据
    fData.hadOrder.push(available[0].email)
    pushTGMsg(`已成功下单 VPS`, `邮箱：${available[0].email}\n\n产品：${promises[i].tag}`, TAG)

    available.shift()
    if (available.length === 0) {
      console.log("此时，环境变量的账号列表中，已没有还未订购VPS的账号")
      await pushTGMsg("账号不足", "已没有还未订购VPS的账号", TAG)
      fData.hadNotifyUnavailable = true
      break
    }
  }

  // 保存文件
  writeJSON(dbPath, fData)
}

// Colocrossing 的任务
const CCS = {startOrder, login}

export default CCS
