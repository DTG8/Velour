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

import re

def get_presigned_url(object_name: str, expires_delta: timedelta = timedelta(hours=1)):
    """
    Generates a URL for a file. If a public URL prefix is set, we return the direct 
    public link (since the bucket is public). Otherwise, we generate a presigned URL.
    """
    try:
        if settings.minio_public_url:
            # Clean copy-paste labels like _URL\t from environment variables
            match = re.search(r'https?://[^\s]+', settings.minio_public_url)
            public_url_clean = match.group(0).rstrip('/') if match else settings.minio_public_url.rstrip('/')
            
            # Avoid duplicating bucket name in the URL
            bucket_part = settings.minio_bucket
            if public_url_clean.endswith(f"/{bucket_part}"):
                public_base = public_url_clean
            else:
                public_base = f"{public_url_clean}/{bucket_part}"
                
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

def resolve_avatar_url(avatar_url: str | None) -> str | None:
    """
    Resolves the avatar URL. If it starts with / or http/https, returns it as-is.
    Otherwise, generates a public/presigned URL.
    """
    if not avatar_url:
        return None
        
    # Clean copy-pasted prefixes from the string if they exist
    match = re.search(r'https?://[^\s]+', avatar_url)
    if match:
        return match.group(0)
        
    if avatar_url.startswith(("/", "http://", "https://")):
        return avatar_url
        
    return get_presigned_url(avatar_url)

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

