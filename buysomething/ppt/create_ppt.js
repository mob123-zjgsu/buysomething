const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "BuySomething Team";
pres.title = "BuySomething 期末项目展示";

// ========== 配色方案 ==========
const C = {
  navy: "1E2761",
  coral: "F96167",
  gold: "F9E795",
  white: "FFFFFF",
  offWhite: "F5F7FA",
  dark: "1A1A2E",
  gray: "6B7280",
  lightGray: "E5E7EB",
  teal: "0D9488",
  mint: "D1FAE5",
  blue: "3B82F6",
  purple: "8B5CF6",
  orange: "F59E0B",
  pink: "EC4899",
  green: "10B981",
  indigo: "6366F1",
};

const makeShadow = () => ({ type: "outer", blur: 6, offset: 2, angle: 135, color: "000000", opacity: 0.12 });

// ========== Slide 1: 封面 ==========
let s1 = pres.addSlide();
s1.background = { color: C.navy };
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.navy } });
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 4.2, w: 10, h: 1.425, fill: { color: C.coral } });
s1.addText("BuySomething", { x: 0.8, y: 1.0, w: 8.4, h: 1.2, fontSize: 52, fontFace: "Arial Black", color: C.white, bold: true });
s1.addText("优选购物平台", { x: 0.8, y: 2.1, w: 8.4, h: 0.8, fontSize: 32, fontFace: "Arial", color: C.gold });
s1.addText("基于云开发课程全栈实践", { x: 0.8, y: 2.9, w: 8.4, h: 0.6, fontSize: 22, fontFace: "Arial", color: C.white, bold: true });
s1.addText("微信小程序 + 腾讯云 CloudBase — 期末展示", { x: 0.8, y: 3.5, w: 8.4, h: 0.5, fontSize: 16, fontFace: "Arial", color: C.white, transparency: 25 });
s1.addText("2026年6月", { x: 0.8, y: 4.5, w: 4, h: 0.5, fontSize: 20, fontFace: "Arial", color: C.white, bold: true });
s1.addText("开发团队：psy & dd", { x: 5.2, y: 4.5, w: 4, h: 0.5, fontSize: 16, fontFace: "Arial", color: C.white, align: "right" });

// ========== Slide 2: 目录 ==========
let s2 = pres.addSlide();
s2.background = { color: C.offWhite };
s2.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.coral } });
s2.addText("目录", { x: 0.6, y: 0.4, w: 9, h: 0.8, fontSize: 36, fontFace: "Arial Black", color: C.navy, margin: 0 });
s2.addText("CONTENTS", { x: 0.6, y: 1.0, w: 9, h: 0.4, fontSize: 14, fontFace: "Arial", color: C.gray, margin: 0 });

const tocItems = [
  { num: "01", title: "项目概述", desc: "系统架构与功能全景" },
  { num: "02", title: "课堂 → 实践", desc: "13次课程作业如何在真实项目中落地" },
  { num: "03", title: "功能演示", desc: "三端核心功能 + 特色功能实录" },
  { num: "04", title: "工程落地", desc: "部署 / 监控 / 安全 / 团队协作" },
];
tocItems.forEach((item, i) => {
  const yPos = 1.5 + i * 0.95;
  s2.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: yPos, w: 8.8, h: 0.8, fill: { color: C.white }, shadow: makeShadow() });
  s2.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: yPos, w: 0.1, h: 0.8, fill: { color: C.coral } });
  s2.addText(item.num, { x: 0.9, y: yPos, w: 0.8, h: 0.8, fontSize: 24, fontFace: "Arial Black", color: C.coral, valign: "middle", margin: 0 });
  s2.addText(item.title, { x: 1.8, y: yPos, w: 3, h: 0.5, fontSize: 20, fontFace: "Arial", color: C.navy, bold: true, valign: "bottom", margin: 0 });
  s2.addText(item.desc, { x: 1.8, y: yPos + 0.4, w: 6, h: 0.4, fontSize: 13, fontFace: "Arial", color: C.gray, valign: "top", margin: 0 });
});

// ========== Slide 3: 项目概述 ==========
let s3 = pres.addSlide();
s3.background = { color: C.offWhite };
s3.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.coral } });
s3.addText("01  项目概述", { x: 0.6, y: 0.3, w: 9, h: 0.7, fontSize: 30, fontFace: "Arial Black", color: C.navy, margin: 0 });
s3.addText("PROJECT OVERVIEW", { x: 0.6, y: 0.85, w: 9, h: 0.3, fontSize: 12, fontFace: "Arial", color: C.gray, margin: 0 });

// 大数字统计
const stats = [
  { num: "25+", label: "云函数" },
  { num: "12", label: "数据库集合" },
  { num: "42", label: "小程序页面" },
  { num: "3", label: "角色端" },
];
stats.forEach((st, i) => {
  const xPos = 0.6 + i * 2.3;
  s3.addShape(pres.shapes.RECTANGLE, { x: xPos, y: 1.4, w: 2.1, h: 1.5, fill: { color: C.white }, shadow: makeShadow() });
  s3.addText(st.num, { x: xPos, y: 1.4, w: 2.1, h: 1.0, fontSize: 40, fontFace: "Arial Black", color: C.coral, align: "center", valign: "bottom", margin: 0 });
  s3.addText(st.label, { x: xPos, y: 2.3, w: 2.1, h: 0.5, fontSize: 14, fontFace: "Arial", color: C.gray, align: "center", valign: "middle", margin: 0 });
});

