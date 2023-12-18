"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ckNodeSeekNotifily = exports.sign = exports.TAG = void 0;
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const comm_1 = require("../base/comm");
const puppeteer_1 = require("../base/puppeteer/puppeteer");
const do_utils_1 = require("do-utils");
exports.TAG = "nodeseek";
// 环境变量的键
const ENV_KEY = "NODESEEK_USER_PWD";
// 登录
const login = async (page) => {
    if (!process.env[ENV_KEY]) {
        console.log("😢", exports.TAG, (0, comm_1.envTip)(ENV_KEY));
        throw Error(`${exports.TAG} ${(0, comm_1.envTip)(ENV_KEY)}`);
    }
    const [username, password] = process.env[ENV_KEY].split("//");
    await page.goto("https://www.nodeseek.com/signIn.html");
    await (0, do_utils_1.sleep)(15 * 1000);
    for (let i = 0; i < 3; i++) {
        const iframe = await page.$('iframe');
        if (!iframe) {
            break;
        }
        const frame = await iframe.contentFrame();
        if (!await frame.$("input[type='checkbox']")) {
            break;
        }
        await frame.click("input[type='checkbox']");
        await (0, do_utils_1.sleep)(10 * 1000);
    }
    // 等待输入框出现后，输入用户名、密码后，点击“登录”
    await page.waitForSelector("form input#stacked-email");
    await page.type("form input#stacked-email", username);
    // await page.waitForSelector("#ls_password")
    await page.type("form input#stacked-password", password);
    await page.click("form div#login-btn-group button");
    // 等待登录后的页面
    await (0, puppeteer_1.waitForNavNoThrow)(page);
    // 检查是否登录成功
    const msg = await pickMsg(page);
    if (msg) {
        throw new Error(`登录失败："${msg}"`);
    }
    // 可能登录成功
    // 获取用户名的元素来验证
    const name = await (0, puppeteer_1.evalText)(page, "div.user-card a.Username");
    if (name !== username) {
        throw Error("解析的用户名和登录的用户名不匹配");
    }
    // 登录成功
    return true;
};
// 签到
const sign = async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer_core_1.default.launch(puppeteer_1.PupOptions);
    const page = await browser.newPage();
    page.setDefaultTimeout(60 * 1000);
    if (!(await login(page))) {
        return;
    }
    // 在浏览器上下文中发送 fetch 请求
    const resp = await page.evaluate(async () => {
        // 这里是在浏览器环境中执行的代码
        const resp = await fetch("https://www.nodeseek.com/api/attendance?random=true", {
            "referrer": "https://www.nodeseek.com/board",
            "body": null,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
        return await resp.json();
    });
    if (!resp.success) {
        console.log(exports.TAG, "签到失败：", resp.message);
        return;
    }
    console.log(exports.TAG, "签到成功：", resp.message);
};
exports.sign = sign;
// 检测通知
const ckNodeSeekNotifily = async (page) => {
    if (!(await login(page))) {
        return { tag: exports.TAG, data: "" };
    }
    await page.goto("https://www.nodeseek.com/");
    // 等待输入框出现后，输入用户名、密码后，点击“登录”
    await page.waitForSelector("div.user-card");
    const count = await (0, puppeteer_1.evalText)(page, "div.user-card span.notify-count");
    return { tag: exports.TAG, data: !!count ? "https://www.nodeseek.com/notification" : "" };
};
exports.ckNodeSeekNotifily = ckNodeSeekNotifily;
// 提取网页弹出的消息
const pickMsg = async (page) => {
    const msgElem = await page.$("div.msc-content .msc-title");
    if (msgElem) {
        const msg = await page.evaluate(el => el.textContent, msgElem);
        return (msg || "").trim();
    }
    return "";
};
