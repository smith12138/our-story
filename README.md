# 致我最爱的你 · Our Story 💕

一个浪漫的双人相册网站，托管在 GitHub Pages 上。

## 在线访问

部署后地址：`https://smith12138.github.io/our-story/`

进入相册需要密码（结婚纪念日 **`20251007`**）。

## 日常使用：增 / 删照片

1. 打开网站，点右下角 ⚙ 按钮（或在空白处双击）。
2. 输入**管理密码**（默认 **`admin520`**）。
3. 首次使用粘贴一个 **GitHub 令牌**（[点此创建](https://github.com/settings/tokens/new?scopes=repo&description=our-story-admin)，勾选 `repo` 权限）。令牌只存在你自己的浏览器里。
4. 之后就能：
   - **上传**：点击/拖拽照片到上传框。
   - **删除**：点照片右上角 🗑。
   - **标注地点**：点照片左上角 📍，填「国家 / 地区」（给没有 GPS 的照片手动补位置）。
   改动会自动提交到 GitHub，约 1 分钟后线上生效。

## 其他功能

- **身份选择**：输对密码后选「辉 / 珍」，记住身份并个性化欢迎（清浏览器缓存可重选）。
- **幻灯片轮播**：首页自动播放，可暂停 / 左右切换。
- **生日提醒**：临近生日首页提示，当天弹庆祝动画（在 `config.js` 的 `people` 里维护）。
- **每日情话**：每天自动换一句，句子在 `config.js` 的 `loveQuotes` 里随便加。
- **地点筛选**：相册顶部按「国家·地区」筛选。
- **背景音乐（可选）**：把 mp3 放进 `assets/`，在 `config.js` 填 `musicUrl` 即出现音乐按钮。

## 修改文字 / 密码

编辑 `config.js`：标题、副标题、名字、纪念日都在里面。

**改访问密码**：在浏览器控制台运行
```js
crypto.subtle.digest('SHA-256', new TextEncoder().encode('你的新密码'))
  .then(b=>console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
```
把结果填入 `config.js` 的 `galleryPasswordHash`（管理密码同理填 `adminPasswordHash`）。

## 手动重建照片清单（可选）

如果你直接往 `photos/` 文件夹里放了图片，运行：
```bash
node build-manifest.mjs
```
会重新生成 `photos.json`。

## ⚠️ 隐私说明

这是公开仓库 + 前端密码门。密码只挡住相册**界面**，但图片文件本身在公开地址
（`smith12138.github.io/our-story/photos/...`）仍可被直接访问。
若要真正私密，需改用**私有仓库**（GitHub Pages 私密发布为付费功能）或带真正登录的托管服务。
