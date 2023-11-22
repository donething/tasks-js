/**
 * 由于存储路由器的 IP 地址到 Redis 中，而过一段时间没访问时，Redis 会被删除，所以定时访问
 * 需要在环境变量中添加`ROUTER_URL`，值为获取路由器 IP 的云服务的访问网址
 */

// new Env('激活 Redis')
// cron: * 2 * * *

const active = async (url: string) => {
  if (!url) {
    console.log("😢 'ROUTER_URL'环境变量为空")
    return
  }

  try {
    const resp = await fetch(url, {
      // 配置fetch不自动处理重定向
      redirect: 'manual',
    })

    // 检查重定向
    const redirect = resp.headers.get('Location')

    if (redirect) {
      // 获取重定向后的URL
      console.log("😊 重定向后的 URL：", redirect)
    } else {
      console.log("🤨 没有发生重定向：", resp.url)
    }
  } catch (e) {
    console.error("😱 无法访问 URL：", url, "：\n", e)
  }
}

active(process.env.ROUTER_URL || "")