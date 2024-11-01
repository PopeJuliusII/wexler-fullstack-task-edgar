import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { v4 as uuidv4 } from "uuid";
import {
  MAX_FILE_COUNT,
  MAX_FILE_SIZE,
  NEW_NAME_MAX_LENGTH,
  NEW_NAME_REGEX,
  API_ENDPOINT_BASE,
  IMAGES_ENDPOINT_SUFFIX,
} from "../config/constants";

/**
 * A component that allows users to upload files to the backend for processing.
 * @param {function} onUploadSuccess - A callback function that is called when the files are successfully uploaded.
 */
const UploadConsole = ({ onUploadSuccess }) => {
  // STATE VARIABLES
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressCount, setUploadProgressCount] = useState(0);

  // REF VARIABLES
  const fileInputRef = useRef(uuidv4());

  // ACTION HANDLERS
  /**
   * Opens the file input dialog when the button is clicked.
   * N.B. The file input is hidden and triggered programmatically because
   * the value of the input cannot be set.
   */
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  /**
   * Adds the selected files to the state.
   * Alerts are used if the number of files exceeds the maximum file count,
   * or if any of the files are too large.
   */
  const handleFileChange = (event) => {
    // Check if the number of files exceeds the maximum file count.
    if (event.target.files.length + selectedFiles.length > MAX_FILE_COUNT) {
      alert(`You can only upload a total of ${MAX_FILE_COUNT} files at once.`);
      return;
    }

    // Filter out all files that are too large and alert the user.
    let invalidFileNames = [];
    const validFiles = Array.from(event.target.files).filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        invalidFileNames.push(file.name);
        return false;
      }
      return true;
    });
    if (invalidFileNames.length > 0) {
      let alertText = "";
      alertText += `The following file`;
      alertText += invalidFileNames.length > 1 ? "s are" : " is";
      alertText += ` too large:\n\n${invalidFileNames.join(
        ", "
      )}.\n\nThe limit is ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(2)} MB.`;
      alertText +=
        event.target.files.length > invalidFileNames.length
          ? " The remaining files have been added."
          : "";
      alert(alertText);
    }

    // Add the valid files to the state.
    const files = validFiles.map((file) => {
      return {
        id: uuidv4(),
        file: file,
        uploaded: false,
        uploadFailed: false,
      };
    });
    files && setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  /**
   * Sends the selected files to the backend for processing.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Set the upload progress count to the number of files to upload.
    setUploadProgressCount(selectedFiles.length);

    // Disable all buttons while the files are being uploaded.
    setIsUploading(true);

    // Upload each file concurrently.
    await Promise.all(
      selectedFiles.map(async (fileData) => {
        // Create a new FormData object and append the file to it.
        const formData = new FormData();
        formData.append("files", fileData.file);

        try {
          // Send the file to the backend for processing.
          const response = await fetch(
            API_ENDPOINT_BASE + IMAGES_ENDPOINT_SUFFIX,
            {
              method: "POST",
              body: formData,
            }
          );

          // If the upload was successful, update the file's state.
          // Successful uploads are removed from the state and only failed uploads are retained.
          fileData.uploaded = response.ok;

          // Decrement the progress count, this is used as a progress indicator.
          setUploadProgressCount((prevCount) => prevCount - 1);
        } catch (error) {
          console.error("Error uploading file:", error);
          setUploadProgressCount((prevCount) => prevCount - 1);
        }
      })
    );

    // If any files were successfully uploaded, onUploadSuccess is called.
    // This triggers the recompute of the image list.
    if (selectedFiles.some((file) => file.uploaded)) {
      onUploadSuccess();
    }

    // Retain only the files that failed to upload.
    const filesToRetain = Array.from(
      selectedFiles.filter((file) => !file.uploaded)
    );
    filesToRetain.forEach((file) => (file.uploadFailed = true));
    setSelectedFiles(filesToRetain);

    // If any files failed to upload, alert the user.
    if (selectedFiles.some((file) => file.uploadFailed)) {
      alert(
        "Some files failed to upload. They have been retained in your selection."
      );
    }

    // Re-enable all buttons after the files have been uploaded.
    setIsUploading(false);
  };

  /**
   * Removes all selected files from the state.
   */
  const handleReset = () => {
    setSelectedFiles([]);
  };

  /**
   * Handles the deletion of an individual file from the state.
   * @param {string} id - The unique identifier of the file to delete.
   */
  const handleDelete = (id) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
  };

  /**
   * Handles the renaming of an individual file.
   * @param {string} id - The unique identifier of the file to rename.
   */
  const handleRename = (id) => {
    const newName = prompt(
      `Enter a new name for the file. Names must be alphanumeric and under ${NEW_NAME_MAX_LENGTH} characters. Do not include the file extension.`
    );
    const fileExtension = selectedFiles
      .find((file) => file.id === id)
      .file.name.split(".")
      .pop();
    if (!newName) {
      alert("You must enter a name for the file. Please try again.");
    } else if (!NEW_NAME_REGEX.test(newName)) {
      alert(
        `Names must be alphanumeric and under ${NEW_NAME_MAX_LENGTH} characters. Do not include the file extension.`
      );
    } else {
      setSelectedFiles((prevFiles) =>
        prevFiles.map((file) => {
          if (file.id === id) {
            // Update the name of the file by creating a new File object.
            const newFileName = newName + "." + fileExtension;
            const newFile = new File([file.file], newFileName, {
              type: file.file.type,
            });
            return {
              ...file,
              file: newFile,
            };
          }
          return file;
        })
      );
    }
  };

  // RENDER
  return (
    <div className="flex flex-col items-center">
      <div className="divider"></div>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="btn btn-active btn-neutral"
            onClick={handleButtonClick}
            disabled={isUploading}
          >
            Select Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            // These are Imgur's accepted file types.
            // Source: https://apidocs.imgur.com/#2078c7e0-c2b8-4bc8-a646-6e544b087d0f
            // Alternatively, replace with accept="image/*" for all image types and to check exclusively on the backend.
            accept="image/jpeg image/jpg image/gif image/png image/apng image/tiff"
            onChange={handleFileChange}
            data-testid="file-input"
          />
          <button
            type="button"
            className="btn btn-error"
            onClick={handleReset}
            disabled={isUploading}
          >
            Reset
          </button>
          <button
            type="submit"
            className="btn btn-accent"
            disabled={isUploading}
          >
            Upload
          </button>
        </div>
      </form>
      {selectedFiles.length > 0 ? <div className="divider"></div> : <></>}
      {selectedFiles.length > 0 ? (
        <div>
          <span
            className="file-input-text flex items-center justify-center"
            data-testid="selected-status-text"
          >
            {isUploading
              ? `Uploading ${uploadProgressCount} file${
                  uploadProgressCount > 1 ? "s" : ""
                }...`
              : `${selectedFiles.length} file${
                  selectedFiles.length > 1 ? "s" : ""
                } selected.`}
          </span>
          <div className="relative">
            <ul className="grid grid-cols-4 gap-0">
              {selectedFiles.map(({ id, file, uploadFailed, uploaded }) => {
                // The colour of the file indicates the progress of the upload.
                let textColorClass = "";
                if (uploadFailed && !isUploading) {
                  textColorClass = "text-red-500";
                } else if (isUploading) {
                  textColorClass = "text-yellow-500";
                } else {
                  textColorClass = "text-gray-500";
                }

                return (
                  <li key={id} className="flex items-center px-4 py-0 my-0">
                    <button
                      className="btn btn-ghost my-0 px-1 py-0 flex items-center justify-center"
                      onClick={() => handleDelete(id)}
                      aria-label={`Delete ${file.name}`}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                    <button
                      className="btn btn-ghost my-0 px-1 py-0 flex items-center justify-center"
                      onClick={() => {
                        handleRename(id);
                      }}
                      aria-label={`Rename ${file.name}`}
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </button>
                    <span
                      className={`truncate ${textColorClass}`}
                      title={file.name}
                    >
                      {file.name.slice(0, 40) +
                        (file.name.length > 40 ? "..." : "")}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : (
        <></>
      )}
      <div className="divider"></div>
    </div>
  );
};

export default UploadConsole;