// 功能模块完成情况表
s3.addText("功能模块完成情况", { x: 0.6, y: 3.2, w: 9, h: 0.4, fontSize: 16, fontFace: "Arial", color: C.navy, bold: true, margin: 0 });
const tableRows = [
  [
    { text: "模块", options: { fill: { color: C.navy }, color: C.white, bold: true, fontSize: 11 } },
    { text: "已完成功能", options: { fill: { color: C.navy }, color: C.white, bold: true, fontSize: 11 } },
    { text: "完成率", options: { fill: { color: C.navy }, color: C.white, bold: true, fontSize: 11 } },
  ],
  [
    { text: "用户端", options: { fontSize: 11 } },
    { text: "登录/浏览/购物/订单/评价/收藏/地址/AI客服/商家聊天/售后/物流", options: { fontSize: 10 } },
    { text: "95%", options: { fontSize: 11, color: C.teal, bold: true } },
  ],
  [
    { text: "商家端", options: { fontSize: 11 } },
    { text: "入驻/商品管理/订单处理/售后审核/客服消息/角色切换", options: { fontSize: 10 } },
    { text: "90%", options: { fontSize: 11, color: C.teal, bold: true } },
  ],
  [
    { text: "管理端", options: { fontSize: 11 } },
    { text: "商家审核/商品审核/售后裁定/统计看板", options: { fontSize: 10 } },
    { text: "90%", options: { fontSize: 11, color: C.teal, bold: true } },
  ],
  [
    { text: "系统安全", options: { fontSize: 11 } },
    { text: "MD5+Salt/CI-CD/密钥扫描/数据库权限/安全规则", options: { fontSize: 10 } },
    { text: "85%", options: { fontSize: 11, color: C.teal, bold: true } },
  ],
];
s3.addTable(tableRows, { x: 0.6, y: 3.55, w: 8.8, colW: [1.2, 6.4, 1.2], border: { pt: 0.5, color: C.lightGray }, rowH: [0.35, 0.35, 0.35, 0.35, 0.35] });

// ========== Slide 4: 课堂→实践① 设计与架构 ==========
let s4 = pres.addSlide();
s4.background = { color: C.offWhite };
s4.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.coral } });
s4.addText("02  课堂 → 实践", { x: 0.6, y: 0.2, w: 9, h: 0.6, fontSize: 28, fontFace: "Arial Black", color: C.navy, margin: 0 });
s4.addText("① 设计与架构", { x: 0.6, y: 0.7, w: 9, h: 0.4, fontSize: 18, fontFace: "Arial", color: C.coral, margin: 0 });

const archTopics = [
  {
    hw: "hw12",
    title: "版本控制",
    taught: "Git配置、分支策略\nPR流程、Commit规范",
    practice: "GitHub仓库管理\nmain分支 + Git工作流\nPull Request代码审查",
    result: ".github/workflows/\nci.yml 自动化流水线",
    color: C.coral,
  },
  {
    hw: "hw13",
    title: "UI/UX 原型设计",
    taught: "Figma原型设计\n信息架构、设计规范\n色彩/排版/交互原则",
    practice: "Figma原型→三端42页面\n主色 #FF6B6B 珊瑚红\n辅助色 #4ECDC4 薄荷绿\n圆角渐变设计语言",
    result: "用户端+商家端+管理端\n完整视觉体系",
    color: C.blue,
  },
  {
    hw: "hw14",
    title: "软件架构设计",
    taught: "系统架构图绘制\n技术选型方法\n模块化设计原则",
    practice: "四层架构设计\n前端→SDK→计算→存储\nCloudBase Serverless\n云函数模块化拆分",
    result: "25+ 云函数\n12 个数据库集合",
    color: C.teal,
  },
];

archTopics.forEach((topic, i) => {
  const xPos = 0.4 + i * 3.15;
  // 卡片背景
  s4.addShape(pres.shapes.RECTANGLE, { x: xPos, y: 1.3, w: 2.95, h: 4.0, fill: { color: C.white }, shadow: makeShadow() });
  // 顶部色条 + 编号
  s4.addShape(pres.shapes.RECTANGLE, { x: xPos, y: 1.3, w: 2.95, h: 0.5, fill: { color: topic.color } });
  s4.addText(topic.hw + "  " + topic.title, { x: xPos, y: 1.3, w: 2.95, h: 0.5, fontSize: 13, fontFace: "Arial Black", color: C.white, align: "center", valign: "middle", margin: 0 });

  // 课堂
  s4.addText("课堂", { x: xPos + 0.15, y: 1.9, w: 1, h: 0.3, fontSize: 10, fontFace: "Arial Black", color: C.teal, margin: 0 });
  s4.addText(topic.taught, { x: xPos + 0.15, y: 2.15, w: 2.65, h: 0.9, fontSize: 10, fontFace: "Arial", color: C.gray, valign: "top", margin: 0, paraSpaceAfter: 2 });

  // 箭头分隔
  s4.addShape(pres.shapes.RECTANGLE, { x: xPos + 0.15, y: 3.1, w: 2.65, h: 0.02, fill: { color: C.lightGray } });
  s4.addText("↓", { x: xPos + 1.2, y: 3.0, w: 0.5, h: 0.3, fontSize: 14, fontFace: "Arial Black", color: C.coral, align: "center", valign: "middle", margin: 0 });

  // 实践
  s4.addText("实践", { x: xPos + 0.15, y: 3.25, w: 1, h: 0.3, fontSize: 10, fontFace: "Arial Black", color: C.coral, margin: 0 });
  s4.addText(topic.practice, { x: xPos + 0.15, y: 3.5, w: 2.65, h: 1.1, fontSize: 10, fontFace: "Arial", color: C.gray, valign: "top", margin: 0, paraSpaceAfter: 2 });

  // 成果标签
  s4.addShape(pres.shapes.RECTANGLE, { x: xPos + 0.15, y: 4.7, w: 2.65, h: 0.45, fill: { color: topic.color, transparency: 85 } });
  s4.addText(topic.result, { x: xPos + 0.15, y: 4.7, w: 2.65, h: 0.45, fontSize: 9, fontFace: "Arial", color: C.navy, bold: true, valign: "middle", margin: 0 });
});

