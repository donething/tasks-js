"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 推送企业微信消息
 * 注意：环境变量中添加键`QYWX_KEY`，值为"id,secret,touser,agentid"（以英文逗号分隔）
 */
const do_utils_1 = require("do-utils");
const TAG = "wxqypush";
/**
 * 推送企业微信消息
 *
 * 推送“卡片消息”：需要传递所有参数
 *
 * 推送“Markdown消息”：只传递参数 content
 *
 * 否则推送“文本消息”：传递参数 title、content
 *
 * @param content 内容
 * @param title 标题
 * @param url 卡片消息的 URL
 * @param btnTxt 卡片消息的点击提示文本
 */
const pushWxMsg = async (content, title, url, btnTxt = "点击访问") => {
    if (!process.env.QYWX_KEY) {
        console.log("😢", TAG, "请先设置环境变量'QYWX_KEY'");
        return false;
    }
    const [corpid, secret, user, agentid] = process.env.QYWX_KEY.split(",");
    const wxpush = new do_utils_1.WXQiYe(corpid, secret);
    const agentidNum = Number(agentid);
    let err;
    if (url) {
        err = await wxpush.pushCard(agentidNum, `${TAG} ${title}`, content, user, url, btnTxt);
    }
    else if (!title) {
        err = await wxpush.pushMarkdown(agentidNum, content, user);
    }
    else {
        err = await wxpush.pushText(agentidNum, `${TAG} ${title}\n\n${content}`, user);
    }
    if (err) {
        console.log("😱", TAG, "推送消息失败：", err, `\n\n${title}：\n\n${content}`);
        return false;
    }
    console.log("😊", TAG, `推送消息成功："${title}"`);
    return true;
};
exports.default = pushWxMsg;
