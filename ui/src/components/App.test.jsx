import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import App from "./App";

// Mock child components.
// The Header component is a simple component that renders a logo.
jest.mock("./Header", () => () => <div data-testid="header">Header</div>);

// Here, the primary thing to test is the onUploadSuccess prop that the UploadConsole component receives.
jest.mock("./UploadConsole", () => ({ onUploadSuccess }) => (
  <button data-testid="upload-console" onClick={onUploadSuccess}>
    UploadConsole
  </button>
));

// The main thing to test in the ImageGrid component is the recompute prop that it receives and the setRecompute prop that it calls.
jest.mock("./ImageGrid", () => ({ recompute, setRecompute }) => (
  <div data-testid="image-grid">
    ImageGrid - recompute: {recompute.toString()}
    <button onClick={() => setRecompute((prev) => !prev)}>
      Toggle Recompute
    </button>
  </div>
));

describe("App", () => {
  // Test that the header component renders.
  test("The header component renders.", () => {
    render(<App />);
    const headerElement = screen.getByTestId("header");
    expect(headerElement).toBeInTheDocument();
  });

  // Test that the upload console component renders.
  test("The upload console component renders.", () => {
    render(<App />);
    const uploadConsoleElement = screen.getByTestId("upload-console");
    expect(uploadConsoleElement).toBeInTheDocument();
  });

  // Test that the image grid component renders.
  test("The image grid component renders.", () => {
    render(<App />);
    const imageGridElement = screen.getByTestId("image-grid");
    expect(imageGridElement).toBeInTheDocument();
  });

  // Test that the recompute state is updated when the upload console triggers an upload success.
  test("Update the recompute state from UploadConsole.", async () => {
    // This is the initial action upon page load - the recompute state is true then becomes false.
    render(<App />);
    const uploadConsoleElement = screen.getByTestId("upload-console");
    const imageGridButton = screen.getByText("Toggle Recompute");
    const imageGridElement = screen.getByTestId("image-grid");
    act(() => {
      fireEvent.click(imageGridButton);
    });

    // The recompute state is false.
    await waitFor(() => {
      expect(imageGridElement).toHaveTextContent("recompute: false");
    });

    // This is the equivalent of a successful upload - the image grid should recompute.
    act(() => {
      fireEvent.click(uploadConsoleElement);
    });

    // The recompute state should now be true.
    await waitFor(() => {
      expect(imageGridElement).toHaveTextContent("recompute: true");
    });
  });

  // Test that the recompute state is updated when recompute is toggled from the ImageGrid component.
  test("toggles recompute state from ImageGrid", () => {
    render(<App />);
    const imageGridElement = screen.getByTestId("image-grid");
    const imageGridButton = screen.getByText("Toggle Recompute");
    expect(imageGridElement).toHaveTextContent("recompute: true");
    act(() => {
      fireEvent.click(imageGridButton);
    });
    expect(imageGridElement).toHaveTextContent("recompute: false");
    act(() => {
      fireEvent.click(imageGridButton);
    });
    expect(imageGridElement).toHaveTextContent("recompute: true");
  });
});
