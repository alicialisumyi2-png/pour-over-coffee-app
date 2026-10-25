# 手沖小教室

以繁體中文帶領初學者沖煮 V60 或聰明杯，提供依粉量與烘焙度調整的教學建議、計時步驟、風味回顧與本機紀錄。資料只儲存在目前瀏覽器的 localStorage。

## 本機開發

```sh
npm install
npm run dev
```

## 測試與建置

```sh
npm test
npm run build
npm run preview
```

## Cloudflare Pages

- Build command：`npm run build`
- Build output directory：`dist`
- 使用 HTTPS 部署後可安裝為 PWA。Service worker 會快取應用程式外殼與同源資源；首次載入後可離線開啟已載入的畫面。
- V1 暫不提供安裝圖示（manifest 未設定 icons）。

## 食譜設定

V60 依烘焙度使用約 1:15.75（淺焙）、1:15（中焙）、1:14.25（深焙）；聰明杯採約 1:15。水量按粉量等比例計算，水溫與研磨提示依烘焙度調整。這些是示範起點，豆子、研磨、注水與個人口味都會影響結果。
