"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ckeckV2exNotifily = exports.TAG = void 0;
// 检测通知
const http_1 = require("../../http");
const comm_1 = require("../base/comm");
const file_1 = require("../../file");
exports.TAG = "v2ex";
const noUrl = "https://www.v2ex.com/api/v2/notifications";
// 环境变量的键
const ENV_KEY = "V2EX_TOKEN";
const headers = {
    "Authorization": "Bearer " + process.env[ENV_KEY]
};
// 保存上次检测的的时间戳，避免重复通知
const dbPath = "./db/notifiy_ckecker_v2ex.json";
// 检测是否有通知
const ckeckV2exNotifily = async () => {
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
    // 读取已提示的帖子列表（ID 列表）
    const dbData = (0, file_1.readJSON)(dbPath);
    if (!dbData.lastCkeckNo) {
        dbData.lastCkeckNo = 0;
    }
    const index = data.result.findIndex(item => item.created > dbData.lastCkeckNo);
    if (index === -1) {
        return { tag: exports.TAG, data: "" };
    }
    // 保存到文件
    dbData.lastCkeckNo = data.result[index].created;
    (0, file_1.writeJSON)(dbPath, dbData);
    return { tag: exports.TAG, data: "https://v2ex.com/notifications" };
};
exports.ckeckV2exNotifily = ckeckV2exNotifily;
