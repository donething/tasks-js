"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushBulletTopic = void 0;
const http_1 = require("./http");
const wxpush_1 = __importDefault(require("./wxpush"));
const TAG = "pushbullet";
// 推送地址
const pushUrl = "https://api.pushbullet.com/v2/pushes";
const pushToken = JSON.parse(process.env.PUSHBULLET_TOKEN || "{}");
/**
 * pushbullet 推送消息
 * @param title 标题
 * @param body 内容
 * @param url 链接
 * @param channel_tag 频道标签，存在则推送到频道。如 "topics"
 */
const pushBullet = async (title, body, url, channel_tag) => {
    if (!process.env.PUSHBULLET_TOKEN) {
        console.log("😢", TAG, "请先设置环境变量'PUSHBULLET_TOKEN'");
        return false;
    }
    // 发送
    const data = {
        title,
        body,
        url,
        channel_tag,
        type: url ? "link" : "note"
    };
    const headers = {
        "Access-Token": pushToken.token
    };
    const resp = await http_1.mAxios.post(pushUrl, data, { headers });
    const obj = resp.data;
    // 推送失败
    if (obj.error_code) {
        console.log("😱", TAG, "推送消息失败：", obj.error.code, obj.error.message);
        await (0, wxpush_1.default)(`${obj.error.code}：${obj.error.message}\n\n"${title}"`, "推送 Pushbullet 消息失败");
        return false;
    }
    console.log("😊", TAG, `推送消息成功："${title}"`);
    return true;
};
// 推送新帖
const pushBulletTopic = async (tag, t) => {
    return pushBullet(`[${tag}] ${t.title}`, t.content, t.url, pushToken.channels.newTopics);
};
exports.pushBulletTopic = pushBulletTopic;
exports.default = pushBullet;
