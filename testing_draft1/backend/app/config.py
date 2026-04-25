from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # AWS
    aws_region: str = "ap-southeast-1"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    
    # Amazon Textract
    textract_enabled: bool = True
    
    # Amazon Bedrock
    bedrock_model_id: str = "anthropic.claude-3-5-sonnet-20241022-v2:0"
    
    # AliCloud
    alicloud_access_key_id: str = ""
    alicloud_access_key_secret: str = ""
    alicloud_oss_bucket: str = ""
    alicloud_oss_endpoint: str = ""
    alicloud_db_connection_string: str = ""
    
    # App
    debug: bool = True
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
