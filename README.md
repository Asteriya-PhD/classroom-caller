# 班级大屏叫号系统

老师通过手机/电脑发送叫号指令，教室大屏弹窗显示提醒。

## 快速开始

### 1. 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com) 注册账号
2. 点击 "New Project" 创建项目
3. 进入项目后，点击左侧 "SQL Editor"
4. 复制 `supabase/schema.sql` 中的内容执行
5. 复制项目设置中的 **URL** 和 **anon public key**

### 2. 配置老师端

编辑 `teacher-web/app.js`，替换以下两行：

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';      // 替换为你的 Supabase URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // 替换为你的 anon key
```

### 3. 使用老师端

直接用浏览器打开 `teacher-web/index.html` 即可使用。

### 4. 使用大屏端

#### 开发模式
```bash
cd screen-app
npm install
npm start
```

#### 打包为 exe
```bash
npm run build
```

生成的安装包在 `dist/` 目录下。

## 功能说明

### 老师端
- 输入学生姓名（可选）
- 选择消息类型：叫到讲台 / 通知 / 自定义
- 自动填充消息内容，也可手动修改
- 设置弹窗显示时长
- 查看发送历史

### 大屏端
- 首次使用需配置 Supabase 连接信息
- 全屏显示弹窗
- 声音提示
- 自动关闭弹窗

## 项目结构

```
classroom-caller/
├── teacher-web/          # 老师端网页
│   ├── index.html
│   ├── style.css
│   └── app.js
├── screen-app/           # 大屏端 Electron 应用
│   ├── package.json
│   ├── main.js
│   ├── preload.js
│   └── renderer/
│       ├── index.html
│       ├── style.css
│       └── app.js
└── supabase/
    └── schema.sql        # 数据库结构
```

## 常见问题

**Q: 为什么显示"连接失败"？**
A: 检查 Supabase URL 和 Key 是否正确填写。

**Q: 大屏如何全屏显示？**
A: 在大屏端配置中勾选"全屏模式"，或按 F11 键。

**Q: 可以同时多台大屏使用吗？**
A: 可以，多台大屏连接同一个 Supabase 即可同时接收消息。

## 技术栈

- 老师端：HTML + CSS + JavaScript
- 大屏端：Electron
- 后端：Supabase (PostgreSQL + Realtime)
