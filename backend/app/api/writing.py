import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.user import User
from app.models.version import Version
from app.schemas.writing import (
    PolishRequest,
    StyleConvertRequest,
    TranslateRequest,
    SummarizeRequest,
    WritingResponse,
    VersionResponse,
    VersionRestoreResponse,
)
from app.api.dependencies import get_current_user, get_user_document
from app.services.writing_service import polish_text, convert_style, translate_text, summarize_text

router = APIRouter(prefix="/api/documents", tags=["writing"])


@router.post("/{document_id}/polish", response_model=WritingResponse)
async def polish(
    document_id: uuid.UUID,
    body: PolishRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    doc = await get_user_document(document_id, current_user, db)
    content = body.content or doc.content
    result = await polish_text(content)
    return WritingResponse(result=result)


@router.post("/{document_id}/style-convert", response_model=WritingResponse)
async def style_convert(
    document_id: uuid.UUID,
    body: StyleConvertRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await get_user_document(document_id, current_user, db)
    result = await convert_style(body.content, body.style)
    return WritingResponse(result=result)


@router.post("/{document_id}/translate", response_model=WritingResponse)
async def translate(
    document_id: uuid.UUID,
    body: TranslateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await get_user_document(document_id, current_user, db)
    result = await translate_text(body.content, body.target_language)
    return WritingResponse(result=result)


@router.post("/{document_id}/summarize", response_model=WritingResponse)
async def summarize(
    document_id: uuid.UUID,
    body: SummarizeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await get_user_document(document_id, current_user, db)
    result = await summarize_text(body.content, body.length)
    return WritingResponse(result=result)


@router.get("/{document_id}/versions", response_model=list[VersionResponse])
async def list_versions(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await get_user_document(document_id, current_user, db)
    result = await db.execute(
        select(Version)
        .where(Version.document_id == document_id)
        .order_by(Version.version_number.desc())
    )
    return [VersionResponse.model_validate(v) for v in result.scalars().all()]


@router.get("/{document_id}/versions/{version_id}", response_model=VersionResponse)
async def get_version(
    document_id: uuid.UUID,
    version_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await get_user_document(document_id, current_user, db)
    result = await db.execute(
        select(Version).where(Version.id == version_id, Version.document_id == document_id)
    )
    version = result.scalar_one_or_none()
    if version is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version not found")
    return VersionResponse.model_validate(version)


@router.post("/{document_id}/versions/{version_id}/restore", response_model=VersionRestoreResponse)
async def restore_version(
    document_id: uuid.UUID,
    version_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    doc = await get_user_document(document_id, current_user, db)
    result = await db.execute(
        select(Version).where(Version.id == version_id, Version.document_id == document_id)
    )
    version = result.scalar_one_or_none()
    if version is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version not found")

    # 保存恢复前的内容
    count_result = await db.execute(
        select(Version).where(Version.document_id == document_id)
    )
    next_version = len(count_result.scalars().all()) + 1
    snapshot = Version(
        document_id=document_id,
        content=doc.content,
        version_number=next_version,
        operation_type="pre_restore_snapshot",
    )
    db.add(snapshot)

    doc.content = version.content
    restore_version_record = Version(
        document_id=document_id,
        content=version.content,
        version_number=next_version + 1,
        operation_type="restore",
        operation_meta={"restored_from_version": version.version_number},
    )
    db.add(restore_version_record)
    await db.commit()

    return VersionRestoreResponse(
        content=version.content,
        version_id=restore_version_record.id,
        version_number=restore_version_record.version_number,
    )
