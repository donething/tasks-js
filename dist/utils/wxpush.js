"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushMarkdownMsg = exports.pushTextMsg = exports.pushCardMsg = void 0;
/**
 * 推送企业微信消息
 * 注意：环境变量中添加键`QYWX_KEY`，值为"id,secret,touser,agentid"（以英文逗号分隔）
 */
const do_utils_1 = require("do-utils");
const TAG = "[青龙]";
// 微信推送实例
let wxpush = undefined;
// 消息频道 ID
let user = "";
let agentid = 0;
// 初始化微信推送实例
const init = async () => {
    if (!process.env.QYWX_KEY) {
        console.log("😢 无法推送企业微信消息，请先设置环境变量'QYWX_KEY'");
        return false;
    }
    if (!wxpush) {
        const [corpid, secret, u, id] = process.env.QYWX_KEY.split(",");
        wxpush = new do_utils_1.WXQiYe(corpid, secret);
        user = u;
        agentid = Number(id);
    }
    return true;
};
// 推送微信卡片消息
const pushCardMsg = async (title, description, url, btnTxt) => {
    if (!(await init()) || !wxpush) {
        return;
    }
    let error = await wxpush.pushCard(agentid, `${TAG} ${title}`, description, user, url, btnTxt);
    if (error) {
        console.log("😱 推送微信卡片消息失败", error);
        return;
    }
    console.log("😊 推送微信卡片消息成功：", title);
};
exports.pushCardMsg = pushCardMsg;
// 推送微信文本消息
const pushTextMsg = async (title, content) => {
    if (!(await init()) || !wxpush) {
        return;
    }
    let error = await wxpush.pushText(agentid, `${TAG} ${title}\n\n${content}`, user);
    if (error) {
        console.log("😱 推送微信文本消息失败", error);
        return;
    }
    console.log("😊 推送微信文本消息成功：", title);
};
exports.pushTextMsg = pushTextMsg;
// 推送微信 Markdown 消息（暂只支持企业微信接收）
const pushMarkdownMsg = async (content) => {
    if (!(await init()) || !wxpush) {
        return;
    }
    let error = await wxpush.pushMarkdown(agentid, content, user);
    if (error) {
        console.log("😱 推送微信 Markdown 消息失败", error);
        return;
    }
    console.log("😊 推送微信 Markdown 消息成功");
};
exports.pushMarkdownMsg = pushMarkdownMsg;
