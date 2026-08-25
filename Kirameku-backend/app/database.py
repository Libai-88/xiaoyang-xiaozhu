from sqlmodel import SQLModel, create_engine, Session, select
from app.config import DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_NICKNAME
from app.models import User
from app.utils.auth import hash_password, verify_password

# pool_pre_ping 防止拿到已断开的连接；pool_recycle 在数据库空闲超时前主动回收连接（Render 托管 PG 会断开空闲连接）
engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=1800,
)

# 为线上已有数据库补建缺失索引（幂等，CREATE INDEX IF NOT EXISTS 不会重复创建）
_EXTRA_INDEXES = [
    "CREATE INDEX IF NOT EXISTS idx_post_category ON post (category_id)",
    "CREATE INDEX IF NOT EXISTS idx_post_created ON post (created_at)",
    "CREATE INDEX IF NOT EXISTS idx_posttag_tag ON post_tag (tag_id)",
    "CREATE INDEX IF NOT EXISTS idx_comment_parent ON comment (parent_id)",
    "CREATE INDEX IF NOT EXISTS idx_chatter_created ON chatter (created_at)",
    "CREATE INDEX IF NOT EXISTS idx_chatter_comment_parent ON chatter_comment (parent_id)",
    "CREATE INDEX IF NOT EXISTS idx_visitor_created ON visitor (created_at)",
]


def _create_extra_indexes():
    try:
        with engine.begin() as conn:
            for stmt in _EXTRA_INDEXES:
                conn.exec_driver_sql(stmt)
    except Exception:
        # 建索引失败不阻塞启动（如权限不足或索引已存在）
        pass


def init_db():
    SQLModel.metadata.create_all(engine)
    _create_extra_indexes()
    if ADMIN_USERNAME and ADMIN_PASSWORD:
        with Session(engine) as session:
            user = session.exec(
                select(User).where(User.username == ADMIN_USERNAME)
            ).first()
            if user is None:
                session.add(
                    User(
                        username=ADMIN_USERNAME,
                        hashed_password=hash_password(ADMIN_PASSWORD),
                        nickname=ADMIN_NICKNAME,
                        is_admin=True,
                    )
                )
                session.commit()
            else:
                updated = False

                if not verify_password(ADMIN_PASSWORD, user.hashed_password):
                    user.hashed_password = hash_password(ADMIN_PASSWORD)
                    updated = True

                if user.nickname != ADMIN_NICKNAME:
                    user.nickname = ADMIN_NICKNAME
                    updated = True

                if not user.is_admin:
                    user.is_admin = True
                    updated = True

                if updated:
                    session.add(user)
                    session.commit()


def get_session():
    with Session(engine) as session:
        yield session
