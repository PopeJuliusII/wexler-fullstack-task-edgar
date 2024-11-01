import express from "express";
import multer from "multer";
import axios from "axios";
import { IMGUR_BEARER_TOKEN } from "./config/secrets";
import {
  IMGUR_ACCOUNT_IMAGES_ENDPOINT,
  IMGUR_IMAGE_ENDPOINT,
} from "./config/endpoints";

const router = express.Router();
const upload = multer();

/**
 * This endpoint is used to upload files to Imgur.
 * The multer middleware is used to process the files uploaded in the request.
 */
router.post("/images", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0 || !Array.isArray(req.files)) {
    res
      .status(400)
      .send("No files attached or files are incorrectly formatted.");
    return;
  }

  const responses = await Promise.all(
    req.files.map(async (file) => {
      const formData = new FormData();
      formData.append("image", file.buffer.toString("base64"));
      formData.append("title", file.originalname);

      // The response tracker will give the status of each file upload and will be used to send the response back to the client.
      const responseTracker = {
        file: file.originalname,
        success: false,
        typeError: false,
      };

      // If the filetype is not one of the allowed types, the upload will fail.
      // These are Imgur's accepted file types.
      // Source: https://apidocs.imgur.com/#2078c7e0-c2b8-4bc8-a646-6e544b087d0f
      if (
        ![
          "image/jpeg",
          "image/jpg",
          "image/gif",
          "image/png",
          "image/apng",
          "image/tiff",
        ].includes(file.mimetype)
      ) {
        responseTracker.typeError = true;
        return responseTracker;
      }

      try {
        const response = await axios.post(IMGUR_IMAGE_ENDPOINT, formData, {
          headers: {
            Authorization: `Bearer ${IMGUR_BEARER_TOKEN}`,
          },
        });
        responseTracker.status = response.status;
        responseTracker.success = response.status === 200;
      } catch (error) {
        console.error("Error uploading image to Imgur:", error?.message ?? error);
        responseTracker.status = error?.response?.status ?? 500;
      }

      return responseTracker;
    })
  );

  if (responses.every((response) => response.success)) {
    res.status(200).send("success");
  } else if (responses.some((response) => response.status === 500)) {
    res.status(500).send("Failed to upload images to Imgur.");
  } else {
    //TODO: Integrate the returning of the responseTracker to the client and
    // the usage of additional error messages and codes for, for instance, type errors.
    res
      .status(400)
      .send(
        "Failed to upload some images to Imgur. Ensure that all files uploaded are of the correct size and type."
      );
  }
});

/**
 * This endpoint is used to retrieve a list of images uploaded to Imgur.
 * It retrieves the thumbnail versions of the images.
 *
 * @returns {Array} An array of image objects.
 */
router.get("/images", async (req, res) => {
  try {
    // The thumbnail size to retrieve from Imgur.
    //TODO: Allow the client to specify the thumbnail size.
    // "s" is optimal for the grid view, but "m" is a good compromise between quality and speed.
    const thumbnailSize = "m";

    // Pull data on all images from the account.
    const allImages = await axios.get(IMGUR_ACCOUNT_IMAGES_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${IMGUR_BEARER_TOKEN}`,
      },
    });

    // Convert each link to be a thumbnail version of the image.
    const allImagesData = allImages.data.data.map((image) => {
      return {
        ...image,
        link: image.link.replace(/(\.[a-z]+)$/, `${thumbnailSize}$1`),
      };
    });

    // Return the data to the user.
    res.send(allImagesData);
  } catch (error) {
    console.error("Error fetching images from Imgur:", error?.message ?? error);
    res.status(500).send("Failed to fetch images from Imgur.");
  }
});

/**
 * This endpoint is used to retrieve the details of a specific file from Imgur.
 *
 * @param {string} imageid The ID of the image to retrieve.
 * @returns {Object} The image object.
 */
router.get("/image/:imageid", async (req, res) => {
  try {
    // Pull the data for the specific image.
    const image = await axios.get(
      `${IMGUR_IMAGE_ENDPOINT}/${req.params.imageid}`,
      {
        headers: {
          Authorization: `Bearer ${IMGUR_BEARER_TOKEN}`,
        },
      }
    );

    // Return the data to the user.
    res.status(200).send(image.data.data);
  } catch (error) {
    // If the image is not found, return a 404.
    if (error?.response?.status === 404) {
      res.status(404).send("Image not found.");
      return;
    }

    // Otherwise, return a 500.
    console.error("Error fetching image from Imgur:", error?.message ?? error);
    res.status(500).send("Failed to fetch image from Imgur.");
  }
});

/**
 * This endpoint is used to delete a specific file from Imgur.
 *
 * @param {string} imageid The ID of the image to retrieve.
 * @returns {Object} The image object.
 */
router.delete("/image/:imageid", async (req, res) => {
  try {
    // Pull the data for the specific image.
    const response = await axios.delete(
      `${IMGUR_IMAGE_ENDPOINT}/${req.params.imageid}`,
      {
        headers: {
          Authorization: `Bearer ${IMGUR_BEARER_TOKEN}`,
        },
      }
    );

    // Return the data to the user.
    res.status(200).send("success");
  } catch (error) {
    // If the image is not found, return a 404.
    if (error?.response?.status === 404) {
      res.status(404).send("Image not found.");
      return;
    }

    // Otherwise, return a 500.
    console.error("Error fetching image from Imgur:", error?.message ?? error);
    res.status(500).send("Failed to delete image from Imgur.");
  }
});

export default router;
