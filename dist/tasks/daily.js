"use strict";
/**
 * 执行每日任务
 * 注意设置各个任务的`环境变量`
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// new Env('每日任务')
// cron: 10 0 * * *
const award_1 = __importDefault(require("../utils/spider/hostloc/award"));
const mteam_1 = __importDefault(require("../utils/spider/mteam/mteam"));
const TAG = "每日任务";
// 开始每日任务
const startTask = async () => {
    // 执行任务
    console.log("🤨", TAG, "开始执行");
    // 注意调用返回 Promise，而不是传递函数的引用，否则不会运行
    await Promise.allSettled([(0, mteam_1.default)(), (0, award_1.default)()]);
    console.log("🤨", TAG, "已执行完毕");
};
startTask();
