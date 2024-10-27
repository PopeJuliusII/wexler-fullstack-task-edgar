import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { v4 as uuidv4 } from "uuid";

const UploadConsole = () => {
  // CONSTANTS
  const MAX_FILE_COUNT = 20;
  const MAX_FILE_SIZE = 100 * 1024 * 1024;
  const NEW_NAME_MAX_LENGTH = 20;
  const NEW_NAME_REGEX = /^[a-zA-Z0-9]{1,20}$/;

  // STATE VARIABLES
  const [selectedFiles, setSelectedFiles] = useState([]);

  // REF VARIABLES
  const fileInputRef = useRef(uuidv4());

  // ACTION HANDLERS
  /**
   * Opens the file input dialog when the button is clicked.
   * N.B. The file input is hidden and triggered programmatically because
   * the value of the input cannot be set.
   */
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
    const files = Array.from(validFiles).map((file) => {
      return {
        id: uuidv4(),
        file: file,
      };
    });
    files && setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  /**
   * Sends the selected files to the backend for processing.
   * //TODO: Complete function.
   */
  const handleSubmit = (event) => {
    event.preventDefault();
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
      alert("You must enter a name for the file.");
    } else if (!NEW_NAME_REGEX.test(newName)) {
      alert("Names must be alphanumeric. Do not include the file extension.");
    } else if (newName.length > 20) {
      alert(`Names must be under ${NEW_NAME_MAX_LENGTH} characters.`);
    } else {
      setSelectedFiles((prevFiles) =>
        prevFiles.map((file) => {
          if (file.id === id) {
            return {
              ...file,
              file: { ...file.file, name: newName + "." + fileExtension },
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
          >
            Select Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />
          <button type="button" className="btn btn-error" onClick={handleReset}>
            Reset
          </button>
          <button type="submit" className="btn btn-accent">
            Upload
          </button>
        </div>
      </form>
      {selectedFiles.length > 0 ? <div className="divider"></div> : <></>}
      {selectedFiles.length > 0 ? (
        <div>
          <span className="file-input-text flex items-center justify-center">
            {selectedFiles.length > 0
              ? `${selectedFiles.length} file${
                  selectedFiles.length > 1 ? "s" : ""
                } selected.`
              : ""}
          </span>
          <div className="relative">
            <ul className="grid grid-cols-4 gap-0">
              {selectedFiles.map(({ id, file }) => (
                <li key={id} className="flex items-center px-4 py-0 my-0">
                  <button
                    className="btn btn-ghost my-0 px-1 py-0 flex items-center justify-center"
                    onClick={() => handleDelete(id)}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                  <button
                    className="btn btn-ghost my-0 px-1 py-0 flex items-center justify-center"
                    onClick={() => {
                      handleRename(id);
                    }}
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </button>
                  {file.name}
                </li>
              ))}
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
