"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ckeckV2exNotifily = exports.TAG = void 0;
// 检测通知
const http_1 = require("../../http");
const comm_1 = require("../base/comm");
exports.TAG = "v2ex";
const noUrl = "https://www.v2ex.com/api/v2/notifications";
// 环境变量的键
const ENV_KEY = "V2EX_TOKEN";
const headers = {
    "Authorization": "Bearer " + process.env[ENV_KEY]
};
// 检测是否有通知
const ckeckV2exNotifily = async (lastCk) => {
    if (!process.env[ENV_KEY]) {
        console.log("😢", exports.TAG, (0, comm_1.envTip)(ENV_KEY));
        throw Error(`${exports.TAG} ${(0, comm_1.envTip)(ENV_KEY)}`);
    }
    const resp = await http_1.mAxios.get(noUrl, { headers });
    const data = resp.data;
    if (!data.success) {
        console.log(exports.TAG, "获取最新通知失败：", data.message);
        throw Error(`${exports.TAG} 获取最新通知失败：${data.message}`);
    }
    const index = data.result.findIndex(item => item.created > (lastCk || 0));
    if (index === -1) {
        return { tag: exports.TAG, data: { url: "" } };
    }
    console.log(exports.TAG, "有新通知，创建时间：", data.result[index].created);
    return { tag: exports.TAG, data: { url: "https://v2ex.com/notifications", extra: data.result[index].created } };
};
exports.ckeckV2exNotifily = ckeckV2exNotifily;