// ========== Slide 5: 课堂→实践② 开发实现 ==========
let s5 = pres.addSlide();
s5.background = { color: C.offWhite };
s5.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.coral } });
s5.addText("02  课堂 → 实践", { x: 0.6, y: 0.2, w: 9, h: 0.6, fontSize: 28, fontFace: "Arial Black", color: C.navy, margin: 0 });
s5.addText("② 开发实现", { x: 0.6, y: 0.7, w: 9, h: 0.4, fontSize: 18, fontFace: "Arial", color: C.coral, margin: 0 });

const devTopics = [
  {
    hw: "hw15",
    title: "前端开发",
    taught: "WXML/WXSS/JS\n组件化开发\n响应式布局\n数据绑定与事件",
    practice: "42个小程序页面\n三端UI完整实现\n组件复用 (商品卡片等)\n级联地址选择器",
    result: "用户端 21 页\n商家端 11 页\n管理端 10 页",
    color: C.coral,
  },
  {
    hw: "hw16",
    title: "后端开发",
    taught: "API 设计原则\n数据库 CRUD\n接口鉴权\n错误处理",
    practice: "25+ 云函数开发\n12 集合 NoSQL 设计\nMD5+Salt 密码安全\n统一返回格式 {code, data}",
    result: "8 大业务模块\n覆盖全部核心流程",
    color: C.blue,
  },
  {
    hw: "hw17",
    title: "前后端联调",
    taught: "CORS 配置\n接口对接调试\n环境变量管理\n异常处理",
    practice: "wx.cloud.callFunction\nCloudBase SDK 直连\n统一错误码体系\nVercel 演示站对接",
    result: "三端全部联通\n零硬编码环境变量",
    color: C.teal,
  },
];

devTopics.forEach((topic, i) => {
  const xPos = 0.4 + i * 3.15;
  s5.addShape(pres.shapes.RECTANGLE, { x: xPos, y: 1.3, w: 2.95, h: 4.0, fill: { color: C.white }, shadow: makeShadow() });
  s5.addShape(pres.shapes.RECTANGLE, { x: xPos, y: 1.3, w: 2.95, h: 0.5, fill: { color: topic.color } });
  s5.addText(topic.hw + "  " + topic.title, { x: xPos, y: 1.3, w: 2.95, h: 0.5, fontSize: 13, fontFace: "Arial Black", color: C.white, align: "center", valign: "middle", margin: 0 });

  s5.addText("课堂", { x: xPos + 0.15, y: 1.9, w: 1, h: 0.3, fontSize: 10, fontFace: "Arial Black", color: C.teal, margin: 0 });
  s5.addText(topic.taught, { x: xPos + 0.15, y: 2.15, w: 2.65, h: 0.9, fontSize: 10, fontFace: "Arial", color: C.gray, valign: "top", margin: 0, paraSpaceAfter: 2 });

  s5.addShape(pres.shapes.RECTANGLE, { x: xPos + 0.15, y: 3.1, w: 2.65, h: 0.02, fill: { color: C.lightGray } });
  s5.addText("↓", { x: xPos + 1.2, y: 3.0, w: 0.5, h: 0.3, fontSize: 14, fontFace: "Arial Black", color: C.coral, align: "center", valign: "middle", margin: 0 });

  s5.addText("实践", { x: xPos + 0.15, y: 3.25, w: 1, h: 0.3, fontSize: 10, fontFace: "Arial Black", color: C.coral, margin: 0 });
  s5.addText(topic.practice, { x: xPos + 0.15, y: 3.5, w: 2.65, h: 1.1, fontSize: 10, fontFace: "Arial", color: C.gray, valign: "top", margin: 0, paraSpaceAfter: 2 });

  s5.addShape(pres.shapes.RECTANGLE, { x: xPos + 0.15, y: 4.7, w: 2.65, h: 0.45, fill: { color: topic.color, transparency: 85 } });
  s5.addText(topic.result, { x: xPos + 0.15, y: 4.7, w: 2.65, h: 0.45, fontSize: 9, fontFace: "Arial", color: C.navy, bold: true, valign: "middle", margin: 0 });
});

