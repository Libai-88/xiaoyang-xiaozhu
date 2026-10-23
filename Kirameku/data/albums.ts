export interface Photo {
  url: string;
  caption?: string;
}

export interface Album {
  id: string;
  title: string;
  description: string;
  cover: string;
  date: string;
  photos: Photo[];
}

export const albums: Album[] = [
  {
    id: "spring-2026",
    title: "2026 春日影像",
    description: "记录这个春天的美好瞬间",
    cover: "https://picsum.photos/seed/spring26/800/600",
    date: "2026.03",
    photos: [
      { url: "https://picsum.photos/seed/s1/800/600", caption: "樱花盛开" },
      { url: "https://picsum.photos/seed/s2/800/600", caption: "西湖落日" },
      { url: "https://picsum.photos/seed/s3/800/600", caption: "校园一角" },
    ],
  },
  {
    id: "lab-life",
    title: "实验室日常",
    description: "科研人的苦与乐：跑不完的模拟、写不完的报告，和偶尔灵光一现的快乐。",
    cover: "https://picsum.photos/seed/lab/800/600",
    date: "2026.02",
    photos: [
      { url: "https://picsum.photos/seed/l1/800/600", caption: "分子模型" },
      { url: "https://picsum.photos/seed/l2/800/600", caption: "深夜实验室" },
      { url: "https://picsum.photos/seed/l3/800/600", caption: "跑通的模拟结果" },
    ],
  },
  {
    id: "code-desk-2026",
    title: "我的代码角落",
    description: "键盘、屏幕、命令行，和一个写代码到入迷的人。",
    cover: "https://picsum.photos/seed/desk/800/600",
    date: "2026.04",
    photos: [
      { url: "https://picsum.photos/seed/d1/800/600", caption: "深夜敲码" },
      { url: "https://picsum.photos/seed/d2/800/600", caption: "HHKB 特写" },
      { url: "https://picsum.photos/seed/d3/800/600", caption: "多屏工作台" },
    ],
  },
  {
    id: "city-walk",
    title: "城市漫游",
    description: "探店、压马路、随手拍，把普通日子过出点仪式感。",
    cover: "https://picsum.photos/seed/city/800/600",
    date: "2026.05",
    photos: [
      { url: "https://picsum.photos/seed/c1/800/600", caption: "巷子里的咖啡店" },
      { url: "https://picsum.photos/seed/c2/800/600", caption: "傍晚的街" },
      { url: "https://picsum.photos/seed/c3/800/600", caption: "路过的一只猫" },
    ],
  },
  {
    id: "us-daily",
    title: "和小猪的日常",
    description: "一起吃的饭、一起走的路、一起笑过的瞬间，都想留下来。",
    cover: "https://picsum.photos/seed/us/800/600",
    date: "2026.06",
    photos: [
      { url: "https://picsum.photos/seed/u1/800/600", caption: "某天的夕阳" },
      { url: "https://picsum.photos/seed/u2/800/600", caption: "一起逛的街" },
      { url: "https://picsum.photos/seed/u3/800/600", caption: "分享的好吃的" },
    ],
  },
];
