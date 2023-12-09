"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_1 = require("./file");
const tgpush_1 = require("./tgpush");
const utils_1 = require("./utils");
/**
 * 扫描并通知有关的新帖
 */
const notifyTopics = async (taskInfo) => {
    // 读取已提示的帖子列表（ID 列表）
    const data = (0, file_1.readJSON)(taskInfo.filepath);
    if (!data.topics) {
        data.topics = [];
    }
    // 临时保存已发送的帖子
    const hadSend = [];
    // 异步执行所有任务
    const tasks = taskInfo.topicTaskInfos.map(async (task) => {
        const topics = await task.fun(task.node);
        !utils_1.isQL && console.log(`获取的主题：\n`, topics);
        for (const t of topics) {
            // 只匹配指定帖子
            if (!taskInfo.reg.test(t.title)) {
                console.log(`😒 跳过帖子：`, t.title, "\n  ", t.url, "\n");
                continue;
            }
            // 已通知过帖子
            if (data.topics.find((item) => item.name === t.name && item.tid === t.tid)) {
                console.log(`😂 已通知过：`, t.title, "\n  ", t.url, "\n");
                continue;
            }
            console.log(`😊 通知新帖：`, t.title, "\n  ", t.url, "\n");
            const ok = await (0, tgpush_1.pushTGTopic)(taskInfo.tag, t);
            if (!ok) {
                continue;
            }
            // 保存到文件时，不记录 content 属性
            const tNoContent = { ...t, content: "" };
            hadSend.push(tNoContent);
        }
    });
    // 等待所有任务执行完毕
    const results = await Promise.allSettled(tasks);
    for (let result of results) {
        if (result.status === "rejected") {
            console.log("😱 执行失败：", result.reason);
        }
    }
    if (hadSend.length === 0) {
        console.log("🤨 本次没有发送相关的新帖");
        return;
    }
    // 保存文件
    data.topics.push(...hadSend);
    (0, file_1.writeJSON)(taskInfo.filepath, data);
    console.log("😊 已完成执行任务");
};
exports.default = notifyTopics;
