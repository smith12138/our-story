/* ============================================================
 *  i18n.js — 中文 / Tiếng Việt 双语
 *  选「辉」用中文，选「珍」自动切换越南语。
 *  动态文案（计数、生日、欢迎语）用函数返回。
 * ============================================================ */
window.LANG = "zh";

const I18N = {
  zh: {
    gateTitle: "我们的故事",
    gateSub: "输入密码，进入属于我们的回忆",
    gatePh: "请输入密码",
    gateBtn: "进 入 ❤",
    gateErr: "密码不对哦，再试试 💔",
    sectionLabel: "我们的回忆",
    empty: "还没有照片，进入“管理”上传第一张吧 💞",
    footerTip: "轻触照片可放大 · 双击空白处呼出管理",
    idTitle: "是谁来啦？",
    idSub: "告诉我你是谁，让我好好宠你 ❤",
    bdTitle: "生日快乐",
    bdTo: "致",
    bdMsg: "愿你眼里有光，笑里有甜，<br />往后岁岁年年，都有我陪在身边。❤",
    bdClose: "谢谢，收下这份爱 💕",
    filterAll: "全部",
    filterUntagged: "未标注地点",
    // 动态
    married: (d) => `结婚已经 <b>${d}</b> 天 · 还有一辈子要走 ♾`,
    bdayToday: (n) => `🎂 今天是 <b>${n}</b> 的生日 · 生日快乐！`,
    bdaySoon: (n, d) => `🎈 距离 <b>${n}</b> 的生日还有 <b>${d}</b> 天`,
    welcome: (s, e, ps) => `欢迎回来，${s} ${e} · ${ps}很想你哦 💕`,
    welcomeSolo: (s, e) => `欢迎回来，${s} ${e}`,
    // 后台
    admTitle: "照片管理",
    admUnlockHint: "输入管理密码以解锁",
    admPassPh: "管理密码",
    admUnlock: "解锁",
    admTokenHint: "首次使用请粘贴 GitHub 令牌（用于把改动保存到仓库）。",
    admTokenLink: "点此创建令牌",
    admTokenHint2: "（勾选 repo 权限），令牌只保存在本机浏览器。",
    admTokenPh: "ghp_xxx 或 github_pat_xxx",
    admTokenSave: "保存令牌",
    admUpload: "＋ 点击或拖拽照片到此上传",
    admGridHint: "下方为现有照片，点 🗑 即可删除（会同步到 GitHub）。",
    admForget: "退出 / 清除令牌",
    placeTitle: "标注地点",
    placeCountryPh: "国家（如：越南）",
    placeRegionPh: "地区 / 城市（如：胡志明市）",
    placeSave: "保存地点",
    placeClear: "清除该照片地点",
    placeNeed: "请至少填写国家或地区",
    placeSaving: "保存中…",
    placeFail: "保存失败：",
    tokenInvalid: "令牌无效或无该仓库写入权限",
  },

  vi: {
    gateTitle: "Câu chuyện của chúng ta",
    gateSub: "Nhập mật khẩu để bước vào miền ký ức của đôi ta",
    gatePh: "Nhập mật khẩu",
    gateBtn: "Vào ❤",
    gateErr: "Sai mật khẩu rồi, thử lại nhé 💔",
    sectionLabel: "Ký ức của chúng ta",
    empty: "Chưa có ảnh nào, vào “Quản lý” để tải tấm đầu tiên nhé 💞",
    footerTip: "Chạm vào ảnh để phóng to · Nhấn đúp chỗ trống để mở quản lý",
    idTitle: "Ai đến vậy nè?",
    idSub: "Cho biết bạn là ai, để được yêu thương thật nhiều ❤",
    bdTitle: "Chúc mừng sinh nhật",
    bdTo: "Gửi",
    bdMsg: "Chúc em mắt luôn sáng, môi luôn cười,<br />và mỗi năm tháng về sau đều có nhau bên cạnh. ❤",
    bdClose: "Cảm ơn, xin nhận hết yêu thương này 💕",
    filterAll: "Tất cả",
    filterUntagged: "Chưa gắn địa điểm",
    // động
    married: (d) => `Đã kết hôn <b>${d}</b> ngày · còn cả một đời bên nhau ♾`,
    bdayToday: (n) => `🎂 Hôm nay là sinh nhật <b>${n}</b> · Chúc mừng sinh nhật!`,
    bdaySoon: (n, d) => `🎈 Còn <b>${d}</b> ngày nữa đến sinh nhật <b>${n}</b>`,
    welcome: (s, e, ps) => `Chào mừng trở lại, ${s} ${e} · ${ps} nhớ lắm đó 💕`,
    welcomeSolo: (s, e) => `Chào mừng trở lại, ${s} ${e}`,
    // quản trị
    admTitle: "Quản lý ảnh",
    admUnlockHint: "Nhập mật khẩu quản trị để mở khóa",
    admPassPh: "Mật khẩu quản trị",
    admUnlock: "Mở khóa",
    admTokenHint: "Lần đầu dùng, hãy dán GitHub token (để lưu thay đổi vào kho).",
    admTokenLink: "Bấm để tạo token",
    admTokenHint2: "(chọn quyền repo), token chỉ lưu trên trình duyệt của bạn.",
    admTokenPh: "ghp_xxx hoặc github_pat_xxx",
    admTokenSave: "Lưu token",
    admUpload: "＋ Bấm hoặc kéo thả ảnh vào đây để tải lên",
    admGridHint: "Bên dưới là ảnh hiện có, bấm 🗑 để xoá (sẽ đồng bộ lên GitHub).",
    admForget: "Đăng xuất / Xoá token",
    placeTitle: "Gắn địa điểm",
    placeCountryPh: "Quốc gia (vd: Việt Nam)",
    placeRegionPh: "Khu vực / Thành phố (vd: TP. Hồ Chí Minh)",
    placeSave: "Lưu địa điểm",
    placeClear: "Xoá địa điểm của ảnh này",
    placeNeed: "Hãy nhập ít nhất quốc gia hoặc khu vực",
    placeSaving: "Đang lưu…",
    placeFail: "Lưu thất bại: ",
    tokenInvalid: "Token không hợp lệ hoặc không có quyền ghi vào kho",
  },
};

// 已知地名的越南语对照（其余原样显示）
const PLACE_VI = {
  "越南": "Việt Nam",
  "马来西亚": "Malaysia",
  "胡志明市": "TP. Hồ Chí Minh",
  "守德市": "Thủ Đức",
  "吉隆坡": "Kuala Lumpur",
  "士拉央": "Selayang",
  "Cái Nhum": "Cái Nhum",
};

function t(key) {
  const pack = I18N[window.LANG] || I18N.zh;
  return key in pack ? pack[key] : I18N.zh[key];
}

// 把单个地名按当前语言翻译（越南语下查表，查不到则原样）
function translatePlace(s) {
  if (!s) return s;
  return window.LANG === "vi" ? PLACE_VI[s] || s : s;
}
