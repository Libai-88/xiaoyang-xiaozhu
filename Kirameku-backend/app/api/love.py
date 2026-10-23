"""情侣空间小彩蛋接口（纯内存，无数据库依赖）"""

import random
from datetime import datetime

from fastapi import APIRouter

router = APIRouter(prefix="/api/love", tags=["恋爱彩蛋"])

# 情话池（与前端本地池互补，线上优先走这里）
QUOTES = [
    "今天的云很好看，想拍给你看，然后说：就像你一样好看。",
    "喜欢你，是藏在每一次秒回里的心意。",
    "你像一颗软糖，甜得我每一口都舍不得咽。",
    "我的计划和未来里，都提前预定了你。",
    "晚安的意思，是我把今天的喜欢也带进梦里。",
    "和你发消息的时候，我的嘴角是翘着的，你知道吗。",
    "别人问我喜欢什么，我脑子里全是你的名字。",
    "和你一起虚度时光，是世界上最正经的事。",
    "你是春天里最准时的花信风，一吹，我的心就开了。",
    "隔着屏幕也能感受到的温柔，是你给的。",
    "想把你写进我的故事里，从序言到结尾。",
    "世界万物，你是我的偏爱。",
    "你皱眉的时候，我的心就先替你委屈了。",
    "爱你这件事，我从不觉得累，只觉得值。",
]

# 恋爱运势池
FORTUNES = [
    "宜撒娇，宜牵手，宜一起看一部甜甜的电影。",
    "今天的你会被偏爱，来自那一个特别的人。",
    "适合发一条腻歪的消息，ta 正等着呢。",
    "今晚的月亮很圆，适合说一句真心话。",
    "小惊喜会加分，今天偷偷准备一个吧。",
    "宜分享日常，越琐碎越浪漫。",
    "今天的默契指数满分，一个眼神就懂。",
    "适合一起听一首歌，单曲循环到睡着。",
    "把烦恼说给 ta 听，效果翻倍。",
    "今天的你，怎么看都可爱。",
]


def _seed_rng() -> random.Random:
    """用当天日期做随机种子：同一天内运势稳定，跨天自动更换"""
    return random.Random(datetime.now().strftime("%Y-%m-%d"))


@router.get("/today")
def get_love_today():
    """当日情话 + 当日恋爱运势（同一天内多次请求结果一致）"""
    rng = _seed_rng()
    return {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "quote": rng.choice(QUOTES),
        "fortune": {
            "fortune": rng.choice(FORTUNES),
            "luck": rng.randint(88, 100),
        },
    }


@router.get("/quote")
def get_random_quote():
    """随机情话（每次不同）"""
    return {"quote": random.choice(QUOTES)}