// ========== Slide 6: 课堂→实践③ AI集成与测试 ==========
let s6 = pres.addSlide();
s6.background = { color: C.offWhite };
s6.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.coral } });
s6.addText("02  课堂 → 实践", { x: 0.6, y: 0.2, w: 9, h: 0.6, fontSize: 28, fontFace: "Arial Black", color: C.navy, margin: 0 });
s6.addText("③ AI集成与测试", { x: 0.6, y: 0.7, w: 9, h: 0.4, fontSize: 18, fontFace: "Arial", color: C.coral, margin: 0 });

const aiTestTopics = [
  {
    hw: "hw18",
    title: "AI 功能集成",
    taught: "LLM API 调用方法\nDeepSeek 模型\nPrompt 工程\n流式响应处理",
    practice: "接入 DeepSeek API\n商品上下文自动注入\n系统提示词 + 对话历史\nStreaming 流式输出",
    result: "7x24 AI 客服\n商品智能问答",
    color: C.pink,
  },
  {
    hw: "hw19",
    title: "软件测试",
    taught: "单元测试方法\nAPI 接口测试\nMock 数据技术\n测试覆盖率",
    practice: "云函数单元测试\nAPI 端点集成测试\n测试数据 Mock\n核心流程覆盖验证",
    result: "tests/ 目录\n核心模块可测试",
    color: C.green,
  },
];

// 左侧大卡片 (AI)
const t0 = aiTestTopics[0];
s6.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 1.3, w: 4.6, h: 4.0, fill: { color: C.white }, shadow: makeShadow() });
s6.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 1.3, w: 4.6, h: 0.5, fill: { color: t0.color } });
s6.addText(t0.hw + "  " + t0.title, { x: 0.4, y: 1.3, w: 4.6, h: 0.5, fontSize: 15, fontFace: "Arial Black", color: C.white, align: "center", valign: "middle", margin: 0 });

// 两列布局
s6.addText("课堂", { x: 0.6, y: 1.95, w: 1, h: 0.3, fontSize: 11, fontFace: "Arial Black", color: C.teal, margin: 0 });
s6.addText(t0.taught, { x: 0.6, y: 2.2, w: 2.0, h: 1.2, fontSize: 11, fontFace: "Arial", color: C.gray, valign: "top", margin: 0, paraSpaceAfter: 3 });

s6.addText("实践", { x: 2.8, y: 1.95, w: 1, h: 0.3, fontSize: 11, fontFace: "Arial Black", color: C.coral, margin: 0 });
s6.addText(t0.practice, { x: 2.8, y: 2.2, w: 2.0, h: 1.2, fontSize: 11, fontFace: "Arial", color: C.gray, valign: "top", margin: 0, paraSpaceAfter: 3 });

s6.addShape(pres.shapes.RECTANGLE, { x: 2.6, y: 1.95, w: 0.02, h: 1.5, fill: { color: C.lightGray } });

// AI 成果
s6.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 3.6, w: 4.2, h: 0.5, fill: { color: t0.color, transparency: 85 } });
s6.addText(t0.result, { x: 0.6, y: 3.6, w: 4.2, h: 0.5, fontSize: 12, fontFace: "Arial Black", color: C.navy, valign: "middle", margin: 0 });

// AI 提示词示意
s6.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 4.3, w: 4.2, h: 0.85, fill: { color: C.dark } });
s6.addText([
  { text: "Prompt 示例\n", options: { fontSize: 9, color: C.gold, bold: true } },
  { text: "你是优选购物客服小优\n当前商品：纯棉白色短袖T恤\n价格：69元 | 颜色：白色", options: { fontSize: 9, color: C.white, transparency: 20 } },
], { x: 0.8, y: 4.35, w: 3.8, h: 0.75, valign: "top", margin: 0 });

// 右侧卡片 (测试)
const t1 = aiTestTopics[1];
s6.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.3, w: 4.4, h: 4.0, fill: { color: C.white }, shadow: makeShadow() });
s6.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.3, w: 4.4, h: 0.5, fill: { color: t1.color } });
s6.addText(t1.hw + "  " + t1.title, { x: 5.2, y: 1.3, w: 4.4, h: 0.5, fontSize: 15, fontFace: "Arial Black", color: C.white, align: "center", valign: "middle", margin: 0 });

s6.addText("课堂", { x: 5.4, y: 1.95, w: 1, h: 0.3, fontSize: 11, fontFace: "Arial Black", color: C.teal, margin: 0 });
s6.addText(t1.taught, { x: 5.4, y: 2.2, w: 2.0, h: 1.2, fontSize: 11, fontFace: "Arial", color: C.gray, valign: "top", margin: 0, paraSpaceAfter: 3 });

s6.addText("实践", { x: 7.6, y: 1.95, w: 1, h: 0.3, fontSize: 11, fontFace: "Arial Black", color: C.coral, margin: 0 });
s6.addText(t1.practice, { x: 7.6, y: 2.2, w: 1.8, h: 1.2, fontSize: 11, fontFace: "Arial", color: C.gray, valign: "top", margin: 0, paraSpaceAfter: 3 });

s6.addShape(pres.shapes.RECTANGLE, { x: 7.4, y: 1.95, w: 0.02, h: 1.5, fill: { color: C.lightGray } });

