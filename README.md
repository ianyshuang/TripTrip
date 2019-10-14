# TripTrip 你的旅行好夥伴

TripTrip 是一個讓你能輕鬆、快速規劃行程的工具。

## Features
* 透過關鍵字或目的地快速搜尋景點、行程
* 以拖拉方式快速將景點放到側邊欄，並可在側邊欄快速編輯行程天數
* 顯示景點地圖、官方網站、評分、評論等豐富資訊
* 可進行收藏、複製、評分、留言等動作與其他使用者互動
* 支援 Facebook / Google 第三方登入

## Code Style

![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)[](https://github.com/feross/standard)

## Complete
所有於專案繳交中第三點所列的 User Story

## In Progress

#### 身為一個登入的使用者，我可以
* 新增至多一個行程(儲存在 LocalStorage)

#### 身為一個登入的使用者，我可以
* 將自己的行程列印下來
* 將自己的行程透過 email 分享給別人
* 點選忘記密碼來重設自己的密碼
* 開啟共同行程來邀請其他使用者一同編輯行程(非即時)

#### 身為一個網站管理者，我可以
* 看到所有行程的統計資料(未定)
* 刪除任一行程的資料

## Installation

首先，切換至欲存放專案的資料夾，並輸入

```
git clone https://github.com/ianyshuang/TripTrip.git
```

下載完畢後，切換至專案資料夾

```
cd TripTrip
```

下載所需用到的套件

```
npm install
```

運行專案

```
npm run start
```

## Built With
* [Vue.js](https://vuejs.org/) - Frontend Framework
* [Express](https://expressjs.com/) - Backend Server Framework
* [Mongoose](https://github.com/Automattic/mongoose/) - ODM for MongoDB
* [Passport.js](https://github.com/jaredhanson/passport) - Authentication Middleware for Node.js

## Authors
* [miayang0513](https://github.com/miayang0513)
* [ianyshuang](https://github.com/ianyshuang)
* [purrup](https://github.com/purrup)