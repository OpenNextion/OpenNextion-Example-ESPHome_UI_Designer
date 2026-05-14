# ONXWebStudio 快速上手

这是一份面向首次使用者的操作教程。若你只是想了解项目整体介绍，请先看 [README_cn.md](README_cn.md)。

英文版请看：

- [QUICKSTART.md](QUICKSTART.md)

## 你需要准备

- OpenNextion 屏幕
- ESPHome
- Home Assistant
- 已接入 Home Assistant 的灯或其他实体

## 开始前

打开项目页面后，先完成三个基础设置：

1. 选择 OpenNextion 型号和屏幕方向
2. 配置 Wi-Fi
3. 复制 Build 区域生成的 YAML

<img src="assets/images/readme/1778726239152-be36b2ed-27b9-41f3-910f-5ee9b1500af2.png" width="1883" alt="配置型号">
<img src="assets/images/readme/1778726279420-7cd3152c-2baa-460f-8da3-2bfb6f698192.png" width="1883" alt="配置 Wi-Fi">
<img src="assets/images/readme/1778726307406-df0738a1-fad1-41eb-a8dc-80a3e66b85ae.png" width="1883" alt="拷贝 YAML">

## 首次烧录

首次烧录需要 ESPHome。官方入门文档：

- https://esphome.io/guides/getting_started_hassio/

### 1. 创建设备

<img src="assets/images/readme/1776072548934-c17c6eea-ec41-4983-91f1-a7c88ba3f1e4.png" width="1255" alt="创建设备 1">
<img src="assets/images/readme/1776072590976-7549baac-e973-4a0c-9786-5d1c87b33a4a.png" width="1255" alt="创建设备 2">
<img src="assets/images/readme/1776072626134-a0365952-822f-4bb2-9dc4-4a26a0418bb4.png" width="1255" alt="创建设备 3">

### 2. 导入配置

<img src="assets/images/readme/1776072651551-23359a0b-9126-4c75-954b-723e6ca36993.png" width="1255" alt="导入配置 1">
<img src="assets/images/readme/1778726413014-5f0e3ac6-74cd-4b76-afb0-7df542f4fbd9.png" width="1883" alt="导入配置 2">

注意确认 Wi-Fi 是否为 2.4G，并且与 Home Assistant 在同一网络。

<img src="assets/images/readme/1778726436303-dbabfa7f-62af-440c-b477-0ec295a4c093.png" width="1883" alt="Wi-Fi 检查">

### 3. 选择首次烧录方式

首次烧录推荐使用 `Plug into this computer`，也可以选择 `Manual download`。

<img src="assets/images/readme/1776073159086-e7b58e55-d64c-431c-9f27-aa8d9fb569be.png" width="1255" alt="首次烧录方式">

### 4. 重启设备

烧录完成后按下 `RESET`。

<img src="assets/images/readme/1776073412345-d63bb705-08ae-48e5-967b-96516845a056.png" width="264" alt="RESET 按钮"><img src="assets/images/readme/1776073522878-9f15e378-62a5-4cab-8236-30f35bb38a6a.jpeg" width="212" alt="设备重启">

## 加入 Home Assistant

设备连上 Wi-Fi 后会被 Home Assistant 发现。

<img src="assets/images/readme/1776073675061-01026a7d-5d39-4bde-9496-8c108b10c292.png" width="1257" alt="Home Assistant 设备页">
<img src="assets/images/readme/1776073808237-195e7c82-b59b-46f1-a20a-e8115124112b.png" width="1255" alt="添加设备 1">
<img src="assets/images/readme/1776073842977-72e4a7f6-5d66-4514-9c9b-c948c67e4afa.png" width="1255" alt="添加设备 2">
<img src="assets/images/readme/1776073865796-f4e26afd-866c-4e3b-9f78-6fc2c20d2e38.png" width="1255" alt="添加设备 3">

当前设备暴露了 `light` 能力，可以控制屏幕亮度。

<img src="assets/images/readme/1776074016891-a6e2606a-77f6-4b38-a268-e8efc0a77c04.png" width="1255" alt="亮度能力">

## 添加实体

1. 在 `Entities` 里点击 `Add Entity`

<img src="assets/images/readme/1778726858655-2faddcfb-7294-4412-ab1a-18d7af8894e2.png" width="1883" alt="添加部件 1"><img src="assets/images/readme/1778726888675-4bace89f-d276-4d14-a93c-42f3abe9157a.png" width="1883" alt="添加部件 2">

2. 配置 `EntityID`

<img src="assets/images/readme/1778726948865-2a3499b6-d585-4970-ac0a-0c032c89a478.png" width="1883" alt="配置 EntityId 1">
<img src="assets/images/readme/1778727211320-fb2a643d-8a29-4ff9-ac57-2b634478dccd.png" width="1883" alt="配置 EntityId 2">
<img src="assets/images/readme/1778727250719-2cfed805-bf52-4a2c-8141-8216aeccfa2a.png" width="1116" alt="配置 EntityId 3">
<img src="assets/images/readme/1778727277308-d5593e26-8435-44ad-80d7-dd9aa15769e0.png" width="1883" alt="配置 EntityId 4">

3. 复制 Build 输出的 YAML

<img src="assets/images/readme/1778727308214-42748040-6383-4e04-ae09-8a6cd2681e29.png" width="1883" alt="Build 复制">
<img src="assets/images/readme/1778727380809-a6e27c6a-4af1-4282-9438-415fe711ef51.png" width="1883" alt="替换 YAML">

4. 选择 OTA 方式

<img src="assets/images/readme/1778727411541-dd933d58-8fd2-4509-ac83-d4ac79aba719.png" width="1883" alt="Wirelessly">
<img src="assets/images/readme/1776075577931-8f84df8e-d407-46e5-b34b-e5f2d4e0f259.png" width="1255" alt="OTA 更新">
<img src="assets/images/readme/1778727556679-b1c0df72-2af5-4946-934a-2ee8deb711ce.jpeg" width="1604" alt="其他烧录方式 2">

如果你无法通过wifi进行固件烧录，那你依旧可以选择其他方式进行烧录


<img src="assets/images/readme/1778728159140-3889dd8c-8cc8-40c8-bdd9-f2904421a500.png" width="283" alt="其他烧录方式 1">

## 权限授权

首次控制 Home Assistant 设备时，需要在 Home Assistant 中授权。

<img src="assets/images/readme/1776076003346-1efe1d8e-a3ea-4b4f-922e-c6abc13d607d.png" width="1725" alt="权限报错">
<img src="assets/images/readme/1776076084178-f2082e92-0709-4595-8062-f24f606747cb.png" width="1255" alt="点击 ESPHome">
<img src="assets/images/readme/1776076166461-a9d7c4bf-c9c2-4a15-b34d-e14ecfb621c3.png" width="1255" alt="授权页面 1">
<img src="assets/images/readme/1776076151909-f3bbcbc7-3835-4de4-ba74-29a580c8f3f2.png" width="1255" alt="授权页面 2">

## 最终效果

<img src="assets/images/readme/1778744675921-ce7f06f4-4fa6-4bd5-b714-d1de8a39b6ec.png" width="668" alt="效果展示">

[效果演示视频](assets/videos/readme/video2.mp4)

## 支持部件

- `switch` / `multi_switch`
- `thermo_hygrometer`
- `cover`
- `light`
- `hmi_screen_brightness`

更多部件仍在开发中。