s6.addShape(pres.shapes.RECTANGLE, { x: 5.4, y: 3.6, w: 4.0, h: 0.5, fill: { color: t1.color, transparency: 85 } });
s6.addText(t1.result, { x: 5.4, y: 3.6, w: 4.0, h: 0.5, fontSize: 12, fontFace: "Arial Black", color: C.navy, valign: "middle", margin: 0 });

// 测试流程示意
s6.addShape(pres.shapes.RECTANGLE, { x: 5.4, y: 4.3, w: 4.0, h: 0.85, fill: { color: C.dark } });
s6.addText([
  { text: "测试流程\n", options: { fontSize: 9, color: C.gold, bold: true } },
  { text: "Mock数据 → 调用云函数 → 断言返回值\n覆盖：注册/登录/商品/订单核心流程", options: { fontSize: 9, color: C.white, transparency: 20 } },
], { x: 5.6, y: 4.35, w: 3.6, h: 0.75, valign: "top", margin: 0 });

// ========== Slide 7: 课堂→实践④ 运维安全 ==========
let s7 = pres.addSlide();
s7.background = { color: C.offWhite };
s7.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.coral } });
s7.addText("02  课堂 → 实践", { x: 0.6, y: 0.2, w: 9, h: 0.6, fontSize: 28, fontFace: "Arial Black", color: C.navy, margin: 0 });
s7.addText("④ 运维安全", { x: 0.6, y: 0.7, w: 9, h: 0.4, fontSize: 18, fontFace: "Arial", color: C.coral, margin: 0 });

// 左侧：5个作业卡片
const opsTopics = [
  {
    hw: "hw20",
    title: "CI/CD 自动化",
    taught: "GitHub Actions\n自动构建部署\n流水线配置",
    practice: "ESLint 代码检查\nGitleaks 密钥扫描\nnpm audit 漏洞检测",
    color: C.coral,
  },
  {
    hw: "hw21",
    title: "安全审查",
    taught: "密码安全策略\n注入攻击防护\n密钥泄露扫描",
    practice: "MD5+Salt 多次哈希\n全部 PRIVATE 集合\nGitleaks 预提交钩子",
    color: C.purple,
  },
  {
    hw: "hw22",
    title: "Docker 容器化",
    taught: "Dockerfile 编写\ndocker-compose\n多阶段构建",
    practice: "Express + MongoDB\nHEALTHCHECK 自愈\ndocker-compose 编排",
    color: C.blue,
  },
  {
    hw: "hw23",
    title: "云服务部署",
    taught: "Vercel/CloudBase\nRailway 部署\n环境变量管理",
    practice: "CloudBase 云函数\nVercel 演示站\n零硬编码配置",
    color: C.teal,
  },
  {
    hw: "hw24",
    title: "监控配置",
    taught: "健康检查端点\n结构化日志\n指标收集方法",
    practice: "/health 端点\nJSON 格式日志\nMetricsCollector",
    color: C.orange,
  },
];

opsTopics.forEach((topic, i) => {
  const xPos = 0.3 + i * 1.92;
  s7.addShape(pres.shapes.RECTANGLE, { x: xPos, y: 1.2, w: 1.78, h: 2.8, fill: { color: C.white }, shadow: makeShadow() });
  s7.addShape(pres.shapes.RECTANGLE, { x: xPos, y: 1.2, w: 1.78, h: 0.45, fill: { color: topic.color } });
  s7.addText(topic.hw, { x: xPos, y: 1.2, w: 1.78, h: 0.25, fontSize: 9, fontFace: "Arial", color: C.white, align: "center", valign: "bottom", margin: 0 });
  s7.addText(topic.title, { x: xPos, y: 1.38, w: 1.78, h: 0.27, fontSize: 11, fontFace: "Arial Black", color: C.white, align: "center", valign: "top", margin: 0 });

  s7.addText("课堂", { x: xPos + 0.08, y: 1.75, w: 1.6, h: 0.2, fontSize: 9, fontFace: "Arial Black", color: C.teal, margin: 0 });
  s7.addText(topic.taught, { x: xPos + 0.08, y: 1.95, w: 1.6, h: 0.75, fontSize: 9, fontFace: "Arial", color: C.gray, valign: "top", margin: 0, paraSpaceAfter: 1 });

  s7.addShape(pres.shapes.RECTANGLE, { x: xPos + 0.08, y: 2.7, w: 1.6, h: 0.02, fill: { color: C.lightGray } });

  s7.addText("实践", { x: xPos + 0.08, y: 2.8, w: 1.6, h: 0.2, fontSize: 9, fontFace: "Arial Black", color: C.coral, margin: 0 });
  s7.addText(topic.practice, { x: xPos + 0.08, y: 3.0, w: 1.6, h: 0.85, fontSize: 9, fontFace: "Arial", color: C.gray, valign: "top", margin: 0, paraSpaceAfter: 1 });
});

// 底部：真实返回结果展示（两列）
s7.addText("实际返回结果", { x: 0.6, y: 4.15, w: 9, h: 0.35, fontSize: 14, fontFace: "Arial Black", color: C.navy, margin: 0 });

