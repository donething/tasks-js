"use strict";
/**
 * 馒头PT
 * @see https://kp.m-team.cc/
 */
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("../../http");
const do_utils_1 = require("do-utils");
const comm_1 = require("../base/comm");
const TAG = "mteam";
const addr = "https://kp.m-team.cc";
const loginUrl = `${addr}/takelogin.php`;
// 环境变量的键
const ENV_KEY = "MT_USER_PWD";
// 开始 馒头PT 的任务
const startMtTask = async () => {
    if (!process.env[ENV_KEY]) {
        console.log("😢", TAG, (0, comm_1.envTip)(ENV_KEY));
        throw Error(`${TAG} ${(0, comm_1.envTip)(ENV_KEY)}`);
    }
    console.log("🤨", TAG, "开始执行任务");
    const [username, password] = process.env[ENV_KEY].split("//");
    // 登录
    await login(username, password);
    console.log("😊", TAG, "登录成功");
    // 完成任务发送的通知
    let message = "";
    // 每日登录，避免账号被清空
    message += "已完成 每日访问的任务";
    // 完成任务
    return { tag: TAG, data: message };
};
// 登录
// 当登录失败时，要获取 set-cookie 中的消息；成功时需要获取 set-cookie 设置的"tp"键值，再次请求时携带该 cookie
// 需要用 axios，而 fetch 无法读取到 set-cookie
const login = async (username, password) => {
    const data = `username=${username}&password=${password}`;
    const headers = {
        "origin": addr,
        "referer": `${addr}/login.php`,
        "user-agent": http_1.UserAgents.Win,
        "content-type": "application/x-www-form-urlencoded"
    };
    // 因为登录失败时会在`set-cookie`中返回提示
    // 所以不要重定向
    const resp = await http_1.mAxios.post(loginUrl, data, { headers, maxRedirects: 0 });
    // POST 登录后会返回 set-cookie
    const setCookies = resp.headers["set-cookie"];
    if (!setCookies) {
        throw Error("响应头中没有'set-cookie'值");
    }
    // 登录失败时，消息会通过响应 set-cookie 中的字段 flash_msg 显示
    const cookies = (0, do_utils_1.parseSetCookie)(setCookies);
    if (cookies["flash_msg"]) {
        throw Error(decodeURIComponent(String(cookies["flash_msg"])));
    }
    // 应该登录成功，验证
    const redirectResp = await http_1.mAxios.get(addr, { headers });
    const text = redirectResp.data;
    // 不包括用户名，登录失败
    if (!text.includes(username)) {
        console.log(TAG, "其它原因：\n", text);
        throw Error("其它原因");
    }
    // 登录成功
    return true;
};
exports.default = startMtTask;
