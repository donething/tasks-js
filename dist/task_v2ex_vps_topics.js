"use strict";
/**
 * 当 v2ex 有 vps 相关的主题时，发送通知
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// new Env('V2exVPS新帖')
// cron: */2 * * * *
const topicsFile_1 = __importDefault(require("./utils/topicsFile"));
const v2ex_1 = __importDefault(require("./utils/spider/v2ex/v2ex"));
const TAG = "V2exVPS";
// 任务信息
const taskInfo = {
    // 需要扫描帖子的网址及节点
    topicTaskInfos: [
        {
            fun: v2ex_1.default,
            node: ""
        }
    ],
    // 只匹配 VPS 有关的帖子
    reg: /\b(vps)\b/i,
    // 保存数据的文件路径
    filepath: "./db/v2ex_vps_topics.json",
    // 发送通知时的提示文本
    tag: TAG
};
(0, topicsFile_1.default)(taskInfo);
