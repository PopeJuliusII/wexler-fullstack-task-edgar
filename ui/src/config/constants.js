/**
 * This file houses constants and enpoints used throughout the application.
 */

// Upload image constants - constants used when determining
// the size and nature of the images to upload.
export const MAX_FILE_COUNT = 20;
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
export const NEW_NAME_MAX_LENGTH = 20;
export const NEW_NAME_REGEX = /^[a-zA-Z0-9]{1,20}$/;

// Upload image endpoints - endpoints used when uploading images.
export const UPLOAD_ENDPOINT_BASE = "http://localhost:9001";
