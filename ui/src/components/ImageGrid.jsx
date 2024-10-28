import React, { useEffect, useState } from "react";
import {
  API_ENDPOINT_BASE,
  IMAGES_ENDPOINT_SUFFIX,
  IMAGE_ENDPOINT_SUFFIX,
  IMGUR_DOMAIN_PREFIX,
} from "../config/constants";

/**
 * A component that displays a grid of images.
 * @param {boolean} recompute - a flag that triggers a re-render of the component.
 * @param {function} setRecompute - a function to set the recompute flag.
 */
const ImageGrid = ({ recompute, setRecompute }) => {
  // STATE INPUT VARIABLES
  const [images, setImages] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isError, setIsError] = useState(false);

  // USE EFFECTS
  // Pull the images from the Imgur API.
  useEffect(() => {
    if (recompute) {
      const fetchImages = async () => {
        try {
          // Fetch the images from the API.
          const response = await fetch(
            `${API_ENDPOINT_BASE}${IMAGES_ENDPOINT_SUFFIX}`
          );
          if (!response.ok) {
            setIsError(true);
            return;
          }
          // Parse the response.
          const images = await response.json();

          // Set the images in the state.
          setImages(images);
          setRecompute(false);
        } catch (error) {
          console.error("Error fetching images:", error);
          setIsError(true);
        }
      };

      // Fetch the images.
      fetchImages();
    }
  }, [setRecompute, recompute]);

  // ACTION HANDLERS

  /**
   * Deletes an image from the Imgur API and updates the state without pulling the images again.
   * @param {string} imageId - the ID of the image to delete.
   */
  const handleDelete = async (imageId) => {
    // Deactivate all delete buttons.
    setIsDeleting(true);

    // Delete the image from the API.
    try {
      const response = await fetch(
        `${API_ENDPOINT_BASE}${IMAGE_ENDPOINT_SUFFIX}${imageId}`,
        {
          method: "DELETE",
        }
      );

      // If the deletion was successful, recompute the images.
      if (response.ok) {
        setImages((prevImages) =>
          prevImages.filter((image) => image.id !== imageId)
        );
      } else if (response.status === 404) {
        alert("Image not found. It may have already been deleted.");
      } else {
        alert("Failed to delete image. Please try again later.");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image. Please try again later.");
    }

    // Reactivate all delete buttons.
    setIsDeleting(false);
  };

  // RENDER
  return (
    <div className="image-grid">
        {isError ? (
          <span className="file-input-text flex items-center justify-center">
            {"An error occurred while fetching images. Please refresh the page."}
          </span>
        ) : (
      <ul className="grid grid-cols-2 gap-4 mx-8">
        {images.map((image) => {
          return (
            <li key={image.id} className="relative">
              <div className="card lg:card-side bg-base-100 shadow-xl">
                <a href={`${IMGUR_DOMAIN_PREFIX}${image.id}`} target="_blank" rel="noreferrer noopener">
                <figure>
                  <img
                    src={image.link}
                    alt={image.title}
                    className="h-60 w-full object-cover"
                  />
                </figure>
                </a>
                <div className="card-body max-h-60 min-h-60 max-w-full">
                  <h2 className="card-title text-lg truncate" title={image.title} onClick={() => navigator.clipboard.writeText(image.title)}>
                    {image.title.length > 30 ? `${image.title.slice(0, 30)}...` : image.title}
                  </h2>
                  <div className="space-y-1 flex-grow">
                    <p className="text-sm">Views: {image.views}</p>
                    <p className="text-sm">
                      {`Added On: ${new Date(
                        image.datetime * 1000
                      ).toLocaleString()}`}
                    </p>
                  </div>
                  <div className="card-actions justify-end">
                    <button
                      className="btn btn-error"
                      disabled={isDeleting}
                      onClick={() => handleDelete(image.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul> )}
    </div>
  );
};

export default ImageGrid;
