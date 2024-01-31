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
const rssUrl = "https://www.v2ex.com/index.xml";
const parser = new rss_parser_1.default();
const TAG = "v2ex";
/**
 * 解析 v2ex 的最新帖子
 */
const parseRss = async () => {
    const resp = await http_1.mAxios.get(rssUrl);
    const rss = await parser.parseString(resp.data);
    const topics = [];
    for (let item of rss.items) {
        const m = item.id.match(tidReg);
        if (!m || m.length <= 1) {
            throw Error(`无法解析帖子的 ID: "${item.id}"`);
        }
        const tid = m[1];
        const title = item.title;
        const url = item.link;
        const author = item.author;
        // xmlparser 将 description 解析到了 content 变量
        const content = (0, comm_1.truncate4tg)(item.content || "");
        const pub = (0, do_utils_1.date)(new Date(item.pubDate), comm_1.TOPIC_TIME);
        topics.push({ tag: TAG, tid, title, url, author, content, pub });
    }
    return topics;
};
// V2ex
const V2ex = { TAG, parseRss };
exports.default = V2ex;
