"use strict";
/**
 * cloudcone 黑色星期五活动是否已开启
 * 使用：需要设置环境变量：
 * "CC_COOKIE"值为 Cookie
 * "CC_TOKEN" 值为 token。可在网页端登录后再控制台执行`window._token`获取（重新登录后旧token会失效）
 */
Object.defineProperty(exports, "__esModule", { value: true });
// new Env('cloudcone黑五活动开启')
// cron: * * 30 2 *
const do_utils_1 = require("do-utils");
const tgpush_1 = require("./utils/tgpush");
const TAG = "CC黑五活动";
const host = "app.cloudcone.com";
const addr = `https://${host}`;
// 检测
const check = async () => {
    const response = await fetch(`${addr}/blackfriday/offers`);
    if (!response.ok) {
        throw Error(`获取活动状态的响应出错：${response.statusText}`);
    }
    const data = await response.json();
    if (data.status === 0) {
        console.log("😪 活动还未开启：", JSON.stringify(data));
        return;
    }
    console.log("😊 活动已开启：", data.message);
    const cookie = process.env.CC_COOKIE;
    const token = process.env.CC_TOKEN;
    if (!cookie || !token) {
        console.log("😢 Cookie、Token 为空，无法自动下订单。只发送通知提醒。");
        await (0, tgpush_1.pushTGMsg)("活动已开始", `${addr}/blackfriday`, TAG);
        return;
    }
    if (Object.keys(data.__data.vps_data).length === 0) {
        console.log("😢 没有需要订购的 VPS：\n", JSON.stringify(data));
        return;
    }
    // 订购
    for (const info of Object.values(data.__data.vps_data)) {
        // 同时下单，不同步等待
        order(cookie, token, info);
    }
};
// 下订单
const order = async (cookie, token, vpsInfo) => {
    const title = `[${vpsInfo.name}](${vpsInfo.id})`;
    const data = new FormData();
    data.append('os', "878");
    data.append('hostname', '');
    data.append('contract', 'Y');
    data.append('coupon-apply', '');
    data.append('coupon', '');
    data.append('plan', vpsInfo.id.toString());
    data.append('method', 'provision');
    data.append('_token', token);
    const headers = {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "x-requested-with": "XMLHttpRequest",
        "cookie": cookie,
        "Referer": addr,
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };
    const resp = await (0, do_utils_1.request)(`${addr}/ajax/vps`, data, { headers });
    const text = await resp.text();
    console.log(`🤨 自动下单 ${title} ${addr}${vpsInfo.order_url}\n`, `  🤨 响应码 ${resp.status} 内容：\n`, text);
};
// 开始
check().catch(err => {
    console.log(TAG, "抢购出错：", err);
    (0, tgpush_1.pushTGMsg)("抢购出错", err, TAG);
});
