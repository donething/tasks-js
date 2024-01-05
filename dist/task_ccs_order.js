"use strict";
/**
 * 订购 CCS 的 VPS
 */
// new Env('订购CCS')
// cron: */3 * * * * *
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ccs_1 = __importDefault(require("./utils/vpsgrab/ccs/ccs"));
// 环境变量的键
const ENV_KEY = "CCS_ORDER_EMAIL_PSW";
// 执行
const startTask = async () => {
    if (!process.env[ENV_KEY]) {
        console.log(`请添加环境变量'${ENV_KEY}'，值为"邮箱,密码"，注意英文逗号。可用英文分号";"分隔多个账号，每号限购一台`);
        return;
    }
    const accounts = process.env[ENV_KEY].split(";");
    const users = accounts.map(accountStr => {
        // 处理密码可能包含分隔符","的情况
        const [email, ...pswList] = accountStr.split(",");
        return { email, psw: pswList.join(",") };
    });
    await ccs_1.default.startOrder(users);
};
startTask();
