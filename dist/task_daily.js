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
const task_1 = __importDefault(require("./utils/spider/hostloc/task"));
const mteam_1 = __importDefault(require("./utils/spider/mteam/mteam"));
const comm_1 = require("./utils/comm");
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const puppeteer_1 = require("./utils/spider/base/puppeteer/puppeteer");
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
    const results = await Promise.allSettled([(0, mteam_1.default)(), (0, task_1.default)(page)]);
    for (let result of results) {
        if (result.status === "rejected") {
            const err = (0, comm_1.parseAxiosErr)(result.reason);
            console.log("😱 执行失败：", err.message, err.stack);
            continue;
        }
        console.log("🤨 执行结果：", result.value.tag, result.value.data);
    }
    console.log("🤨", TAG, "已执行完毕");
    await browser.close();
};
startTask();
