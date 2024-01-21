"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeJSON = exports.readJSON = void 0;
const fs_1 = __importDefault(require("fs"));
/**
 * 读取文件内容为 JSON
 */
const readJSON = (path, defautl) => {
    const tmp = defautl || {};
    if (!fs_1.default.existsSync(path)) {
        return tmp;
    }
    const text = fs_1.default.readFileSync(path);
    if (!text) {
        return tmp;
    }
    return JSON.parse(text.toString());
};
exports.readJSON = readJSON;
/**
 * 保存 JSON 文本到文件
 */
const writeJSON = (path, data) => {
    const dir = path.substring(0, path.lastIndexOf("/"));
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    fs_1.default.writeFileSync(path, JSON.stringify(data), { flag: "w" });
};
exports.writeJSON = writeJSON;
