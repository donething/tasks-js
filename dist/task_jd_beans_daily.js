"use strict";
/**
 * 京豆变化
 * 展示最近几天内京豆的变化
 * 可以指定环境变量"JD_BEANS_RECENT_DAY"，设置获取的最近天数。不指定时为 7
 */
Object.defineProperty(exports, "__esModule", { value: true });
// new Env('京豆变化')
// cron: 5 13,22 * * *
const utils_1 = require("./utils/utils");
const do_utils_1 = require("do-utils");
const http_1 = require("./utils/http");
const tgpush_1 = require("./utils/tgpush");
const TAG = "京豆变化";
// 指定获取最近几天内，每日京东的变化量，不指定时为 7 天内
const jdBeansRecentDay = Number(process.env.JD_BEANS_RECENT_DAY) || 7;
// 获取过去几天内，每日京东的变化量，默认 30 天内。不包含支出的京豆
const getBeansInDay = async (ck, day) => {
    const headers = {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "cookie": ck,
        "origin": "https://bean.m.jd.com",
        "referer": "https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean",
        "user-agent": http_1.UserAgents.iOS,
        "x-requested-with": "XMLHttpRequest"
    };
    // 计算截止日期
    let expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - day + 1);
    let expiration = (0, do_utils_1.date)(expirationDate, "YYYY-mm-dd");
    console.log(`🤨 展示最近${day}天内京豆的变化，查询截止日：${expiration}`);
    console.log(`🤨 可设置环境变量"JD_BEANS_RECENT_DAY"来指定天数`);
    // 按天保存京豆的变化量，如{"2022-04-18": 130, "2022-04-19": 152}
    let beansMap = new Map();
    // 开始联网获取京豆变化
    let page = 1;
    getter: while (true) {
        const body = `page=${page}`;
        const method = "POST";
        const resp = await fetch("https://bean.m.jd.com/beanDetail/detail.json", { body, headers, method });
        const obj = await resp.json();
        if (obj.code && obj.code !== "0") {
            throw Error(`请求出错：${JSON.stringify(obj)}`);
        }
        // 已读取完所有页
        if (!obj.code || !obj.jingDetailList || obj.jingDetailList.length === 0) {
            !utils_1.isQL && console.log("🤨 已读取完所有页，返回");
            break;
        }
        // 计数
        for (let item of obj.jingDetailList) {
            // 提取 日期、京豆变化量
            let mdate = item.date.substring(0, item.date.indexOf(" "));
            // 如果该日期超出了指定的天数内，就可以停止继续获取京豆变化量了
            if (mdate < expiration) {
                break getter;
            }
            // 不计算支出的京豆
            if (Number(item.amount) < 0) {
                continue;
            }
            let num = Number(item.amount) + (beansMap.get(mdate) || 0);
            beansMap.set(mdate, num);
        }
        // 继续下一页
        !utils_1.isQL && console.log(`🤨 已获取第 ${page} 页，继续获取下一页`);
        page++;
    }
    // 如果某日没有增加京豆，依然创建日期并设值为 0
    for (let d = 0; d < day; d++) {
        let c = new Date();
        c.setDate(c.getDate() - d);
        let cText = (0, do_utils_1.date)(c, "YYYY-mm-dd");
        if (beansMap.get(cText) === undefined) {
            beansMap.set(cText, 0);
        }
    }
    return beansMap;
};
// 展示数据
const printBeans = async (ck, day) => {
    if (!ck) {
        throw Error("Cookie 为空或因失效已被禁用");
    }
    let beans = await getBeansInDay(ck, day || jdBeansRecentDay);
    let total = 0;
    let msg = "";
    beans.forEach((v, k) => {
        total += v;
        msg += `${k}: ${v}\n`;
    });
    if (beans.size === 0) {
        throw Error("没有获取到京豆的数据");
    }
    msg += `\n共 ${beans.size} 天，平均每天增加 ${Math.round(total / beans.size)} 个京豆\n`;
    console.log("😊", msg);
    await (0, tgpush_1.pushTGSign)(TAG, "结果", msg);
};
printBeans(process.env.JD_COOKIE || "").catch(err => {
    console.log(TAG, "获取出错：", err);
    (0, tgpush_1.pushTGMsg)(do_utils_1.TGSender.escapeMk(err), "获取出错", TAG);
});
