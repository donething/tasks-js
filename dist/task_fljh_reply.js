"use strict";
/**
 * 福利江湖 回帖
 * 该站已墙
 */
Object.defineProperty(exports, "__esModule", { value: true });
// new Env('福利江湖 回帖')
// cron: */10 * * * *
const utils_1 = require("./utils/utils");
const file_1 = require("./utils/file");
const do_utils_1 = require("do-utils");
const http_1 = require("./utils/http");
const tgpush_1 = require("./utils/tgpush");
const html_1 = require("./utils/spider/base/html");
const TAG = "fljh";
// 保存数据的文件路径
const FILE_FLJH = "./db/fljh.json";
// 标签
// 回复的内容
const content = encodeURIComponent("感谢分享！！");
const host = "fulijianghu.org";
const addr = `https://${host}`;
// 获取帖子时，需要传递的信息
const urlInfo = {
    include: `title="暂不提醒"`,
    headers: {
        "referer": addr,
        "user-agent": http_1.UserAgents.Win
    },
    name: TAG,
    selector: "table#threadlisttableid tbody[id^='normalthread'] th.byg_th a.xst",
    tidReg: /tid=(\d+)/i,
    url: `${addr}/forum.php?mod=forumdisplay&fid=63&filter=sortall&sortall=1`
};
// 环境变量的键
const ENV_KEY = "FLJH_COOKIE";
// 开始任务
const start = async (cookie) => {
    // 注入初始 Cookie
    if (!cookie) {
        console.log(`😢 请先设置环境变量'${ENV_KEY}'`);
        return;
    }
    // 注入 Cookie
    http_1.mAxios.setCookie(cookie, addr);
    // 获取帖子列表（ID列表）
    let topics = [];
    try {
        topics = await (0, html_1.getHTMLTopics)(urlInfo);
    }
    catch (e) {
        console.log(TAG, "需检查 Cookie 是否已失效：", e);
        await (0, tgpush_1.pushTGMsg)("获取帖子出错", "需检查 Cookie 是否已失效", TAG);
        return;
    }
    // 读取已回复的帖子列表（ID列表）
    const data = (0, file_1.readJSON)(FILE_FLJH);
    if (!data.tids) {
        data.tids = [];
    }
    // 依次回复主题
    for (const [index, t] of topics.entries()) {
        const no = index + 1;
        if (data.tids.includes(t.tid)) {
            console.log(`😂 ${no}. 已回复过该贴(${t.tid})，跳过\n`);
            continue;
        }
        // 回帖、处理回帖的响应
        const err = await reply(t.tid);
        // 限制回帖次数。需要立即停止回复剩下的帖子
        if (err && err.message.includes("所在的用户组每小时限制发回帖")) {
            // 用 break 不用 return ，是为了退出循环后，保存数据
            console.log(`😢 ${no}. 限制每小时限制发回帖的次数，退出本次回帖：\n${err.message}\n`);
            break;
        }
        // 其它错误
        if (err) {
            console.log(`😱 回帖出错，帖子ID ${t.tid}：\n\n`, err);
            await (0, tgpush_1.pushTGMsg)("回帖出错", err.message, TAG);
            // 退出回帖，不用 return ，要保存数据
            break;
        }
        // 回帖成功
        console.log(`😊 ${no}. 回帖成功(${t.tid})\n`);
        data.tids.push(t.tid);
        // 默认要等待 15 秒，再继续回帖
        if (index !== topics.length - 1) {
            const sec = (0, do_utils_1.random)(20, 60);
            console.log(`😪 随机等待 ${sec} 秒后继续回复……\n`);
            await (0, do_utils_1.sleep)(sec * 1000);
        }
    }
    (0, file_1.writeJSON)(FILE_FLJH, data);
};
// 回帖
const reply = async (tid) => {
    const topicheaders = {
        "referer": addr,
        "user-agent": http_1.UserAgents.Win,
    };
    // 获取验证回答需要的 hashid
    const topicURL = `${addr}/forum.php?mod=viewthread&tid=${tid}`;
    const topicResp = await http_1.mAxios.get(topicURL, { headers: topicheaders });
    const hashText = topicResp.data;
    if (hashText.includes("您需要登录后才可以回帖")) {
        return new Error("需要登录");
    }
    let formhash = "";
    let hashid = "";
    let qaa = "";
    const formReg = /<input.+?name="formhash"\s+value="(.+?)"/s;
    const formMatch = hashText.match(formReg);
    if (!formMatch || formMatch.length <= 1) {
        return new Error(`提取 formhas 失败：${hashText}`);
    }
    formhash = formMatch[1];
    // 可能有验证回答，需要 hashid
    const hashReg = /<span\s+id="secqaa_(\S+)">/s;
    const hashMatch = hashText.match(hashReg);
    if (hashMatch && hashMatch.length >= 2) {
        hashid = hashMatch[1];
        // 获取验证回答
        qaa = await getSecqaa(hashid);
    }
    !utils_1.isQL && console.log(`🤨 提取帖子(${tid})的信息 formhash: ${formhash} , hashid: ${hashid} , qaa: ${qaa}`);
    // 回复
    const replyHeaders = {
        "origin": addr,
        "referer": addr,
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": http_1.UserAgents.Win
    };
    const replyURL = `${addr}/forum.php?mod=post&action=reply&replysubmit=yes&handlekey=fastpost&inajax=1&tid=${tid}`;
    const now = parseInt("" + Date.now() / 1000);
    const body = `message=${content}&secqaahash=${hashid}&secanswer=${qaa}&posttime=${now}&formhash=${formhash}&usesig=1&subject=++`;
    const replyResp = await http_1.mAxios.post(replyURL, { body, headers: replyHeaders });
    const replyText = await replyResp.data;
    // 解析响应
    // 回帖太频繁。等待一些秒数后再回复
    if (replyText.includes("两次发表间隔少于")) {
        await (0, do_utils_1.sleep)((0, do_utils_1.random)(20, 60));
        return await reply(tid);
    }
    // 回帖失败的其它原因
    if (!replyText.includes("回复发布成功")) {
        return new Error(`回帖失败：${replyText}`);
    }
    // 回帖成功
    return null;
};
/**
 * 获取验证回答
 * @param hashid 该验证的 ID。如"qSnm317v"，
 * 可以从回复页面的源码中获取：`<div class="mtm"><span id="secqaa_qSnm317v"></span>`
 */
const getSecqaa = async (hashid) => {
    const headers = {
        "referer": addr,
        "user-agent": http_1.UserAgents.Win
    };
    const url = `${addr}/misc.php?mod=secqaa&action=update&idhash=${hashid}&${Math.random()}`;
    const resp = await http_1.mAxios.get(url, { headers });
    const text = resp.data;
    const match = text.match(/class="vm"\s\/><\/span>'.+?'(?<expression>.+?)=/s);
    if (!match || !match.groups) {
        throw `提取验证回答失败：` + text;
    }
    const { expression } = match.groups;
    return String((0, utils_1.calStr)(expression));
};
//
// 执行
// 先设置环境变量 Cookie。如在本地 Powershell中：$env:XX_KEY="my cookie ..."
start(process.env[ENV_KEY] || "");
