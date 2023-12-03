# tasks-js

定时任务脚本。适用于 `nodejs` + `青龙`

# emoji 表情的通知相关意思

* 😊 成功
* 😂 已做过
* 😪 没有
* 😴 结束
* 🤨 信息
* 😢 警告
* 😱 错误

# 配置

## 推送消息

* 企业微信推送：`环境变量`中添加键`QYWX_KEY`，值为"id,secret,touser,agentid"，以英文逗号分隔
* TG 消息推送：`环境变量`中添加键`TG_KEY`，值的格式：
  ```ts
  // TG 的 Token、频道 ID
  interface Token {
    token: string
    chatID: string
  }
  // TGKeys
  interface TGKeys {
    // 标准通知
    main: Token,
    // 新帖的通知
    signBot: Token,
    // 签到的通知
    freshPost: Token
  }
  ```

# 编写新脚本

## 编写

任务脚本文件名需要前缀`task_`，以便`青龙`获取

给脚本设置`名称`、`cron`：

`cron` 后的引号":"不能省略，否则会无法识别

```ts
// new Env('脚本名称测试');
// cron: 51 5 * * *

console.log("测试！")
```

## 无头浏览器 puppeteer

`青龙`容器使用的是`apline`系统，可以先在控制面板中，安装`Linux`依赖`chromium`。将自动在容器中执行`apk add --no-cache chromium`

然后，在脚本中只使用`puppeteer-core`，指定启动路径参数`executablePath`

## 测试

使用`TypeScript`编写的脚本，可以通过`ts-node`直接执行

```shell
ts-node .\tasks\discfan.ts
```
