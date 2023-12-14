"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 检测网站站内的通知
 * 注意设置各个任务的`环境变量`
 */
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const puppeteer_1 = require("./utils/spider/base/puppeteer/puppeteer");
const comm_1 = require("./utils/comm");
const award_1 = require("./utils/spider/nodeseek/award");
// new Env('站内通知检测')
// cron: 1 * * * *
const startCheck = async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer_core_1.default.launch(puppeteer_1.PupOptions);
    const page = await browser.newPage();
    page.setDefaultTimeout(60 * 1000);
    // 注意调用返回 Promise，而不是传递函数的引用，否则不会运行
    const results = await Promise.allSettled([(0, award_1.ckeckNotifily)(page)]);
    for (let result of results) {
        if (result.status === "rejected") {
            console.log("😱 执行失败：", (0, comm_1.parseAxiosErr)(result.reason).message, result.reason);
        }
    }
    await browser.close();
};
startCheck();
