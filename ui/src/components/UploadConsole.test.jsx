import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import UploadConsole from "./UploadConsole";
import {
  MAX_FILE_COUNT,
  MAX_FILE_SIZE,
  NEW_NAME_MAX_LENGTH,
} from "../config/constants";

// Mock the uuidv4 function for convenience.
jest.mock("uuid", () => ({
  v4: jest.fn(() => Math.random().toString(36).substring(7)),
}));

// Mock the fetch function
global.fetch = jest.fn(() => new Promise(() => {}));

/**
 * The UploadConsole component allows users to upload files to the server.
 */
describe("UploadConsole", () => {
  // A prop function that will be called when an upload is successful.
  const mockOnUploadSuccess = jest.fn();

  // Clear all mocks before each test.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test that the UploadConsole component renders.
  test("The UploadConsole compoonent renders.", () => {
    render(<UploadConsole onUploadSuccess={mockOnUploadSuccess} />);
    const selectFilesButton = screen.getByText("Select Files");
    expect(selectFilesButton).toBeInTheDocument();
  });

  // The handleButtonClick function should trigger the file input click event.
  test("The handleButtonClick function does not triggers the file input click event if the file input is not present.", () => {
    render(<UploadConsole onUploadSuccess={mockOnUploadSuccess} />);

    // Mock the click event on the Select Files button.
    const fileInput = screen.getByTestId("file-input");
    const clickMock = jest.fn();
    fileInput.click = clickMock;

    // Click the Select Files button and check if the file input dialog is open.
    fireEvent.click(screen.getByText("Select Files"));
    expect(clickMock).toHaveBeenCalled();
  });

  // Test that the file input dialog opens when the Select Files button is clicked.
  test("The file input dialog opens when the Select Files button is clicked.", () => {
    render(<UploadConsole onUploadSuccess={mockOnUploadSuccess} />);
    const selectFilesButton = screen.getByText("Select Files");
    const fileInput = screen.getByTestId("file-input");

    // Mock the click event on the Select Files button.
    const clickMock = jest.fn();
    fileInput.click = clickMock;

    // Click the Select Files button and check if the file input dialog is open.
    // This doesn't actually check if the file input dialog is open, but it checks if the click event is fired.
    fireEvent.click(selectFilesButton);
    expect(clickMock).toHaveBeenCalled();
  });

  // Test that the requisite files are added to the state.
  test("Selected files are added to the state.", () => {
    render(<UploadConsole onUploadSuccess={mockOnUploadSuccess} />);
    const fileInput = screen.getByTestId("file-input");

    // Create a file object and add it to the file input.
    const file = new File(["file content"], "test-file.jpg", {
      type: "image/jpeg",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // The file name should appear beneath the buttons.
    const fileName = screen.getByText("test-file.jpg");
    expect(fileName).toBeInTheDocument();
  });

  // Test that the file count may not exceed the maximum.
  test("An alert is shown when the file count exceeds the maximum.", () => {
    window.alert = jest.fn();
    render(<UploadConsole onUploadSuccess={mockOnUploadSuccess} />);
    const fileInput = screen.getByTestId("file-input");
    const files = Array.from(
      { length: MAX_FILE_COUNT + 1 },
      (_, i) =>
        new File(["file content"], `file-${i}.jpg`, { type: "image/jpeg" })
    );
    fireEvent.change(fileInput, { target: { files } });
    expect(window.alert).toHaveBeenCalledWith(
      `You can only upload a total of ${MAX_FILE_COUNT} files at once.`
    );
  });

  // Test that the file size may not exceed the maximum.
  test("An alert is shown when a file exceeds the maximum.", () => {
    window.alert = jest.fn();
    render(<UploadConsole onUploadSuccess={mockOnUploadSuccess} />);
    const fileInput = screen.getByTestId("file-input");
    const file = new File(["file content"], "large-file.jpg", {
      type: "image/jpeg",
    });
    Object.defineProperty(file, "size", { value: MAX_FILE_SIZE + 1 });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("The following file is too large:")
    );
  });

  // Test that the file size may not exceed the maximum.
  test("An alert is shown when multiple files exceed the maximum.", () => {
    window.alert = jest.fn();
    render(<UploadConsole onUploadSuccess={mockOnUploadSuccess} />);
    const fileInput = screen.getByTestId("file-input");
    const smallFile = new File(["file content"], "small-file.jpg", {
      type: "image/jpeg",
    });
    const largeFile = new File(["file content"], "large-file.jpg", {
      type: "image/jpeg",
    });
    Object.defineProperty(largeFile, "size", { value: MAX_FILE_SIZE + 1 });
    fireEvent.change(fileInput, {
      target: { files: [largeFile, largeFile, smallFile] },
    });
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("The following files are too large:")
    );
  });

  // Test that a file can be deleted from the state.
  test("A file can be deleted from the state.", () => {
    render(<UploadConsole onUploadSuccess={mockOnUploadSuccess} />);
    const fileInput = screen.getByTestId("file-input");

    // Create a file object and add it to the file input.
    const file = new File(["file content"], "test-file.jpg", {
      type: "image/jpeg",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // The file name should appear beneath the buttons.
    const fileName = screen.getByText("test-file.jpg");
    expect(fileName).toBeInTheDocument();

    // Click the delete button and check if the file is removed.
    const deleteButton = screen.getByLabelText(`Delete test-file.jpg`);
    fireEvent.click(deleteButton);
    expect(screen.queryByText("test-file.jpg")).not.toBeInTheDocument();
  });

  // Test that a file can be renamed in the state.
  test("A file can be renamed in the state.", () => {
    window.prompt = jest.fn().mockReturnValue("newname");
    render(<UploadConsole onUploadSuccess={mockOnUploadSuccess} />);
    const fileInput = screen.getByTestId("file-input");

    // Create a file object and add it to the file input.
    const file = new File(["file content"], "test-file.jpg", {
      type: "image/jpeg",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // The file name should appear beneath the buttons.
    const fileName = screen.getByText("test-file.jpg");
    const renameButton = screen.getByLabelText("Rename test-file.jpg");
    expect(fileName).toBeInTheDocument();
    expect(renameButton).toBeInTheDocument();

    // Click the rename button and check if the file is renamed.
    act(() => {
      fireEvent.click(renameButton);
    });
    const newFileName = screen.getByText("newname.jpg");
    const newRenameButton = screen.getByLabelText("Rename newname.jpg");
    expect(newFileName).toBeInTheDocument();
    expect(newRenameButton).toBeInTheDocument();
    const oldFileName = screen.queryByText("test-file.jpg");
    const oldRenameButton = screen.queryByLabelText("Rename test-file.jpg");
    expect(oldFileName).not.toBeInTheDocument();
    expect(oldRenameButton).not.toBeInTheDocument();
  });

  // Test that a file cannot be renamed to nothing in the state.
  // This triggers an alert.
  test("A file cannot be renamed to nothing in the state and an alert is triggered.", () => {
    // This would rename the file to nothing.
    window.prompt = jest.fn().mockReturnValue("");
    render(<UploadConsole onUploadSuccess={mockOnUploadSuccess} />);
    const fileInput = screen.getByTestId("file-input");
    const file = new File(["file content"], "test-file.jpg", {
      type: "image/jpeg",
    });

    // Click the rename button and check if the file is renamed.
    fireEvent.change(fileInput, { target: { files: [file] } });
    const renameButton = screen.getByLabelText("Rename test-file.jpg");
    fireEvent.click(renameButton);
    expect(window.alert).toHaveBeenCalledWith(
      "You must enter a name for the file. Please try again."
    );
    const fileName = screen.getByText("test-file.jpg");
    expect(fileName).toBeInTheDocument();
  });

  // Test that a file cannot be renamed to anything above NEW_NAME_MAX_LENGTH characters in the state.
  // NOTE: A test of the alphanumeric regex is not included here.
  test("A file cannot be renamed to anything above NEW_NAME_MAX_LENGTH characters.", () => {
    // This would rename the file to a name that is too long.
    window.prompt = jest.fn().mockReturnValue("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    render(<UploadConsole onUploadSuccess={mockOnUploadSuccess} />);
    const fileInput = screen.getByTestId("file-input");
    const file = new File(["file content"], "test-file.jpg", {
      type: "image/jpeg",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Click the rename button and check if the file is renamed.
    const renameButton = screen.getByLabelText("Rename test-file.jpg");
    fireEvent.click(renameButton);
    expect(window.alert).toHaveBeenCalledWith(
      `Names must be alphanumeric and under ${NEW_NAME_MAX_LENGTH} characters. Do not include the file extension.`
    );
    const fileName = screen.getByText("test-file.jpg");
    expect(fileName).toBeInTheDocument();
  });

  // Test that a file which is not renamed is not affected by a different rename.
  test("A file which is not renamed is not affected by a different rename.", () => {
    window.prompt = jest.fn().mockReturnValue("testfile3");
    render(<UploadConsole onUploadSuccess={mockOnUploadSuccess} />);
    const fileInput = screen.getByTestId("file-input");
    const files = [
      new File(["file content"], "test-file.jpg", {
        type: "image/jpeg",
      }),
      new File(["file content"], "test-file-2.jpg", {
        type: "image/jpeg",
      }),
    ];
    fireEvent.change(fileInput, { target: { files } });

    // We now have two files. Rename test-file-2.jpg to test-file-3.jpg.
    const renameButton = screen.getByLabelText("Rename test-file-2.jpg");
    fireEvent.click(renameButton);

    // test-file.jpg should not be affected.
    const fileName = screen.getByText("test-file.jpg");
    expect(fileName).toBeInTheDocument();

    // test-file-2.jpg should be renamed to test-file-3.jpg.
    const fileName2 = screen.queryByText("test-file-2.jpg");
    expect(fileName2).not.toBeInTheDocument();
    const fileName3 = screen.getByText("testfile3.jpg");
    expect(fileName3).toBeInTheDocument();
  });

  // Test that the status text is properly displayed before uploading based upon selected files and removed files.
  test("The status text is properly displayed.", async () => {
    render(<UploadConsole onUploadSuccess={mockOnUploadSuccess} />);

    // This is the span element that displays the status text.
    // It should not be displayed when no files are selected.
    const fileInput = screen.queryByTestId("selected-status-text");
    expect(fileInput).not.toBeInTheDocument();

    // Create a file object and add it to the file input.
    const file = new File(["file content"], "test-file.jpg", {
      type: "image/jpeg",
    });
    fireEvent.change(screen.getByTestId("file-input"), {
      target: { files: [file] },
    });
    expect(screen.getByTestId("selected-status-text")).toBeInTheDocument();
    expect(screen.getByText("1 file selected.")).toBeInTheDocument();

    // Add the same file again.
    fireEvent.change(screen.getByTestId("file-input"), {
      target: { files: [file] },
    });
    expect(screen.getByText("2 files selected.")).toBeInTheDocument();

    // Bulk upload.
    fireEvent.change(screen.getByTestId("file-input"), {
      target: { files: [file, file, file] },
    });
    expect(screen.getByText("5 files selected.")).toBeInTheDocument();

    // Ensure that the status text is removed when files are removed.
    fireEvent.click(screen.getAllByLabelText("Delete test-file.jpg")[0]);
    expect(screen.getByText("4 files selected.")).toBeInTheDocument();
    fireEvent.click(screen.getAllByLabelText("Delete test-file.jpg")[0]);
    expect(screen.getByText("3 files selected.")).toBeInTheDocument();
    fireEvent.click(screen.getAllByLabelText("Delete test-file.jpg")[0]);
    expect(screen.getByText("2 files selected.")).toBeInTheDocument();
    fireEvent.click(screen.getAllByLabelText("Delete test-file.jpg")[0]);
    expect(screen.getByText("1 file selected.")).toBeInTheDocument();
    fireEvent.click(screen.getAllByLabelText("Delete test-file.jpg")[0]);
    expect(
      screen.queryByTestId("selected-status-text")
    ).not.toBeInTheDocument();
  });

  // Test that the reset button clears the selected files.
  test("The reset button clears the selected files.", () => {
    render(<UploadConsole onUploadSuccess={mockOnUploadSuccess} />);
    const fileInput = screen.getByTestId("file-input");
    const file = new File(["file content"], "test-file.jpg", {
      type: "image/jpeg",
    });

    // Upload the file and ensure it is displayed.
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(screen.getByText("test-file.jpg")).toBeInTheDocument();

    // Click the reset button and ensure the file is removed.
    const resetButton = screen.getByText("Reset");
    fireEvent.click(resetButton);
    expect(screen.queryByText("test-file.jpg")).not.toBeInTheDocument();

    // Repeat, but with multiple files.
    fireEvent.change(fileInput, { target: { files: [file, file, file] } });
    expect(screen.getAllByText("test-file.jpg")).toHaveLength(3);
    fireEvent.click(resetButton);
    expect(screen.queryByText("test-file.jpg")).not.toBeInTheDocument();
  });

  // Test that clicking the upload button does nothing if no files are selected.
  test("Clicking the upload button does nothing if no files are selected.", () => {
    render(<UploadConsole onUploadSuccess={mockOnUploadSuccess} />);
    const uploadButton = screen.getByText("Upload");
    fireEvent.click(uploadButton);
    expect(fetch).not.toHaveBeenCalled();
  });

  // Test that submitting the upload form triggers the upload process.
  test("Submitting the upload form triggers the upload process.", async () => {
    render(<UploadConsole onUploadSuccess={mockOnUploadSuccess} />);
    const fileInput = screen.getByTestId("file-input");

    // Create a file object and add it to the file input.
    const file = new File(["file content"], "test-file.jpg", {
      type: "image/jpeg",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Mock the fetch function.
    fetch.mockResolvedValue({ ok: true });

    // Click the upload button.
    const uploadButton = screen.getByText("Upload");
    fireEvent.click(uploadButton);

    // Check if the fetch function was called.
    await waitFor(() => expect(fetch).toHaveBeenCalled());
  });

  // Test that an error thrown during the upload process is handled gracefully.
  test("An error thrown during the upload process is handled gracefully and the rejected files are retained.", async () => {
    render(<UploadConsole onUploadSuccess={mockOnUploadSuccess} />);
    const fileInput = screen.getByTestId("file-input");

    // Create a file object and add it to the file input.
    const file = new File(["file content"], "test-file.jpg", {
      type: "image/jpeg",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Mock the fetch function.
    fetch.mockRejectedValue(new Error("Upload failed."));

    // Click the upload button.
    const uploadButton = screen.getByText("Upload");
    fireEvent.click(uploadButton);

    // Check if the fetch function was called.
    await waitFor(() => expect(fetch).toHaveBeenCalled());

    // Check that the file is retained in the selection.
    const fileName = screen.getByText("test-file.jpg");
    expect(fileName).toBeInTheDocument();
  });

  // The progress text should be displayed during the upload process.
  test("The progress text is displayed correctly during the upload process for multiple file uploads.", async () => {
    render(<UploadConsole onUploadSuccess={mockOnUploadSuccess} />);
    const fileInput = screen.getByTestId("file-input");
    const files = [
      new File(["file content"], "test-file-1.jpg", { type: "image/jpeg" }),
      new File(["file content"], "test-file-2.jpg", { type: "image/jpeg" }),
    ];
    fireEvent.change(fileInput, { target: { files } });

    // Check that the status text shows the correct number of selected files.
    expect(screen.getByTestId("selected-status-text").textContent).toBe(
      "2 files selected."
    );

    // Simulate clicking the upload button.
    const uploadButton = screen.getByText("Upload");
    fireEvent.click(uploadButton);

    // Check that the status text shows the uploading message.
    expect(screen.getByTestId("selected-status-text").textContent).toBe(
      "Uploading 2 files..."
    );
  });

  // The progress text should be displayed during the upload process.
  test("The progress text is displayed correctly during the upload process for single file uploads.", async () => {
    render(<UploadConsole onUploadSuccess={mockOnUploadSuccess} />);
    const fileInput = screen.getByTestId("file-input");
    const files = [
      new File(["file content"], "test-file-1.jpg", { type: "image/jpeg" }),
    ];
    fireEvent.change(fileInput, { target: { files } });

    // Check that the status text shows the correct number of selected files.
    expect(screen.getByTestId("selected-status-text").textContent).toBe(
      "1 file selected."
    );

    // Simulate clicking the upload button.
    const uploadButton = screen.getByText("Upload");
    fireEvent.click(uploadButton);

    // Check that the status text shows the uploading message.
    expect(screen.getByTestId("selected-status-text").textContent).toBe(
      "Uploading 1 file..."
    );
  });

  // Long file names should be truncated.
  test("Long file names are truncated.", () => {
    render(<UploadConsole onUploadSuccess={mockOnUploadSuccess} />);
    const fileInput = screen.getByTestId("file-input");

    // Only the truncated and the short file names should be displayed.
    // The alphabet, repeated twice, plus the file extension.
    const longFileName = "A".repeat(50) + ".jpg";
    const truncatedFileName = longFileName.slice(0, 40) + "...";
    const shortFileName = "ABC.jpg";
    const longFileNameFile = new File(["file content"], longFileName, {
      type: "image/jpeg",
    });
    const shortFileNameFile = new File(["file content"], shortFileName, {
      type: "image/jpeg",
    });
    fireEvent.change(fileInput, {
      target: { files: [longFileNameFile, shortFileNameFile] },
    });

    // Check that the correct file names are displayed.
    expect(screen.queryByText(longFileName)).not.toBeInTheDocument();
    expect(screen.getByText(truncatedFileName)).toBeInTheDocument();
    expect(screen.getByText(shortFileName)).toBeInTheDocument();
  });
});
