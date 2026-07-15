import boto3
from botocore.config import Config
from datetime import timedelta
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Normalize endpoint URL (prepend https:// if not present)
endpoint_raw = settings.minio_endpoint
if not endpoint_raw.startswith(("http://", "https://")):
    endpoint_url = f"https://{endpoint_raw}"
else:
    endpoint_url = endpoint_raw

# Configure boto3 to use path-style addressing (required for Supabase S3)
s3_config = Config(
    s3={'addressing_style': 'path'},
    signature_version='s3v4'
)

# Initialize boto3 S3 client
s3_client = boto3.client(
    's3',
    endpoint_url=endpoint_url,
    aws_access_key_id=settings.minio_access_key,
    aws_secret_access_key=settings.minio_secret_key,
    config=s3_config
)

def get_presigned_url(object_name: str, expires_delta: timedelta = timedelta(hours=1)):
    """
    Generates a URL for a file. If a public URL prefix is set, we return the direct 
    public link (since the bucket is public). Otherwise, we generate a presigned URL.
    """
    try:
        if settings.minio_public_url:
            public_base = f"{settings.minio_public_url.rstrip('/')}/{settings.minio_bucket}"
            return f"{public_base}/{object_name}"
            
        # Fallback to generating a presigned URL
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': settings.minio_bucket,
                'Key': object_name
            },
            ExpiresIn=int(expires_delta.total_seconds())
        )
        return url
    except Exception as e:
        logger.error(f"Error generating URL: {e}")
        return None

async def upload_file(file_data, object_name: str, content_type: str):
    """
    Uploads a file to Supabase/S3.
    """
    try:
        s3_client.put_object(
            Bucket=settings.minio_bucket,
            Key=object_name,
            Body=file_data,
            ContentType=content_type
        )
        return object_name
    except Exception as e:
        logger.error(f"Error uploading to S3: {e}")
        return None

