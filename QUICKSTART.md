# ESPHome_UI_Designer Quickstart

This guide walks through the first-time setup flow. If you only want the project overview, read [README.md](README.md) first.

## What you need

- An OpenNextion screen
- ESPHome
- Home Assistant
- A light or other Home Assistant entity already available

## Before you start

After opening the editor, complete these three basic steps:

1. Choose the OpenNextion model and display orientation
2. Configure Wi-Fi
3. Copy the generated YAML from the Build section

<img src="assets/images/readme/1778726239152-be36b2ed-27b9-41f3-910f-5ee9b1500af2.png" width="1883" alt="Model selection">
<img src="assets/images/readme/1778726279420-7cd3152c-2baa-460f-8da3-2bfb6f698192.png" width="1883" alt="Wi-Fi configuration">
<img src="assets/images/readme/1778726307406-df0738a1-fad1-41eb-a8dc-80a3e66b85ae.png" width="1883" alt="Copy YAML">

## First flash

ESPHome is required for the first flash. Official getting started guide:

- https://esphome.io/guides/getting_started_hassio/

### 1. Create a device

<img src="assets/images/readme/1776072548934-c17c6eea-ec41-4983-91f1-a7c88ba3f1e4.png" width="1255" alt="Create device 1">
<img src="assets/images/readme/1776072590976-7549baac-e973-4a0c-9786-5d1c87b33a4a.png" width="1255" alt="Create device 2">
<img src="assets/images/readme/1776072626134-a0365952-822f-4bb2-9dc4-4a26a0418bb4.png" width="1255" alt="Create device 3">

### 2. Import the configuration

<img src="assets/images/readme/1776072651551-23359a0b-9126-4c75-954b-723e6ca36993.png" width="1255" alt="Import config 1">
<img src="assets/images/readme/1778726413014-5f0e3ac6-74cd-4b76-afb0-7df542f4fbd9.png" width="1883" alt="Import config 2">

Make sure the Wi-Fi is 2.4G and on the same network as Home Assistant.

<img src="assets/images/readme/1778726436303-dbabfa7f-62af-440c-b477-0ec295a4c093.png" width="1883" alt="Wi-Fi check">

### 3. Choose the first flash method

`Plug into this computer` is recommended. `Manual download` also works.

<img src="assets/images/readme/1776073159086-e7b58e55-d64c-431c-9f27-aa8d9fb569be.png" width="1255" alt="First flash method">

### 4. Reboot the device

After the first flash completes, press `RESET`.

<img src="assets/images/readme/1776073412345-d63bb705-08ae-48e5-967b-96516845a056.png" width="264" alt="RESET button"><img src="assets/images/readme/1776073522878-9f15e378-62a5-4cab-8236-30f35bb38a6a.jpeg" width="212" alt="Device reboot">

## Add to Home Assistant

After the device connects to Wi-Fi, Home Assistant will discover it.

<img src="assets/images/readme/1776073675061-01026a7d-5d39-4bde-9496-8c108b10c292.png" width="1257" alt="Home Assistant devices page">
<img src="assets/images/readme/1776073808237-195e7c82-b59b-46f1-a20a-e8115124112b.png" width="1255" alt="Add device 1">
<img src="assets/images/readme/1776073842977-72e4a7f6-5d66-4514-9c9b-c948c67e4afa.png" width="1255" alt="Add device 2">
<img src="assets/images/readme/1776073865796-f4e26afd-866c-4e3b-9f78-6fc2c20d2e38.png" width="1255" alt="Add device 3">

The device currently exposes `light`, which lets Home Assistant control the screen brightness.

<img src="assets/images/readme/1776074016891-a6e2606a-77f6-4b38-a268-e8efc0a77c04.png" width="1255" alt="Brightness capability">

## Add entities

1. Click `Add Entity` in `Entities`

<img src="assets/images/readme/1778726858655-2faddcfb-7294-4412-ab1a-18d7af8894e2.png" width="1883" alt="Add entity 1"><img src="assets/images/readme/1778726888675-4bace89f-d276-4d14-a93c-42f3abe9157a.png" width="1883" alt="Add entity 2">

2. Configure `EntityID`

<img src="assets/images/readme/1778726948865-2a3499b6-d585-4970-ac0a-0c032c89a478.png" width="1883" alt="Entity ID config 1">
<img src="assets/images/readme/1778727211320-fb2a643d-8a29-4ff9-ac57-2b634478dccd.png" width="1883" alt="Entity ID config 2">
<img src="assets/images/readme/1778727250719-2cfed805-bf52-4a2c-8141-8216aeccfa2a.png" width="1116" alt="Entity ID config 3">
<img src="assets/images/readme/1778727277308-d5593e26-8435-44ad-80d7-dd9aa15769e0.png" width="1883" alt="Entity ID config 4">

3. Copy the YAML from Build

<img src="assets/images/readme/1778727308214-42748040-6383-4e04-ae09-8a6cd2681e29.png" width="1883" alt="Copy Build output">
<img src="assets/images/readme/1778727380809-a6e27c6a-4af1-4282-9438-415fe711ef51.png" width="1883" alt="Replace YAML">

4. Choose the OTA method

<img src="assets/images/readme/1778727411541-dd933d58-8fd2-4509-ac83-d4ac79aba719.png" width="1883" alt="Wirelessly">
<img src="assets/images/readme/1776075577931-8f84df8e-d407-46e5-b34b-e5f2d4e0f259.png" width="1255" alt="OTA 更新">
<img src="assets/images/readme/1778727556679-b1c0df72-2af5-4946-934a-2ee8deb711ce.jpeg" width="1604" alt="其他烧录方式 2">

If you cannot perform firmware flashing via WiFi, you can still choose other methods for flashing


<img src="assets/images/readme/1778728159140-3889dd8c-8cc8-40c8-bdd9-f2904421a500.png" width="283" alt="其他烧录方式 1">

## Permission grant

The first time you try to control a Home Assistant entity, you must grant permission in Home Assistant.

<img src="assets/images/readme/1776076003346-1efe1d8e-a3ea-4b4f-922e-c6abc13d607d.png" width="1725" alt="Permission error">
<img src="assets/images/readme/1776076084178-f2082e92-0709-4595-8062-f24f606747cb.png" width="1255" alt="Click ESPHome">
<img src="assets/images/readme/1776076166461-a9d7c4bf-c9c2-4a15-b34d-e14ecfb621c3.png" width="1255" alt="Authorization 1">
<img src="assets/images/readme/1776076151909-f3bbcbc7-3835-4de4-ba74-29a580c8f3f2.png" width="1255" alt="Authorization 2">

## Final result

<img src="assets/images/readme/1778744675921-ce7f06f4-4fa6-4bd5-b714-d1de8a39b6ec.png" width="668" alt="Final preview">

[Demo video](assets/videos/readme/video2.mp4)

## Supported components

- `switch` / `multi_switch`
- `thermo_hygrometer`
- `cover`
- `light`
- `hmi_screen_brightness`

More components are still under development.