// 左：CI/CD 运行结果
s7.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 4.55, w: 4.5, h: 0.95, fill: { color: C.dark } });
s7.addText([
  { text: "CI/CD — GitHub Actions 运行结果\n", options: { fontSize: 9, color: C.coral, bold: true } },
  { text: "✓ backend  — ESLint cloudfunctions/*/index.js passed\n", options: { fontSize: 8, color: C.green } },
  { text: "✓ frontend — ESLint pages/*/*.js passed\n", options: { fontSize: 8, color: C.green } },
  { text: "✓ gitleaks — No secrets detected", options: { fontSize: 8, color: C.green } },
], { x: 0.6, y: 4.6, w: 4.1, h: 0.85, valign: "top", margin: 0 });

// 右：/health 返回结果
s7.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 4.55, w: 4.5, h: 0.95, fill: { color: C.dark } });
s7.addText([
  { text: "GET /health 返回结果\n", options: { fontSize: 9, color: C.orange, bold: true } },
  { text: '{"status":"healthy","version":"1.0.0",\n', options: { fontSize: 8, color: C.white, transparency: 15 } },
  { text: ' "checks":{"database":{"status":"healthy",\n', options: { fontSize: 8, color: C.white, transparency: 15 } },
  { text: '  "responseTime":12,"collections":10}}}', options: { fontSize: 8, color: C.white, transparency: 15 } },
], { x: 5.3, y: 4.6, w: 4.1, h: 0.85, valign: "top", margin: 0 });

// ========== Slide 8: 功能演示 — 三端全景 ==========
let s8 = pres.addSlide();
s8.background = { color: C.offWhite };
s8.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.coral } });
s8.addText("03  功能演示 — 三端全景", { x: 0.6, y: 0.3, w: 9, h: 0.6, fontSize: 26, fontFace: "Arial Black", color: C.navy, margin: 0 });

const roles = [
  {
    name: "用户端",
    color: C.coral,
    features: ["首页推荐 / 分类浏览 / 搜索", "商品详情 + 规格选择", "购物车 + 下单结算", "地址管理 (级联选择器)", "订单列表 + 物流追踪", "AI客服 + 商家聊天", "评价 + 收藏 + 售后申请"],
  },
  {
    name: "商家端",
    color: C.teal,
    features: ["商家工作台", "商品上架 / 管理", "订单管理", "售后审核 (同意/拒绝)", "客服消息 (实时回复)", "角色一键切换"],
  },
  {
    name: "管理端",
    color: C.purple,
    features: ["数据统计看板", "商家入驻审核", "商品上架审核", "售后裁定 (同意/驳回)", "角色一键切换"],
  },
];
roles.forEach((role, i) => {
  const xPos = 0.5 + i * 3.2;
  s8.addShape(pres.shapes.RECTANGLE, { x: xPos, y: 1.1, w: 3.0, h: 4.2, fill: { color: C.white }, shadow: makeShadow() });
  s8.addShape(pres.shapes.RECTANGLE, { x: xPos, y: 1.1, w: 3.0, h: 0.55, fill: { color: role.color } });
  s8.addText(role.name, { x: xPos, y: 1.1, w: 3.0, h: 0.55, fontSize: 18, fontFace: "Arial Black", color: C.white, align: "center", valign: "middle", margin: 0 });
  const featTexts = role.features.map(f => ({ text: f, options: { bullet: true, breakLine: true, fontSize: 11, color: C.gray } }));
  s8.addText(featTexts, { x: xPos + 0.15, y: 1.8, w: 2.7, h: 3.4, margin: 0, paraSpaceAfter: 6 });
});

// ========== Slide 9: 特色功能 ==========
let s9 = pres.addSlide();
s9.background = { color: C.navy };
s9.addText("03  特色功能", { x: 0.6, y: 0.2, w: 9, h: 0.6, fontSize: 26, fontFace: "Arial Black", color: C.white, margin: 0 });

const specialFeatures = [
  {
    title: "AI 智能客服",
    items: ["DeepSeek 大模型接入", "商品上下文自动注入", "流式响应 Streaming", "对话历史记忆"],
    color: C.pink,
  },
  {
    title: "商家实时聊天",
    items: ["用户 ↔ 商家消息", "5秒轮询自动刷新", "会话列表 + 未读标记", "按商品维度隔离"],
    color: C.blue,
  },
  {
    title: "物流模拟系统",
    items: ["地图路线可视化", "避海算法绕行", "按天推进模拟", "15天自动签收"],
    color: C.teal,
  },
  {
    title: "售后三方仲裁",
    items: ["用户申请 → 商家审核", "拒绝 → 管理员裁定", "三权分立防恶意", "5种售后状态追溯"],
    color: C.purple,
  },
];

specialFeatures.forEach((feat, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const xPos = 0.5 + col * 4.7;
  const yPos = 1.0 + row * 2.25;

  s9.addShape(pres.shapes.RECTANGLE, { x: xPos, y: yPos, w: 4.4, h: 2.05, fill: { color: "FFFFFF", transparency: 88 }, shadow: makeShadow() });
  s9.addShape(pres.shapes.RECTANGLE, { x: xPos, y: yPos, w: 0.1, h: 2.05, fill: { color: feat.color } });
  s9.addText(feat.title, { x: xPos + 0.25, y: yPos + 0.1, w: 4, h: 0.4, fontSize: 16, fontFace: "Arial Black", color: feat.color, margin: 0 });
  const itemTexts = feat.items.map(it => ({ text: it, options: { bullet: true, breakLine: true, fontSize: 11, color: C.white } }));
  s9.addText(itemTexts, { x: xPos + 0.25, y: yPos + 0.55, w: 4, h: 1.4, margin: 0, paraSpaceAfter: 4 });
});

