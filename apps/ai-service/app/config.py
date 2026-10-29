from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://mindspace:mindspace@localhost:5432/mindspace"
    embedding_model: str = "text-embedding-3-small"


settings = Settings()
