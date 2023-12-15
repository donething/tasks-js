"use strict";
/**
 * 推送 TG 消息
 * 注意：在环境变量中添加键`TG_KEY`，值为"token,chatid"（以英文逗号分隔）
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushTGDaily = exports.pushTGTopic = exports.pushTGMsg = void 0;
const do_utils_1 = require("do-utils");
const wxpush_1 = __importDefault(require("./wxpush"));
// TG 消息的键
let tgKey = JSON.parse(process.env.TG_KEY || "{}");
// 推送消息。需要自行转义 Markdown v2
const push = async (title, content, t) => {
    if (!process.env.TG_KEY) {
        console.log("😢 无法推送 TG 消息，请先设置环境变量'TG_KEY'");
        return false;
    }
    const tg = new do_utils_1.TGSender(t.token);
    const response = await tg.sendMessage(t.chatID, `${title}\n\n${content}`);
    if (!response.ok) {
        console.log("😱 推送 TG 消息失败：", response.error_code, response.description, `\n\n${title}：\n\n${content}`);
        await (0, wxpush_1.default)(`${response.error_code}：${response.description}\n\n"${title}"`, "推送 TG 消息失败");
        return false;
    }
    console.log(`😊 推送 TG 消息成功："${title}"`);
    return true;
};
/**
 * 推送普通 TG 消息
 * @param title 标题。如 "京豆签到"
 * @param content 消息
 * @param tag 标签。用于 TG 中用井号分类。如 "jd"
 */
const pushTGMsg = async (title, content, tag = "") => {
    const caption = (tag ? `\\#${do_utils_1.TGSender.escapeMk(tag)} ` : "") + `${do_utils_1.TGSender.escapeMk(title)}`;
    return push(caption, do_utils_1.TGSender.escapeMk(content), tgKey.main);
};
exports.pushTGMsg = pushTGMsg;
/**
 * 推送新帖的 TG 消息
 * @param tag 标签。如 "v2ex"
 * @param t 主题信息
 */
const pushTGTopic = async (tag, t) => {
    const topicStr = `*[${do_utils_1.TGSender.escapeMk(t.title)}](${do_utils_1.TGSender.escapeMk(t.url)})*\n\n\\#${do_utils_1.TGSender.escapeMk(t.name)} \\#${do_utils_1.TGSender.escapeMk(t.author || "[作者未知]")} _${do_utils_1.TGSender.escapeMk(t.pub || "[日期未知]")}_`;
    return push(`\\#${do_utils_1.TGSender.escapeMk(tag)} 新帖`, topicStr, tgKey.freshPost);
};
exports.pushTGTopic = pushTGTopic;
/**
 * 推送每日任务执行结果的 TG 消息。需要自行转义 Markdown v2
 * @param tag 标签。如 "daily"
 * @param result 成功或失败。如 "签到失败"
 * @param tips 消息内容
 */
const pushTGDaily = async (tag, result, tips) => {
    return push(`\\#${do_utils_1.TGSender.escapeMk(tag)} ${do_utils_1.TGSender.escapeMk(result)}`, do_utils_1.TGSender.escapeMk(tips), tgKey.signBot);
};
exports.pushTGDaily = pushTGDaily;
