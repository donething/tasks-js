"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAxiosErr = exports.Root = exports.TAG = void 0;
const axios_1 = require("axios");
exports.TAG = "青龙";
// 创建需要备份的文件的根目录
// 环境变量中不存在`DFILE_ROOT`时，将为 vps docker 映射的备份目录"/qlbackup"，方便备份
// 本地使用可以将环境变量`DFILE_ROOT`设为"./db"
// 使用：Root + "/topics.json"
exports.Root = process.env.DFILE_ROOT ? process.env.DFILE_ROOT : "/qlbackup";
// 如果是 AxiosError 类型的错误，提取 URL 到 message 中
const parseAxiosErr = (err) => {
    if (err instanceof axios_1.AxiosError && err.config) {
        return { ...err, message: `AxiosError: ${err.message} , "URL:" ${err.config.url}` };
    }
    return err;
};
exports.parseAxiosErr = parseAxiosErr;
