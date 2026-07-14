from minio import Minio
from datetime import timedelta
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Internal client for uploads/management
client = Minio(
    settings.minio_endpoint,
    access_key=settings.minio_access_key,
    secret_key=settings.minio_secret_key,
    secure=settings.minio_secure,
)

def get_presigned_url(object_name: str, expires_delta: timedelta = timedelta(hours=1)):
    """
    Generates a presigned URL. 
    Technical Fix: Swaps the internal MINIO_ENDPOINT with the public MINIO_PUBLIC_URL 
    so visitors outside the Docker network can render the content.
    """
    try:
        # Generate internal URL
        url = client.presigned_get_object(
            settings.minio_bucket,
            object_name,
            expires=expires_delta,
        )
        
        # Rewrite URL for public access
        # If internal endpoint is 'minio:9000' and public is 'http://123.45.67.89:9000'
        internal_base = f"{settings.minio_endpoint}/{settings.minio_bucket}"
        # Presigned URL format is typically http://endpoint/bucket/object?params
        
        if settings.minio_endpoint in url:
            # Simple string replace for the base part
            public_base = f"{settings.minio_public_url.rstrip('/')}/{settings.minio_bucket}"
            url = url.replace(f"http://{settings.minio_endpoint}/{settings.minio_bucket}", public_base)
            url = url.replace(f"https://{settings.minio_endpoint}/{settings.minio_bucket}", public_base)
            
        return url
    except Exception as e:
        logger.error(f"Error generating presigned URL: {e}")
        return None

async def upload_file(file_data, object_name: str, content_type: str):
    """
    Uploads a file to MinIO.
    """
    try:
        if not client.bucket_exists(settings.minio_bucket):
            client.make_bucket(settings.minio_bucket)
            
        client.put_object(
            settings.minio_bucket,
            object_name,
            file_data,
            length=-1,
            part_size=10*1024*1024, # 10MB parts
            content_type=content_type
        )
        return object_name
    except Exception as e:
        logger.error(f"Error uploading to MinIO: {e}")
        return None