// ========== Slide 10: 工程落地一览 ==========
let s10 = pres.addSlide();
s10.background = { color: C.offWhite };
s10.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.coral } });
s10.addText("04  工程落地一览", { x: 0.6, y: 0.2, w: 9, h: 0.6, fontSize: 26, fontFace: "Arial Black", color: C.navy, margin: 0 });
s10.addText("ENGINEERING PRACTICES", { x: 0.6, y: 0.7, w: 9, h: 0.3, fontSize: 12, fontFace: "Arial", color: C.gray, margin: 0 });

const engTable = [
  [
    { text: "领域", options: { fill: { color: C.navy }, color: C.white, bold: true, fontSize: 11, align: "center" } },
    { text: "做了什么", options: { fill: { color: C.navy }, color: C.white, bold: true, fontSize: 11 } },
    { text: "关键工具/技术", options: { fill: { color: C.navy }, color: C.white, bold: true, fontSize: 11 } },
    { text: "对应作业", options: { fill: { color: C.navy }, color: C.white, bold: true, fontSize: 11, align: "center" } },
  ],
  [
    { text: "部署", options: { fontSize: 11, bold: true, color: C.teal } },
    { text: "CloudBase 云函数 + Vercel 演示站双平台", options: { fontSize: 10 } },
    { text: "wx-server-sdk / vercel.json / .cjs Handler", options: { fontSize: 10 } },
    { text: "hw23", options: { fontSize: 10, align: "center" } },
  ],
  [
    { text: "容器化", options: { fontSize: 11, bold: true, color: C.blue } },
    { text: "docker-compose 编排 Express + MongoDB", options: { fontSize: 10 } },
    { text: "Dockerfile / HEALTHCHECK / mongo-init.js", options: { fontSize: 10 } },
    { text: "hw22", options: { fontSize: 10, align: "center" } },
  ],
  [
    { text: "CI/CD", options: { fontSize: 11, bold: true, color: C.coral } },
    { text: "GitHub Actions 自动检查 + ESLint + Gitleaks", options: { fontSize: 10 } },
    { text: "ci.yml / eslint.config.js / gitleaks.toml", options: { fontSize: 10 } },
    { text: "hw12,20", options: { fontSize: 10, align: "center" } },
  ],
  [
    { text: "安全", options: { fontSize: 11, bold: true, color: C.purple } },
    { text: "MD5+Salt 密码 / PRIVATE 集合 / 密钥扫描 / 日志脱敏", options: { fontSize: 10 } },
    { text: "crypto-md5 / 安全规则 / Gitleaks / 手机号****", options: { fontSize: 10 } },
    { text: "hw21", options: { fontSize: 10, align: "center" } },
  ],
  [
    { text: "监控", options: { fontSize: 11, bold: true, color: C.orange } },
    { text: "/health 端点 / JSON 结构化日志 / MetricsCollector", options: { fontSize: 10 } },
    { text: "health 云函数 / JSON log / 内存指标统计", options: { fontSize: 10 } },
    { text: "hw24", options: { fontSize: 10, align: "center" } },
  ],
  [
    { text: "测试", options: { fontSize: 11, bold: true, color: C.green } },
    { text: "云函数单元测试 + API 接口集成测试", options: { fontSize: 10 } },
    { text: "tests/ / Mock 数据 / 核心流程断言", options: { fontSize: 10 } },
    { text: "hw19", options: { fontSize: 10, align: "center" } },
  ],
];
s10.addTable(engTable, { x: 0.4, y: 1.1, w: 9.2, colW: [1.0, 3.4, 3.2, 1.0], border: { pt: 0.5, color: C.lightGray }, rowH: [0.38, 0.38, 0.38, 0.38, 0.38, 0.38, 0.38] });

// 底部架构图 (简化版)
s10.addText("系统架构", { x: 0.6, y: 3.95, w: 9, h: 0.35, fontSize: 14, fontFace: "Arial Black", color: C.navy, margin: 0 });
const archLayers = [
  { label: "前端层", desc: "WXML + WXSS + JS | 微信小程序", color: C.coral },
  { label: "SDK层", desc: "wx.cloud 云开发 SDK | 实时数据库", color: C.blue },
  { label: "计算层", desc: "25+ 云函数 (Serverless) | 业务逻辑", color: C.teal },
  { label: "存储层", desc: "NoSQL 12集合 + 云存储 | 数据持久化", color: C.purple },
];
archLayers.forEach((l, i) => {
  const xPos = 0.4 + i * 2.35;
  s10.addShape(pres.shapes.RECTANGLE, { x: xPos, y: 4.35, w: 2.2, h: 0.65, fill: { color: l.color }, shadow: makeShadow() });
  s10.addText(l.label, { x: xPos + 0.1, y: 4.35, w: 1.0, h: 0.65, fontSize: 12, fontFace: "Arial Black", color: C.white, valign: "middle", margin: 0 });
  s10.addText(l.desc, { x: xPos + 0.95, y: 4.35, w: 1.15, h: 0.65, fontSize: 8, fontFace: "Arial", color: C.white, valign: "middle", margin: 0 });
  if (i < 3) {
    s10.addText("→", { x: xPos + 2.2, y: 4.35, w: 0.15, h: 0.65, fontSize: 16, fontFace: "Arial Black", color: C.coral, align: "center", valign: "middle", margin: 0 });
  }
});

