"use strict";
/**
 * 检测网站站内的通知
 * 注意设置各个任务的`环境变量`
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const puppeteer_1 = require("./utils/spider/base/puppeteer/puppeteer");
const comm_1 = require("./utils/comm");
const task_1 = require("./utils/spider/hostloc/task");
const task_2 = require("./utils/spider/v2ex/task");
const tgpush_1 = require("./utils/tgpush");
const bulletpush_1 = require("./utils/bulletpush");
// new Env('站内通知检测')
// cron: */3 * * * *
const TAG = "站内通知";
// 执行检测
const startCheck = async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer_core_1.default.launch(puppeteer_1.PupOptions);
    const pageNS = await browser.newPage();
    const pageLoc = await browser.newPage();
    pageNS.setDefaultTimeout(30 * 1000);
    pageLoc.setDefaultTimeout(5 * 1000);
    // 注意调用返回 Promise，而不是传递函数的引用，否则不会运行
    const results = await Promise.allSettled([(0, task_1.ckeckLocNotifily)(pageLoc), (0, task_2.ckeckV2exNotifily)()]);
    for (let result of results) {
        if (result.status === "rejected") {
            const err = (0, comm_1.parseAxiosErr)(result.reason);
            console.log("😱 执行失败：", err.message, err.stack);
            (0, tgpush_1.pushTGMsg)("执行失败", err.message, TAG);
            continue;
        }
        // 根据 data 判断是否有新通知
        if (result.value.data) {
            console.log("😊 有新通知", result.value.tag, result.value.data);
            (0, bulletpush_1.pushBulletNotify)(TAG, result.value.tag, result.value.data);
        }
        else {
            console.log("😪", TAG, result.value.tag, "没有新通知");
        }
    }
    console.log("🤨", TAG, "已执行完毕");
    await browser.close();
};
startCheck();
