/**
 * 由于存储路由器的 IP 地址到 Redis 中，而过一段时间没访问时，Redis 会被删除，所以定时访问
 * 需要在环境变量中添加`ROUTER_URL`，值为获取路由器 IP 的云服务的访问网址
 */

// new Env('激活 Redis')
// cron: * 2 * * *

const active = async (url: string) => {
  if (!url) {
    console.log("'ROUTER_URL'环境变量为空")
    return
  }

  const resp = await fetch(url)
  const text = await resp.text()

  console.log("输出：", text)
}

active(process.env.ROUTER_URL || "")