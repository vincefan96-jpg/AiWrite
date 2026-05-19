import uuid
from datetime import datetime

from pydantic import BaseModel


class PolishRequest(BaseModel):
    content: str


class StyleConvertRequest(BaseModel):
    content: str
    style: str


class TranslateRequest(BaseModel):
    content: str
    target_language: str


class SummarizeRequest(BaseModel):
    content: str
    length: str = "medium"


class WritingResponse(BaseModel):
    result: str


class VersionResponse(BaseModel):
    id: uuid.UUID
    document_id: uuid.UUID
    content: str
    version_number: int
    operation_type: str
    operation_meta: dict
    created_at: datetime

    class Config:
        from_attributes = True


class VersionRestoreResponse(BaseModel):
    content: str
    version_id: uuid.UUID
    version_number: int
