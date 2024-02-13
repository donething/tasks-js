"use strict";
/**
 * 检测网站站内的通知
 * 注意设置各个任务的`环境变量`
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// new Env('站内通知检测')
// cron: */3 * * * *
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const puppeteer_1 = require("./utils/spider/base/puppeteer/puppeteer");
const comm_1 = require("./utils/comm");
const tgpush_1 = require("./utils/push/tgpush");
const bulletpush_1 = require("./utils/push/bulletpush");
const file_1 = require("./utils/file");
const hostloc_1 = __importDefault(require("./utils/spider/hostloc/hostloc"));
const task_1 = __importDefault(require("./utils/spider/hostloc/task"));
const v2ex_1 = __importDefault(require("./utils/spider/v2ex/v2ex"));
const task_2 = __importDefault(require("./utils/spider/v2ex/task"));
const TAG = "站内通知";
// 保存上次检测的的时间戳，避免重复通知
const dbPath = comm_1.BACKUPS + "/notify_ckecker.json";
// 执行检测
const startCheck = async () => {
    // 读取已提示的帖子列表（ID 列表）
    let fData = (0, file_1.readJSON)(dbPath, { v2ex: {}, hostloc: {}, nodeseek: {} });
    // Launch the browser and open a new blank page
    const browser = await puppeteer_core_1.default.launch(puppeteer_1.PupOptions);
    // const pageNS = await browser.newPage()
    const pageLoc = await browser.newPage();
    // pageNS.setDefaultTimeout(30 * 1000)
    pageLoc.setDefaultTimeout(5 * 1000);
    // 注意调用返回 Promise，而不是传递函数的引用，否则不会运行
    const promises = [{
            tag: hostloc_1.default.TAG,
            promise: task_1.default.ckNotification(pageLoc)
        }, {
            tag: v2ex_1.default.TAG,
            promise: task_2.default.ckNotification(fData.v2ex.data)
        }];
    const results = await Promise.allSettled(promises.map(p => p.promise));
    for (const [i, result] of results.entries()) {
        if (result.status === "rejected") {
            const err = (0, comm_1.parseAxiosErr)(result.reason);
            console.log("😱 执行失败：", promises[i].tag, err.message, err.stack);
            (0, tgpush_1.pushTGMsg)("执行失败", err.message, `${TAG} ${promises[i].tag}`);
            continue;
        }
        // 根据 data 判断是否有新通知
        if (result.value.url) {
            if (fData[promises[i].tag].hadNotify) {
                console.log("😂", promises[i].tag, "有新通知，但已发送过通知，此次不再发送");
                continue;
            }
            console.log("😊", promises[i].tag, "有新通知", result.value.url);
            (0, bulletpush_1.pushBulletNotify)(`${TAG} ${promises[i].tag}`, "有新通知", result.value.url);
            fData[promises[i].tag].hadNotify = true;
            if (result.value.extra) {
                fData[promises[i].tag].data = result.value.extra;
            }
        }
        else {
            console.log("😪", promises[i].tag, "没有新通知");
            fData[promises[i].tag].hadNotify = false;
        }
    }
    // 保存文件
    (0, file_1.writeJSON)(dbPath, fData);
    console.log("🤨", "已执行完毕");
    await browser.close();
};
startCheck();
