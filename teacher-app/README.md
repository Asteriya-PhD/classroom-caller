# 老师端桌面应用（Tauri）

使用 Tauri 打包的轻量级桌面应用，同时支持 Windows 和 macOS。

## 环境准备

### 1. 安装 Rust
访问 https://rustup.rs 下载安装 Rust

### 2. 安装系统依赖

**macOS:**
```bash
xcode-select --install
```

**Windows:**
- 安装 Visual Studio Build Tools
- 选择 "C++ build tools" 工作负载

## 使用方法

### 1. 安装依赖
```bash
cd teacher-app
npm install
```

### 2. 开发模式运行
```bash
npm run dev
```

### 3. 打包应用

**打包当前平台:**
```bash
npm run build
```

**打包 Windows 版本:**
```bash
npm run build:win
```

**打包 macOS 版本:**
```bash
npm run build:mac
```

打包后的文件在 `src-tauri/target/release/bundle/` 目录下。

## 图标制作

需要准备以下尺寸的 PNG 图标，放入 `src-tauri/icons/` 目录：

- 32x32.png
- 128x128.png
- 128x128@2x.png (256x256)
- icon.icns (macOS)
- icon.ico (Windows)

可以使用在线工具 https://icon.kitchen/ 生成所有尺寸的图标。

## 项目结构

```
teacher-app/
├── package.json
├── src/                      # Web 源码
│   ├── index.html
│   ├── style.css
│   └── app.js
└── src-tauri/                # Tauri 配置
    ├── Cargo.toml
    ├── build.rs
    ├── tauri.conf.json
    ├── icons/                # 应用图标
    └── src/
        └── main.rs
```

## 打包大小对比

| 方案 | 打包大小 | 启动速度 |
|------|---------|---------|
| Tauri | 2-5 MB | 快 |
| Electron | 50-100 MB | 较慢 |

## 注意事项

1. 首次运行需要配置 Supabase 连接信息
2. 配置会保存在本地，下次启动自动使用
3. 如果遇到网络问题，确保 Supabase 配置正确
