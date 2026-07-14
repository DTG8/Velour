from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List
from app.database import SessionLocal
from app.dependencies import get_db, get_current_user, require_provider
from app.models.media import Media
from app.models.user import User
from app.core.storage import get_presigned_url, upload_file
from pydantic import BaseModel
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/catalogue", tags=["Media Catalogue"])

class MediaRead(BaseModel):
    id: int
    file_url: str
    media_type: str
    is_featured: bool

    class Config:
        from_attributes = True

# ── BACKGROUND TASK PLACEHOLDER ───────────────────────────────────────────────
def generate_video_thumbnail(video_object_name: str):
    """
    Optimization Placeholder: In a real environment, this would use FFmpeg 
    to extract a frame and upload it back to MinIO as a lightweight JPG.
    """
    logger.info(f"Background Task: Generating thumbnail for {video_object_name}")
    # Example command: ffmpeg -i input.mp4 -ss 00:00:01.000 -vframes 1 output.jpg
    pass

# ── PUBLIC ROUTE ──────────────────────────────────────────────────────────────
@router.get("/{username}", response_model=List[MediaRead])
def get_provider_catalogue(username: str, db: Session = Depends(get_db)):
    """
    Public View: Returns presigned URLs for all media in a provider's catalogue.
    """
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    media_items = db.query(Media).filter(Media.provider_id == user.id).all()
    
    results = []
    for item in media_items:
        presigned_url = get_presigned_url(item.file_url)
        results.append(MediaRead(
            id=item.id,
            file_url=presigned_url or item.file_url,
            media_type=item.media_type,
            is_featured=item.is_featured
        ))
        
    return results

# ── PROVIDER ROUTES ───────────────────────────────────────────────────────────
@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_media(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    is_featured: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_provider)
):
    """
    Upload Interface: Allows providers to upload images or videos.
    """
    file_ext = file.filename.split(".")[-1]
    object_name = f"{current_user.id}/{uuid.uuid4()}.{file_ext}"
    media_type = "video" if file.content_type.startswith("video") else "image"
    
    uploaded_name = await upload_file(file.file, object_name, file.content_type)
    if not uploaded_name:
        raise HTTPException(status_code=500, detail="Failed to upload file")
    
    new_media = Media(
        provider_id=current_user.id,
        file_url=object_name,
        media_type=media_type,
        is_featured=is_featured
    )
    db.add(new_media)
    db.commit()
    
    if media_type == "video":
        background_tasks.add_task(generate_video_thumbnail, object_name)
        
    return {"message": "File uploaded successfully", "id": new_media.id}

@router.delete("/{media_id}")
def delete_media(
    media_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_provider)
):
    media = db.query(Media).filter(
        Media.id == media_id, 
        Media.provider_id == current_user.id
    ).first()
    
    if not media:
        raise HTTPException(status_code=404, detail="Media item not found")
    
    db.delete(media)
    db.commit()
    return {"message": "Media deleted"}
