"use strict";
/**
 * 当有人出售 CC VPS 时，发送通知
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// new Env('CC有售')
// cron: */10 * * * * *
const notify_1 = __importDefault(require("./utils/notify"));
const hostloc = __importStar(require("./utils/spider/hostloc/hostloc"));
const nodeseek = __importStar(require("./utils/spider/nodeseek/nodeseek"));
const TAG = "CC有售";
// 任务信息
const taskInfo = {
    // 需要扫描帖子的网址及节点
    topicTaskInfos: [
        {
            tag: hostloc.TAG,
            fun: hostloc.parseLocSaleLJ,
            // VPS 综合讨论区
            node: "45"
        },
        {
            tag: nodeseek.TAG,
            fun: nodeseek.parseNsRss,
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
(0, notify_1.default)(taskInfo);
