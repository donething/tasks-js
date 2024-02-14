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
// cron: 10 8 * * *
const comm_1 = require("./utils/comm");
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const puppeteer_1 = require("./utils/spider/base/puppeteer/puppeteer");
const tgpush_1 = require("./utils/push/tgpush");
const hostloc_1 = __importDefault(require("./utils/spider/hostloc/hostloc"));
const task_1 = __importDefault(require("./utils/spider/hostloc/task"));
const mteam_1 = __importDefault(require("./utils/spider/mteam/mteam"));
const TAG = "每日任务";
// 开始每日任务
const startTask = async () => {
    // 执行任务
    console.log("🤨", TAG, "开始执行");
    // Launch the browser and open a new blank page
    const browser = await puppeteer_core_1.default.launch(puppeteer_1.PupOptions);
    const page = await browser.newPage();
    page.setDefaultTimeout(puppeteer_1.pageTimeout);
    // 注意调用返回 Promise，而不是传递函数的引用，否则不会运行
    const promises = [{
            tag: hostloc_1.default.TAG,
            promise: task_1.default.startLocTask(page)
        }, {
            tag: mteam_1.default.TAG,
            promise: mteam_1.default.startTask()
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
