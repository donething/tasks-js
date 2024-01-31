"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 检测通知
const http_1 = require("../../http");
const comm_1 = require("../base/comm");
const v2ex_1 = __importDefault(require("./v2ex"));
const noUrl = "https://www.v2ex.com/api/v2/notifications";
// 环境变量的键
const ENV_KEY = "V2EX_TOKEN";
const headers = {
    "Authorization": "Bearer " + process.env[ENV_KEY]
};
// 检测是否有通知
const ckNotification = async (lastCk) => {
    if (!process.env[ENV_KEY]) {
        console.log("😢", v2ex_1.default.TAG, (0, comm_1.envTip)(ENV_KEY));
        throw Error(`${v2ex_1.default.TAG} ${(0, comm_1.envTip)(ENV_KEY)}`);
    }
    const resp = await http_1.mAxios.get(noUrl, { headers });
    const data = resp.data;
    if (!data.success) {
        console.log(v2ex_1.default.TAG, "获取最新通知失败：", data.message);
        throw Error(`${v2ex_1.default.TAG} 获取最新通知失败：${data.message}`);
    }
    const index = data.result.findIndex(item => item.created > (lastCk || 0));
    if (index === -1) {
        return { url: "" };
    }
    return { url: "https://v2ex.com/notifications", extra: data.result[index].created };
};
// V2ex 的任务
const V2exTask = { ckNotification };
exports.default = V2exTask;
