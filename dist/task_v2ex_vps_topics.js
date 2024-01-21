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
const notify_1 = __importDefault(require("./utils/notify"));
const v2ex_1 = __importDefault(require("./utils/spider/v2ex/v2ex"));
const comm_1 = require("./utils/comm");
const TAG = "v2ex";
// 任务信息
const taskInfo = {
    // 需要扫描帖子的网址及节点
    topicTaskInfos: [
        {
            tag: TAG,
            fun: v2ex_1.default,
            node: ""
        }
    ],
    // 只匹配 VPS 有关的帖子
    reg: /\b(vps)\b/i,
    // 保存数据的文件路径
    filepath: comm_1.Root + "/v2ex_vps_topics.json",
    // 发送通知时的提示文本
    tag: "VPS"
};
(0, notify_1.default)(taskInfo);
