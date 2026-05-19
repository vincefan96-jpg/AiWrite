import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.user import User
from app.models.document import Document
from app.models.version import Version
from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse, DocumentListItem
from app.api.dependencies import get_current_user, get_user_document

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("", response_model=list[DocumentListItem])
async def list_documents(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document)
        .where(Document.user_id == current_user.id)
        .order_by(Document.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return [DocumentListItem.model_validate(doc) for doc in result.scalars().all()]


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    body: DocumentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    doc = Document(user_id=current_user.id, title=body.title, content=body.content)
    db.add(doc)
    await db.flush()

    version = Version(
        document_id=doc.id,
        content=body.content,
        version_number=1,
        operation_type="original",
    )
    db.add(version)
    await db.commit()
    await db.refresh(doc)
    return DocumentResponse.model_validate(doc)


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    doc = await get_user_document(document_id, current_user, db)
    return DocumentResponse.model_validate(doc)


@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: uuid.UUID,
    body: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    doc = await get_user_document(document_id, current_user, db)

    if body.title is not None:
        doc.title = body.title
    if body.content is not None:
        doc.content = body.content
        # 手动保存也创建新版本
        count_result = await db.execute(
            select(func.count(Version.id)).where(Version.document_id == doc.id)
        )
        next_version = count_result.scalar() + 1
        version = Version(
            document_id=doc.id,
            content=body.content,
            version_number=next_version,
            operation_type="manual_save",
        )
        db.add(version)

    await db.commit()
    await db.refresh(doc)
    return DocumentResponse.model_validate(doc)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    doc = await get_user_document(document_id, current_user, db)
    await db.delete(doc)
    await db.commit()
