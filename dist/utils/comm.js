"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAxiosErr = exports.BACKUPS = exports.TAG = void 0;
const axios_1 = require("axios");
exports.TAG = "青龙";
// 需要备份到网盘的目录
exports.BACKUPS = "./backups";
// 如果是 AxiosError 类型的错误，提取 URL 到 message 中
const parseAxiosErr = (err) => {
    if (err instanceof axios_1.AxiosError && err.config) {
        return { ...err, message: `AxiosError: ${err.message} , "URL:" ${err.config.url}` };
    }
    return err;
};
exports.parseAxiosErr = parseAxiosErr;
