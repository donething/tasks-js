"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envTip = exports.truncate4tg = exports.TOPIC_TIME = void 0;
// 发送消息到 TG 时，时间的格式
exports.TOPIC_TIME = "YYYY-mm-dd HH:MM:SS";
// 发送到 TG 消息中的帖子的最大长度
const TOPIC_MAX = 100;
// 发送到 TG 消息中的帖子的最大长度
const truncate4tg = (content) => {
    // 解析 rss 时，可能生成多个空白行，去除
    const str = content.replace(/\s/g, "");
    return str.length > TOPIC_MAX ? str.substring(0, TOPIC_MAX) + "\n..." : str;
};
exports.truncate4tg = truncate4tg;
// 在环境变量中增加变量的提示
const envTip = (keyName) => {
    return `请先设置环境变量"${keyName}"`;
};
exports.envTip = envTip;
