"use strict";
/**
 * 当有人出售 CC VPS 时，发送通知
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// new Env('CC有售')
// cron: */10 * * * * *
const topicsFile_1 = __importDefault(require("./utils/topicsFile"));
const hostloc_1 = require("./utils/spider/hostloc/hostloc");
const nodeseek_1 = __importDefault(require("./utils/spider/nodeseek/nodeseek"));
const TAG = "CC有售";
// 任务信息
const taskInfo = {
    // 需要扫描帖子的网址及节点
    topicTaskInfos: [
        {
            fun: hostloc_1.parseLocSaleLJ,
            // VPS 综合讨论区
            node: "45"
        },
        {
            fun: nodeseek_1.default,
            // （首页）所有新帖
            node: ""
        }
    ],
    // 只匹配 cloudcone 有关的帖子
    reg: /\b(cc)(?!s)|(cloudcone)\b/i,
    // 保存数据的文件路径
    filepath: "./db/cc_wait_sale.json",
    // 发送通知时的提示文本
    tag: TAG,
};
(0, topicsFile_1.default)(taskInfo);
