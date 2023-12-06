"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rss_parser_1 = __importDefault(require("rss-parser"));
const comm_1 = require("../base/comm");
const do_utils_1 = require("do-utils");
const http_1 = require("../../http");
const tidReg = /\/t\/(\d+)$/i;
const name = "v2ex";
const rssUrl = "https://www.v2ex.com/index.xml";
const parser = new rss_parser_1.default();
/**
 * 解析 v2ex 的最新帖子
 */
const parseV2exRss = async () => {
    const resp = await http_1.mAxios.get(rssUrl);
    const rss = await parser.parseString(resp.data);
    const topics = [];
    for (let item of rss.items) {
        const m = item.id.match(tidReg);
        if (!m || m.length <= 1) {
            console.log(`无法解析帖子的 ID: '${item.id}'`);
            return [];
        }
        const tid = m[1];
        const title = item.title;
        const url = item.link;
        const author = item.author;
        // xmlparser 将 description 解析到了 content 变量
        const content = (0, comm_1.truncate4tg)(item.content || "");
        const pub = (0, do_utils_1.date)(new Date(item.pubDate), comm_1.TOPIC_TIME);
        topics.push({ name, tid, title, url, author, content, pub });
    }
    return topics;
};
exports.default = parseV2exRss;
