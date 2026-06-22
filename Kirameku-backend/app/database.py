from sqlmodel import SQLModel, create_engine, Session, select
from app.config import DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_NICKNAME
from app.models import User
from app.utils.auth import hash_password

engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)


def init_db():
    SQLModel.metadata.create_all(engine)
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


def get_session():
    with Session(engine) as session:
        yield session
