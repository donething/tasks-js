"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evalText = exports.waitForNavNoThrow = exports.PupOptions = void 0;
const utils_1 = require("../../../utils");
// Puppeteer 选项
exports.PupOptions = {
    // 先安装 chromium 依赖包
    executablePath: utils_1.isQL ? "/usr/bin/chromium-browser" : "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: utils_1.isQL ? "new" : false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ["--no-sandbox", "--disabled-setupid-sandbox", "--start-maximized"]
};
/**
 * waitForNavigation 超时而不抛出错误
 *
 * 因为有些页面一直在请求，无法等待完成，所以会超时，此时可以避免抛出错误
 */
const waitForNavNoThrow = async (page, waitUntil = "networkidle0", timeout = 3000) => {
    try {
        await page.waitForNavigation({ waitUntil, timeout });
    }
    catch (err) {
        // 不抛出错误
    }
};
exports.waitForNavNoThrow = waitForNavNoThrow;
/**
 * 获取元素的 textContent
 */
const evalText = async (page, selector) => {
    const elem = await page.$(selector);
    if (!elem) {
        throw new Error("元素不存在");
    }
    const text = await page.evaluate(el => el.textContent, elem);
    return text || "";
};
exports.evalText = evalText;
