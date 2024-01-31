"use strict";
/**
 * 执行每日任务
 * 注意设置各个任务的`环境变量`
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
// new Env('每日任务')
// cron: 10 0 * * *
const hostloc = __importStar(require("./utils/spider/hostloc/task"));
const mteam = __importStar(require("./utils/spider/mteam/mteam"));
const comm_1 = require("./utils/comm");
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const puppeteer_1 = require("./utils/spider/base/puppeteer/puppeteer");
const tgpush_1 = require("./utils/push/tgpush");
const task_1 = __importDefault(require("./utils/spider/hostloc/task"));
const TAG = "每日任务";
// 开始每日任务
const startTask = async () => {
    // 执行任务
    console.log("🤨", TAG, "开始执行");
    // Launch the browser and open a new blank page
    const browser = await puppeteer_core_1.default.launch(puppeteer_1.PupOptions);
    const page = await browser.newPage();
    page.setDefaultTimeout(5 * 1000);
    // 注意调用返回 Promise，而不是传递函数的引用，否则不会运行
    const promises = [{
            tag: hostloc.TAG,
            promise: (0, task_1.default)(page)
        }, {
            tag: mteam.TAG,
            promise: mteam.startMtTask()
        }];
    const results = await Promise.allSettled(promises.map(p => p.promise));
    for (const [i, result] of results.entries()) {
        if (result.status === "rejected") {
            const err = (0, comm_1.parseAxiosErr)(result.reason);
            console.log("😱 执行失败：", promises[i].tag, err.message, err.stack);
            (0, tgpush_1.pushTGDaily)(TAG, `${promises[i].tag} 执行失败`, err.message);
            continue;
        }
        console.log("🤨 执行结果：", promises[i].tag, result.value);
        (0, tgpush_1.pushTGDaily)(TAG, `${promises[i].tag} 执行完成`, result.value);
    }
    console.log("🤨", TAG, "已执行完毕");
    await browser.close();
};
startTask();