s10.addText("↑ 全部课程知识点，从设计到部署到监控，完整落地", { x: 0.6, y: 5.1, w: 9, h: 0.35, fontSize: 12, fontFace: "Arial", color: C.coral, bold: true, margin: 0 });

// ========== Slide 11: 工作总结 ==========
let s11 = pres.addSlide();
s11.background = { color: C.offWhite };
s11.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.coral } });
s11.addText("04  工作总结", { x: 0.6, y: 0.3, w: 9, h: 0.6, fontSize: 26, fontFace: "Arial Black", color: C.navy, margin: 0 });

// 左侧：后端
s11.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.1, w: 4.4, h: 3.5, fill: { color: C.white }, shadow: makeShadow() });
s11.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.1, w: 4.4, h: 0.5, fill: { color: C.coral } });
s11.addText("潘圣宇 — 后端", { x: 0.5, y: 1.1, w: 4.4, h: 0.5, fontSize: 16, fontFace: "Arial Black", color: C.white, align: "center", valign: "middle", margin: 0 });
const backendWork = [
  "25+ 云函数开发部署",
  "12个数据库集合设计",
  "AI客服接入 DeepSeek",
  "聊天系统 (实时消息)",
  "物流模拟算法",
  "售后流程 (三方仲裁)",
  "安全体系 (MD5+Salt/CI/CD)",
  "云部署 + 监控配置",
];
const backendTexts = backendWork.map(w => ({ text: w, options: { bullet: true, breakLine: true, fontSize: 12, color: C.gray } }));
s11.addText(backendTexts, { x: 0.7, y: 1.75, w: 4, h: 2.7, margin: 0, paraSpaceAfter: 4 });

// 右侧：前端
s11.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.1, w: 4.4, h: 3.5, fill: { color: C.white }, shadow: makeShadow() });
s11.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.1, w: 4.4, h: 0.5, fill: { color: C.teal } });
s11.addText("董德 — 前端", { x: 5.1, y: 1.1, w: 4.4, h: 0.5, fontSize: 16, fontFace: "Arial Black", color: C.white, align: "center", valign: "middle", margin: 0 });
const frontendWork = [
  "42个小程序页面开发",
  "三端UI完整设计",
  "聊天对话界面",
  "物流地图可视化",
  "级联地址选择器",
  "交互与表单验证",
  "响应式布局适配",
  "前端部署 + API对接",
];
const frontendTexts = frontendWork.map(w => ({ text: w, options: { bullet: true, breakLine: true, fontSize: 12, color: C.gray } }));
s11.addText(frontendTexts, { x: 5.3, y: 1.75, w: 4, h: 2.7, margin: 0, paraSpaceAfter: 4 });

// 底部：课堂考核点映射
s11.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.75, w: 9.0, h: 0.65, fill: { color: C.navy } });
s11.addText("课堂考核点覆盖", { x: 0.7, y: 4.75, w: 2.2, h: 0.65, fontSize: 12, fontFace: "Arial Black", color: C.gold, valign: "middle", margin: 0 });
s11.addText("版本控制 ✓  原型设计 ✓  架构设计 ✓  前端开发 ✓  后端开发 ✓  联调 ✓  AI集成 ✓  测试 ✓  CI/CD ✓  安全 ✓  Docker ✓  云部署 ✓  监控 ✓", { x: 2.9, y: 4.75, w: 6.4, h: 0.65, fontSize: 10, fontFace: "Arial", color: C.white, valign: "middle", margin: 0 });

// ========== Slide 12: 结尾 ==========
let s12 = pres.addSlide();
s12.background = { color: C.navy };
s12.addShape(pres.shapes.RECTANGLE, { x: 0, y: 2.2, w: 10, h: 1.625, fill: { color: C.coral } });
s12.addText("感谢聆听", { x: 0.8, y: 1.9, w: 8.4, h: 1.0, fontSize: 48, fontFace: "Arial Black", color: C.white, bold: true, align: "center", valign: "middle" });
s12.addText("THANK YOU", { x: 0.8, y: 2.9, w: 8.4, h: 0.6, fontSize: 28, fontFace: "Arial", color: C.white, align: "center", valign: "middle" });
s12.addText("13 次课堂作业 → 1 个完整电商系统", { x: 0.8, y: 3.6, w: 8.4, h: 0.4, fontSize: 16, fontFace: "Arial", color: C.gold, align: "center", valign: "middle" });
s12.addText("BuySomething 开发团队（psy & dd）", { x: 0.8, y: 4.2, w: 8.4, h: 0.5, fontSize: 16, fontFace: "Arial", color: C.white, align: "center", transparency: 30 });

// 写入文件
pres.writeFile({ fileName: "f:/code/buysomething/ppt/BuySomething_期末汇报.pptx" })
  .then(() => console.log("PPT created successfully!"))
  .catch(err => console.error("Error:", err));
