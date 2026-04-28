"""
Centralized configuration for the Bill Splitter backend
All environment variables and settings are managed here
"""
import os
from typing import Optional


class Config:
    """Application configuration loaded from environment variables"""
    
    # ============================================================================
    # AWS Configuration
    # ============================================================================
    AWS_REGION: str = os.getenv('AWS_REGION', 'ap-southeast-1')
    AWS_ACCESS_KEY_ID: Optional[str] = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv('AWS_SECRET_ACCESS_KEY')
    
    # ============================================================================
    # DynamoDB Table Names
    # ============================================================================
    DYNAMODB_USERS_TABLE: str = os.getenv('DYNAMODB_USERS_TABLE', 'BillSplitter-Users')
    DYNAMODB_RECEIPTS_TABLE: str = os.getenv('DYNAMODB_RECEIPTS_TABLE', 'BillSplitter-Receipts')
    DYNAMODB_SPLIT_SESSIONS_TABLE: str = os.getenv('DYNAMODB_SPLIT_SESSIONS_TABLE', 'BillSplitter-SplitSessions')
    DYNAMODB_PAYMENT_REQUESTS_TABLE: str = os.getenv('DYNAMODB_PAYMENT_REQUESTS_TABLE', 'BillSplitter-PaymentRequests')
    DYNAMODB_TRANSACTION_HISTORY_TABLE: str = os.getenv('DYNAMODB_TRANSACTION_HISTORY_TABLE', 'BillSplitter-TransactionHistory')
    
    # ============================================================================
    # Alibaba Cloud AI (Qwen Model)
    # ============================================================================
    ALIBABA_API_KEY: Optional[str] = os.getenv('ALIBABA_API_KEY')
    ALIBABA_BASE_URL: str = os.getenv('ALIBABA_BASE_URL', 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1')
    ALIBABA_MODEL: str = os.getenv('ALIBABA_MODEL', 'qwen-plus')
    ALIBABA_VISION_MODEL: str = os.getenv('ALIBABA_VISION_MODEL', 'qwen-vl-plus')
    
    # ============================================================================
    # Application Settings
    # ============================================================================
    LOG_LEVEL: str = os.getenv('LOG_LEVEL', 'INFO')
    ENVIRONMENT: str = os.getenv('ENVIRONMENT', 'development')
    
    # ============================================================================
    # TNG eWallet API
    # ============================================================================
    TNG_API_KEY: Optional[str] = os.getenv('TNG_API_KEY')
    TNG_MERCHANT_ID: Optional[str] = os.getenv('TNG_MERCHANT_ID')
    
    # ============================================================================
    # CORS Settings
    # ============================================================================
    ALLOWED_ORIGINS: str = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:3000')
    
    # ============================================================================
    # Lambda Settings
    # ============================================================================
    LAMBDA_TIMEOUT: int = int(os.getenv('LAMBDA_TIMEOUT', '30'))
    LAMBDA_MEMORY: int = int(os.getenv('LAMBDA_MEMORY', '512'))
    
    @classmethod
    def get_allowed_origins_list(cls) -> list:
        """Get CORS allowed origins as a list"""
        return [origin.strip() for origin in cls.ALLOWED_ORIGINS.split(',')]
    
    @classmethod
    def is_production(cls) -> bool:
        """Check if running in production environment"""
        return cls.ENVIRONMENT.lower() == 'production'
    
    @classmethod
    def validate(cls) -> None:
        """Validate required configuration"""
        required = []
        
        if not cls.ALIBABA_API_KEY and cls.is_production():
            required.append('ALIBABA_API_KEY')
        
        if required:
            raise ValueError(f"Missing required environment variables: {', '.join(required)}")


# Create a singleton instance
config = Config()

# Validate configuration on import (only in production)
if config.is_production():
    config.validate()

