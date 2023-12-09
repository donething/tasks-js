"use strict";
/**
 * 解析 hostloc 的帖子
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLocSaleLJ = exports.parseLocRss = void 0;
const rss_parser_1 = __importDefault(require("rss-parser"));
const comm_1 = require("../base/comm");
const do_utils_1 = require("do-utils");
const http_1 = require("../../http");
const html_1 = require("../base/html");
const name = "hostloc";
// 匹配帖子的 ID
const tidReg = /thread-(\d+)-/i;
const check = "全球主机交流论坛";
const selector = "table#threadlisttableid tbody[id^='normalthread'] th.new a.xst";
const parser = new rss_parser_1.default();
const headers = { "User-Agent": http_1.UserAgents.Win };
/**
 * 解析 hostloc 的最新帖子
 * @param fid 板块的 ID，为空""表示获取所有新帖。如 "45"表示获取“美国VPS综合讨论”分区的新帖
 */
const parseLocRss = async (fid = "") => {
    const url = `https://hostloc.com/forum.php?mod=rss&fid=${fid}`;
    const resp = await http_1.mAxios.get(url, { headers });
    const rss = await parser.parseString(resp.data);
    const topics = [];
    for (let item of rss.items) {
        const m = item.link.match(tidReg);
        if (!m || m.length <= 1) {
            throw Error(`无法解析帖子的 ID: ${item.link}`);
        }
        const tid = m[1];
        const title = item.title;
        const url = item.link;
        const author = item.author;
        // xmlparser 将 description 解析到了 content 变量
        const content = (0, comm_1.truncate4tg)(item.description || item.content || "");
        const pub = (0, do_utils_1.date)(new Date(item.pubDate), comm_1.TOPIC_TIME);
        topics.push({ name, tid, title, url, author, content, pub });
    }
    return topics;
};
exports.parseLocRss = parseLocRss;
/**
 * 解析 hostloc 的最新帖子
 * @param fid 板块的 ID，为空""表示获取所有新帖。如 "45"表示获取“美国VPS综合讨论”分区的新帖
 */
const parseLocHtml = async (fid = "") => {
    const url = `https://hostloc.com/forum.php?mod=forumdisplay&fid=${fid}&orderby=dateline`;
    const info = { include: check, headers, name, selector, tidReg, url };
    return await (0, html_1.getHTMLTopics)(info);
};
// 解析 https://hostloc.mjj.sale/
const parseLocSaleLJ = async () => {
    const resp = await http_1.mAxios.get("https://hostloc.mjj.sale/");
    const data = resp.data.new_data[0];
    const topics = [];
    for (let item of data) {
        const m = item.主题链接.match(/(?:thread-|tid=)(\d+)/i);
        if (!m || m.length <= 1) {
            console.log(item);
            throw Error(`无法解析帖子的 ID: ${item.主题链接}`);
        }
        const tid = m[1];
        const title = item.主题;
        const url = item.主题链接;
        const author = item.发布者;
        // xmlparser 将 description 解析到了 content 变量
        const content = (0, comm_1.truncate4tg)(typeof item.主题内容 === "string" ? item.主题内容 : item.主题内容.join("\n"));
        const dStr = item.发布时间.trim().replaceAll("\\", "");
        const d = dStr.substring(0, dStr.lastIndexOf(" "));
        const pub = (0, do_utils_1.date)(new Date(d), comm_1.TOPIC_TIME);
        topics.push({ name, tid, title, url, author, content, pub });
    }
    return topics;
};
exports.parseLocSaleLJ = parseLocSaleLJ;
exports.default = parseLocHtml;
