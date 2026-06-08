// ============================================================
//  网站配置 —— 你可以直接修改这里的文字
//  Site configuration — edit the text below freely.
// ============================================================
window.SITE_CONFIG = {
  // 标题 / 副标题（首页大字）
  title: "致我最爱的你",
  subtitle: "我们走过的每一个瞬间",

  // 你们的名字（显示在页脚，可留空）
  names: "❤",

  // 你们在一起的纪念日（用于首页“在一起 N 天”计数，格式 YYYY-MM-DD；留空则不显示）
  anniversary: "2025-01-28",

  // ---------- 访问密码 ----------
  // 进入相册的密码（默认: 1314520）。
  // 想改密码：在浏览器控制台运行
  //   crypto.subtle.digest('SHA-256', new TextEncoder().encode('你的新密码'))
  //     .then(b=>console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
  // 把打印出来的字符串粘贴到下面。
  galleryPasswordHash:
    "48818c6e6eb2ba468317d76accf24e92dd47e6c09c7db349356fad01d834015e",

  // 管理后台密码（默认: admin520）—— 用于解锁“增删照片”界面。
  adminPasswordHash:
    "58b8b098d9a41382c8d8c79ed6f729dee431c8b51d8874f9a324934b04f67252",

  // ---------- GitHub 仓库信息（用于后台增删照片）----------
  // 部署后会自动填好；如有变动可手动修改。
  github: {
    owner: "smith12138",
    repo: "our-story",
    branch: "main",
  },
};
