"use strict";
/**
 * 当有人发布指定内容的帖子时，发送通知
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// new Env('新帖相关')
// cron: */30 * * * * *
const notify_1 = __importDefault(require("./utils/notify"));
const hostloc_1 = __importDefault(require("./utils/spider/hostloc/hostloc"));
const nodeseek_1 = __importDefault(require("./utils/spider/nodeseek/nodeseek"));
const v2ex_1 = __importDefault(require("./utils/spider/v2ex/v2ex"));
const TAG = "新帖相关";
// 任务信息
const taskInfo = {
    // 需要扫描帖子的网址及节点
    topicTaskInfos: [
        {
            tag: hostloc_1.default.TAG,
            fun: hostloc_1.default.parseSaleLJ,
            // 只匹配 cloudcone 有关的帖子
            needNotify: t => /\b(cc)(?!s)|(cloudcone)\b/i.test(t.title),
            // VPS 综合讨论区
            node: "45"
        },
        {
            tag: nodeseek_1.default.TAG,
            fun: nodeseek_1.default.parseRss,
            needNotify: t => t.category === "trade",
            // （首页）所有新帖
            node: ""
        },
        {
            tag: v2ex_1.default.TAG,
            fun: v2ex_1.default.parseRss,
            needNotify: t => /\b(vps)\b/i.test(t.title),
            node: ""
        }
    ],
    // 保存数据的文件路径
    filepath: "./backups/topics_notify.json",
    // 发送通知时的提示文本
    tag: TAG,
};
(0, notify_1.default)(taskInfo);
