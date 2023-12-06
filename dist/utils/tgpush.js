"use strict";
/**
 * 推送 TG 消息
 * 注意：在环境变量中添加键`TG_KEY`，值为"token,chatid"（以英文逗号分隔）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushTGSign = exports.pushTGTopic = exports.pushTGMsg = void 0;
const wxpush_1 = require("./wxpush");
const do_utils_1 = require("do-utils");
// TG 消息的键
let tgKey = JSON.parse(process.env.TG_KEY || "{}");
// 推送消息（可 Markdown 格式）
const push = async (text, t) => {
    if (!process.env.TG_KEY) {
        console.log("😢 无法推送 TG 消息，请先设置环境变量'TG_KEY'");
        return false;
    }
    const tg = new do_utils_1.TGSender(t.token);
    const response = await tg.sendMessage(t.chatID, text);
    if (!response.ok) {
        console.log("😱 推送 TG 消息失败：", response.error_code, response.description, "：\n", text);
        await (0, wxpush_1.pushTextMsg)("推送 TG 消息失败", `${response.error_code}：${response.description}`);
        return false;
    }
    console.log("😊 推送 TG 消息成功");
    return true;
};
/**
 * 推送普通 TG 消息。需要自行转义 Markdown v2
 * @param title
 * @param content
 * @param tag
 */
const pushTGMsg = async (title, content, tag = "") => {
    return push((tag ? `\\#${tag} ` : "") + `${title}\n\n${content}`, tgKey.main);
};
exports.pushTGMsg = pushTGMsg;
// 推送新帖的 TG 消息
const pushTGTopic = async (tag, t) => {
    const str = `\\#${tag} 新帖\n\n*[${do_utils_1.TGSender.escapeMk(t.title)}](${do_utils_1.TGSender.escapeMk(t.url)})*\n\n\\#${do_utils_1.TGSender.escapeMk(t.name)} \\#${do_utils_1.TGSender.escapeMk(t.author || "[作者未知]")} _${do_utils_1.TGSender.escapeMk(t.pub || "[日期未知]")}_`;
    return push(str, tgKey.freshPost);
};
exports.pushTGTopic = pushTGTopic;
/**
 * 推送每日签到的 TG 消息。需要自行转义 Markdown v2
 * @param tag 标签。如 "daily"
 * @param result 成功或失败。如 "签到失败"
 * @param tips 消息内容
 */
const pushTGSign = async (tag, result, tips) => {
    return push(`\\#${tag} ${result}\n\n${tips}`, tgKey.signBot);
};
exports.pushTGSign = pushTGSign;
