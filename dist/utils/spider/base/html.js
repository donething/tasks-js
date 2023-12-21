"use strict";
/**
 * 提取 HTML 格式的帖子。如 Discuz!
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHTMLTopics = void 0;
const http_1 = require("../../http");
const cheerio = __importStar(require("cheerio"));
/**
 * 获取 HTML 页面的帖子
 */
const getHTMLTopics = async (urlInfo) => {
    const resp = await http_1.mAxios.get(urlInfo.url, { headers: urlInfo.headers });
    const text = await resp.data;
    if (!text.includes(urlInfo.include)) {
        console.log(`获取帖子失败。解析不到标志"${urlInfo.include}"，可能被风控 ${urlInfo.url} ：\n`, text);
        throw Error(`获取帖子失败。解析不到标志"${urlInfo.include}"，可能被风控 ${urlInfo.url}`);
    }
    // 解析
    const tids = [];
    const $ = cheerio.load(text);
    for (let item of $(urlInfo.selector)) {
        const t = $(item);
        // 标题
        const title = t.text().trim();
        const path = t.attr("href");
        if (!path) {
            throw Error(`获取帖子 ID 失败。href 为空："${t}"`);
        }
        const m = path.match(urlInfo.tidReg);
        if (!m || m.length <= 1) {
            throw Error(`获取帖子 ID 失败。没有匹配到帖子的 ID："${path}"`);
        }
        // 帖子 ID
        const tid = m[1];
        // 帖子 URL
        let url = "";
        const baseUrl = new URL(urlInfo.url).origin;
        // 检查 href 是否为相对路径
        if (path.startsWith('//')) {
            // 处理协议相对 URL
            url = baseUrl.startsWith('https') ? `https:${path}` : `http:${path}`;
        }
        else if (!path.startsWith('http')) {
            // 如果是相对路径，拼接基础 URL 和 href
            url = new URL(path, baseUrl).href;
        }
        const name = urlInfo.name;
        tids.push({ author: "", content: "", pub: "", title, tid, url, tag: name });
    }
    return tids;
};
exports.getHTMLTopics = getHTMLTopics;
