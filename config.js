// ============================================================
//  网站配置 —— 你可以直接修改这里的文字
//  Site configuration — edit the text below freely.
// ============================================================
window.SITE_CONFIG = {
  // 标题 / 副标题（首页大字）
  title: "致我最爱的你",
  subtitle: "我们走过的每一个瞬间",
  // 越南语版标题 / 副标题（选「珍」时显示）
  titleVi: "Gửi người anh yêu nhất",
  subtitleVi: "Từng khoảnh khắc đôi ta đi qua",

  // 你们的名字（显示在页脚，可留空）
  names: "谭明辉 ❤ LÊ HUYỀN TRÂN",

  // ---------- 身份（输对密码后选“你是谁”）----------
  // lang 决定该身份进入后界面语言：zh 中文 / vi 越南语
  viewers: [
    { key: "hui", name: "谭明辉", short: "辉", emoji: "🤵", color: "#7fb3ff", lang: "zh" },
    { key: "zhen", name: "LÊ HUYỀN TRÂN", short: "珍", emoji: "👰", color: "#ffa6c1", lang: "vi" },
  ],

  // ---------- 每日情话（每天自动换一句）----------
  loveQuotes: [
    "遇见你之后，所有的星辰都黯然失色。",
    "我喜欢的不是回忆，是和你在一起的每一个现在。",
    "余生很长，请多指教；岁月很短，要好好爱你。",
    "你是我藏在岁月里，最温柔的运气。",
    "想和你一起，把平凡的日子过成诗。",
    "世界很大，幸好遇见了你。",
    "愿我们的故事，写到地老天荒还嫌太短。",
    "你笑起来的样子，是我见过最美的风景。",
    "心之所向，皆是你；岁之所往，皆是我们。",
    "牵了手就不要随便说分手，我陪你到白头。",
  ],
  // 越南语情话（选「珍」时显示）
  loveQuotesVi: [
    "Từ khi gặp em, cả bầu trời sao cũng phải lu mờ.",
    "Anh yêu không phải ký ức, mà là mỗi hiện tại có em.",
    "Đời còn dài, mong được bên em; tháng năm ngắn ngủi, anh sẽ yêu em thật nhiều.",
    "Em là điều may mắn dịu dàng nhất anh giấu trong năm tháng.",
    "Muốn cùng em biến những ngày bình thường thành thơ.",
    "Thế giới rộng lớn, may mà có em.",
    "Mong câu chuyện của đôi ta, kể đến thiên thu vẫn thấy còn ngắn.",
    "Nụ cười của em là khung cảnh đẹp nhất anh từng thấy.",
    "Lòng anh hướng về đâu đều là em, năm tháng trôi về đâu đều là chúng ta.",
    "Đã nắm tay rồi thì đừng dễ buông, anh sẽ bên em đến bạc đầu.",
  ],

  // ---------- 背景音乐（男 / 女 不同）----------
  // 把 mp3 放到 assets/ 下，按身份各填一首；文件不存在时音乐按钮会自动隐藏。
  music: {
    hui: "assets/music-hui.mp3",   // 辉 的歌
    zhen: "assets/music-zhen.mp3", // 珍 的歌
  },
  // 进入相册后，用户第一次点击/触摸页面就自动开始播放（浏览器只允许这种方式）。
  // 不想自动播放就改成 false。
  musicAutoplay: true,

  // ---------- 浪漫主题（7 套，按星期每天自动轮换，也可手动选）----------
  themes: [
    { key: "rosegold", zh: "玫瑰金",   vi: "Vàng hồng",     swatch: ["#e8a0b0", "#e7c9a9"] },
    { key: "sakura",   zh: "樱花粉",   vi: "Hoa anh đào",   swatch: ["#ff9ec4", "#ffd1e3"] },
    { key: "lavender", zh: "薰衣草",   vi: "Oải hương",     swatch: ["#c9a7e8", "#e0c3fc"] },
    { key: "ocean",    zh: "蔚蓝海岸", vi: "Biển xanh",     swatch: ["#7fc8e8", "#8fe0cf"] },
    { key: "peach",    zh: "蜜桃日落", vi: "Hoàng hôn đào", swatch: ["#ffb38a", "#ffd9a0"] },
    { key: "emerald",  zh: "翡翠绿",   vi: "Ngọc lục bảo",  swatch: ["#8fdcae", "#cfe89a"] },
    { key: "starry",   zh: "星空蓝调", vi: "Trời sao",      swatch: ["#9fb3ff", "#c7b3ff"] },
  ],

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

  // 管理后台密码（0818）—— 用于解锁“增删照片”界面。
  adminPasswordHash:
    "eace080e5ab3d63e78b135db6c1b74faac43a2ab5f444b8ffe76a14bdb06ab5c",

  // ---------- GitHub 仓库信息（用于后台增删照片）----------
  // 部署后会自动填好；如有变动可手动修改。
  github: {
    owner: "smith12138",
    repo: "our-story",
    branch: "main",
  },
};
