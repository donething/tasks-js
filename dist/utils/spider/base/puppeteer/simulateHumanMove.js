"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const do_utils_1 = require("do-utils");
// 模拟人的滑动的三次贝塞尔曲线
const quadraticBezier = (start, end, control, t) => {
    const x = Math.pow(1 - t, 2) * start.x + 2 * (1 - t) * t * control.x + Math.pow(t, 2) * end.x;
    const y = Math.pow(1 - t, 2) * start.y + 2 * (1 - t) * t * control.y + Math.pow(t, 2) * end.y;
    return { x, y };
};
// 模拟人的滑动，用三次贝塞尔曲线
const simulateHumanMove = async (page, start, end, steps = 50) => {
    const distanceX = end.x - start.x;
    const distanceY = end.y - start.y;
    const controlX = start.x + distanceX / 2;
    // y 方向移动的随机数
    const controlY = start.y + distanceY / 2 + Math.random() * 100 - 50;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const { x, y } = quadraticBezier(start, end, { x: controlX, y: controlY }, t);
        await page.mouse.move(x, y);
        // 延时
        await (0, do_utils_1.sleep)(10);
    }
};
exports.default = simulateHumanMove;
