import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import ImageGrid from "./ImageGrid";

// Mock fetch.
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve([
        {
          id: "1",
          title: "Test Image",
          link: "https://i.imgur.com/test.jpg",
          views: 100,
          datetime: 1620000000,
        },
      ]),
  })
);

/**
 * The ImageGrid component fetches images from the API and renders them in a grid.
 */
describe("ImageGrid", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  // Test that the component fetches images from the API and renders them.
  test("Renders images from the API endpoint.", async () => {
    render(<ImageGrid recompute={true} setRecompute={() => {}} />);

    // Wait for the images to be fetched and rendered.
    const imageTitle = await screen.findByText("Test Image");
    expect(imageTitle).toBeInTheDocument();
  });

  // Test that the component shows an error message when the fetch fails.
  test("Shows an error message upon a failure to pull the images.", async () => {
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: false }));
    render(<ImageGrid recompute={true} setRecompute={() => {}} />);

    // Wait the for error message to be rendered.
    const errorMessage = await screen.findByText(
      "An error occurred while fetching images. Please refresh the page."
    );
    expect(errorMessage).toBeInTheDocument();
  });

  // Test that the component copies the image title to the clipboard on click.
  test("Copies the title to the clipboard on click.", async () => {
    render(<ImageGrid recompute={true} setRecompute={() => {}} />);
    const imageTitle = await screen.findByText("Test Image");

    // Mock clipboard.
    const writeText = jest.fn();
    navigator.clipboard = { writeText };

    // Click on the title to copy it.
    fireEvent.click(imageTitle);
    expect(writeText).toHaveBeenCalledWith("Test Image");
  });

  // Test that an image can be deleted.
  // Note that whilst this test is useful, it is not a complete test of the delete functionality.
  // We need to also test if the delete button deletes the correct image.
  test("Deletes an image from the grid.", async () => {
    render(<ImageGrid recompute={true} setRecompute={() => {}} />);

    // Wait for the images to be fetched and rendered.
    const deleteButton = await screen.findByText("Delete");

    // Mock fetch for delete.
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: true }));

    // Click on the delete button.
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Check that the image is removed.
    const imageTitle = screen.queryByText("Test Image");
    expect(imageTitle).not.toBeInTheDocument();
  });

  // Test that a failure to delete an image is handled gracefully.
  test("Fails to delete an image from the grid.", async () => {
    render(<ImageGrid recompute={true} setRecompute={() => {}} />);

    // Wait for the images to be fetched and rendered.
    const deleteButton = await screen.findByText("Delete");

    // Mock fetch for delete.
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: false }));

    // Click on the delete button.
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Check that the image is removed.
    const imageTitle = screen.queryByText("Test Image");
    expect(imageTitle).toBeInTheDocument();
  });

  // Test that a failure to delete an image is handled gracefully.
  test("Fails to find an image to delete from the grid and receives a 404.", async () => {
    render(<ImageGrid recompute={true} setRecompute={() => {}} />);

    // Wait for the images to be fetched and rendered.
    const deleteButton = await screen.findByText("Delete");

    // Mock fetch for delete.
    fetch.mockImplementationOnce(() => Promise.resolve({ status: 404 }));

    // Click on the delete button.
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Check that the image is removed.
    const imageTitle = screen.queryByText("Test Image");
    expect(imageTitle).toBeInTheDocument();
  });

  // Test that a failure to delete an image is handled gracefully.
  test("Fails to delete an image from the grid because of a network error.", async () => {
    render(<ImageGrid recompute={true} setRecompute={() => {}} />);

    // Wait for the images to be fetched and rendered.
    const deleteButton = await screen.findByText("Delete");

    // Mock fetch for delete.
    fetch.mockImplementationOnce(() =>
      Promise.reject(new Error("Network Error"))
    );

    // Click on the delete button.
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Check that the image is removed.
    const imageTitle = screen.queryByText("Test Image");
    expect(imageTitle).toBeInTheDocument();
  });

  // Test that the if the component fails to fetch images, it sets the error state correctly.
  test("Handles the failure to fetch images correctly by setting the error-state to true.", async () => {
    // Mock fetch to simulate a network error.
    fetch.mockImplementationOnce(() =>
      Promise.reject(new Error("Network Error"))
    );

    // Spy on console.error.
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Render the component.
    render(<ImageGrid recompute={true} setRecompute={() => {}} />);

    // Wait for the error state to be set.
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching images:",
        expect.any(Error)
      );
    });
    await waitFor(() => {
      expect(
        screen.getByText(
          "An error occurred while fetching images. Please refresh the page."
        )
      ).toBeInTheDocument();
    });

    // This restores the original console.error function after the test.
    consoleErrorSpy.mockRestore();
  });

  // Test that if recompute is false, the component does not fetch images.
  test("No images are fetched when recompute is false.", () => {
    render(<ImageGrid recompute={false} setRecompute={() => {}} />);
    expect(fetch).not.toHaveBeenCalled();
  });

  // Test that the truncation of the title works correctly.
  test("Truncates the title of the image correctly.", async () => {
    // A longer title than the default one.
    const longTitle = "ABCDEFGHIJKLMNOPQRSTUVWXYZ12345";
    const truncatedTitle = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234...";
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: "1",
              title: longTitle,
              link: "https://i.imgur.com/test.jpg",
              views: 100,
              datetime: 1620000000,
            },
          ]),
      })
    );
    render(<ImageGrid recompute={true} setRecompute={() => {}} />);

    // Check that the title is truncated.
    const imageTitle = await screen.findByText(truncatedTitle);
    expect(imageTitle).toBeInTheDocument();

    // Check that the full title is not present.
    const fullTitle = screen.queryByText(longTitle);
    expect(fullTitle).not.toBeInTheDocument();
  });
});
