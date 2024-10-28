/**
 * This file houses constants and enpoints used throughout the application.
 */

// Upload image constants - constants used when determining
// the size and nature of the images to upload.
export const MAX_FILE_COUNT = 20;

// 20 MB is the Imgur limit for non-animated images.
// https://help.imgur.com/hc/en-us/articles/26511665959579-What-files-can-I-upload-Is-there-a-size-limit
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // MB
export const NEW_NAME_MAX_LENGTH = 20;
export const NEW_NAME_REGEX = /^[a-zA-Z0-9]{1,20}$/;

// Upload image endpoints - endpoints used when uploading images.
export const API_ENDPOINT_BASE = "http://localhost:9001";
export const IMAGES_ENDPOINT_SUFFIX = "/images";
