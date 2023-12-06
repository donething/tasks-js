"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calStr = exports.isQL = void 0;
// 是否为青龙环境
exports.isQL = !!process.env.cmd_ql;
// 计算字符串型的数学计算
// @see https://stackoverflow.com/a/73250658
const calStr = (expression) => {
    return new Function(` return ${expression}`)();
};
exports.calStr = calStr;
