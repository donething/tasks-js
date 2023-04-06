# tasks-js

定时任务脚本，适用于 nodejs +青龙

# 微信推送消息

需要在青龙`环境变量`中添加键名`QYWX_KEY`，值为"id,secret,touser,agentid"，以英文逗号","分隔

# 新脚本

任务脚本文件名需要前缀`task_`，以便`青龙`获取

# 测试

使用`TypeScript`编写的脚本，可以通过`ts-node`直接执行

```shell
ts-node .\tasks\discfan.ts
```
