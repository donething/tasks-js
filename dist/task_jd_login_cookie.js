"use strict";
/**
 * 登录京东，获取 Cookie。暂时不自动获取：电脑端获取Cookie没有pt_key，无用；移动端需要验证手机号
 * 注意设置环境变量
 * @see 使用 Puppeteer 自动输入京东滑动验证码 https://wxsm.space/2018/fill-jd-slider-captcha-by-puppeteer/
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// new Env('获取京东Cookie')
// cron: * * 30 2 *
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const puppeteer_1 = require("./utils/spider/base/puppeteer/puppeteer");
const do_utils_1 = require("do-utils");
const canvas_1 = require("canvas");
const simulateHumanMove_1 = __importDefault(require("./utils/spider/base/puppeteer/simulateHumanMove"));
const comm_1 = require("./utils/spider/base/comm");
const TAG = "jdcookie";
// 环境变量的键
const ENV_KEY = "JD_USER_PWD";
/**
 * combine rgba colors [r, g, b, a]
 * @param rgba1 底色
 * @param rgba2 遮罩色
 */
const combineRgba = (rgba1, rgba2) => {
    const [r1, g1, b1, a1] = rgba1;
    const [r2, g2, b2, a2] = rgba2;
    const a = a1 + a2 - a1 * a2;
    const r = (r1 * a1 + r2 * a2 - r1 * a1 * a2) / a;
    const g = (g1 * a1 + g2 * a2 - g1 * a1 * a2) / a;
    const b = (b1 * a1 + b2 * a2 - b1 * a1 * a2) / a;
    return [r, g, b, a];
};
/**
 * 判断两个颜色是否相似
 */
const tolerance = (rgba1, rgba2, t) => {
    const [r1, g1, b1] = rgba1;
    const [r2, g2, b2] = rgba2;
    return (r1 > r2 - t && r1 < r2 + t
        && g1 > g2 - t && g1 < g2 + t
        && b1 > b2 - t && b1 < b2 + t);
};
// 获取验证位置
const getVerifyPosition = (base64, actualWidth) => {
    return new Promise((resolve, reject) => {
        const canvas = (0, canvas_1.createCanvas)(1000, 1000);
        const ctx = canvas.getContext('2d');
        const img = new canvas_1.Image();
        img.onload = () => {
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
            const maskRgba = [0, 0, 0, 0.65];
            const t = 10; // 色差容忍值
            let prevPixelRgba = null;
            for (let x = 0; x < width; x++) {
                // 重新开始一列，清除上个像素的色值
                prevPixelRgba = null;
                for (let y = 0; y < height; y++) {
                    const rgba = ctx.getImageData(x, y, 1, 1).data;
                    if (prevPixelRgba) {
                        // 所有原图中的 alpha 通道值都是1
                        prevPixelRgba[3] = 1;
                        // @ts-ignore
                        const maskedPrevPixel = combineRgba(prevPixelRgba, maskRgba);
                        // 只要找到了一个色值匹配的像素点则直接返回，因为是自上而下，自左往右的查找，第一个像素点已经满足"最近"的条件
                        // @ts-ignore
                        if (tolerance(maskedPrevPixel, rgba, t)) {
                            resolve(x * actualWidth / width);
                            return;
                        }
                    }
                    else {
                        prevPixelRgba = rgba;
                    }
                }
            }
            // 没有找到任何符合条件的像素点
            resolve(0);
        };
        img.onerror = reject;
        img.src = base64;
    });
};
// 登录
const login = async (page, username, password) => {
    await page.goto("https://passport.jd.com/new/login.aspx");
    // 填充登录信息
    await page.waitForSelector("input#loginname");
    await page.type("input#loginname", username);
    await page.type("input#nloginpwd", password);
    await (0, do_utils_1.sleep)(200);
    // 登录
    await page.click("div.login-btn a");
    // 滑动验证
    await page.waitForSelector('div.JDJRV-bigimg > img');
    await (0, do_utils_1.sleep)(1000);
    // 验证码图片（带缺口）
    const imgElem = await page.$('div.JDJRV-bigimg > img');
    if (!imgElem) {
        throw Error("图片元素为空");
    }
    const imgBase64 = await page.evaluate(element => element.getAttribute('src'), imgElem);
    const actualWidth = await page.evaluate(element => parseInt(window.getComputedStyle(element).width), imgElem);
    if (!imgBase64) {
        throw Error("图片 base64 为空");
    }
    // 获取缺口左x坐标
    const distance = await getVerifyPosition(imgBase64, actualWidth);
    if (distance === 0) {
        throw Error("没有找到拼图的目标地点");
    }
    // 滑块
    const dragBtn = await page.$('.JDJRV-slide-btn');
    if (!dragBtn) {
        throw Error("滑块按钮元素为空");
    }
    const dragBtnPosition = await page.evaluate(element => {
        // 此处有 bug，无法直接返回 getBoundingClientRect()
        const { x, y, width, height } = element.getBoundingClientRect();
        return { x, y, width, height };
    }, dragBtn);
    // 按下位置设置在滑块中心
    const x = dragBtnPosition.x + dragBtnPosition.width / 2;
    const y = dragBtnPosition.y + dragBtnPosition.height / 2;
    // 滑到相应位置
    await page.mouse.move(x, y);
    await page.mouse.down();
    await (0, simulateHumanMove_1.default)(page, { x, y }, { x: x + distance, y: y + 50 });
    await page.mouse.up();
    // 等待验证结果
    await (0, do_utils_1.sleep)(8000);
    const msgElem = await page.$('div.msg-wrap');
    if (msgElem) {
        const msg = await page.evaluate(elem => elem.textContent?.trim(), msgElem);
        if (msg) {
            throw Error(`错误提示："${msg}"`);
        }
    }
    const nickElem = await page.$('li#ttbar-login a.nickname');
    if (!nickElem) {
        throw Error("没有出现昵称元素，登录失败");
    }
    return true;
};
// 获取京东 Cookie
const startJDCookie = async () => {
    if (!process.env[ENV_KEY]) {
        console.log("😢", TAG, (0, comm_1.envTip)(ENV_KEY));
        throw Error(`${TAG} ${(0, comm_1.envTip)(ENV_KEY)}`);
    }
    console.log("🤨", TAG, "开始执行任务");
    const [username, password] = process.env[ENV_KEY].split("//");
    let success = false;
    let cookie = "";
    // Launch the browser and open a new blank page
    const browser = await puppeteer_core_1.default.launch(puppeteer_1.PupOptions);
    for (let i = 0; i < 10; i++) {
        const page = await browser.newPage();
        page.setDefaultTimeout(puppeteer_1.pageTimeout);
        try {
            success = await login(page, username, password);
            const cookies = await page.cookies();
            console.log("Cookie", cookies);
            if (success) {
                break;
            }
        }
        catch (e) {
            console.log("登录失败：", e);
            if ((0, do_utils_1.typeError)(e).message.includes("账号名与密码不匹配")) {
                break;
            }
        }
    }
    await browser.close();
    // 最终登录失败
    if (!success) {
        console.log("最终，登录失败！");
        return;
    }
    console.log("登录成功！");
};
startJDCookie();
