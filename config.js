// ============================================================
//  网站配置 —— 你可以直接修改这里的文字
//  Site configuration — edit the text below freely.
// ============================================================
window.SITE_CONFIG = {
  // 标题 / 副标题（首页大字）
  title: "致我最爱的你",
  subtitle: "我们走过的每一个瞬间",

  // 你们的名字（显示在页脚，可留空）
  names: "谭明辉 ❤ LÊ HUYỀN TRÂN",

  // 结婚纪念日（用于首页“结婚 N 天”计数，格式 YYYY-MM-DD；留空则不显示）
  anniversary: "2025-10-07",

  // ---------- 生日提醒 ----------
  // 想加更多人，照样在数组里加一行即可（格式 YYYY-MM-DD）。
  // 临近生日(默认 30 天内)首页会提醒；生日当天会弹出庆祝动画。
  people: [
    { name: "谭明辉", birthday: "1998-10-21" },
    { name: "LÊ HUYỀN TRÂN", birthday: "2003-08-18" },
  ],
  birthdayRemindWithinDays: 30,

  // ---------- 访问密码 ----------
  // 进入相册的密码（结婚纪念日: 20251007）。
  // 想改密码：在浏览器控制台运行
  //   crypto.subtle.digest('SHA-256', new TextEncoder().encode('你的新密码'))
  //     .then(b=>console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
  // 把打印出来的字符串粘贴到下面。
  galleryPasswordHash:
    "6b0a8b2f2ace1bd89dbb4215eef7c188ec92c8cbf8950717f7ab9a59b3983e30",

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
