import request from "supertest";
import express from "express";
import router from "./router";
import axios from "axios";
import { IMGUR_IMAGE_URL_BASE } from "./config/endpoints";

jest.mock("axios");

const app = express();
app.use(express.json());
app.use("/", router);

describe("Imgur Router", () => {
  describe("POST /images", () => {
    it("Images are uploaded successfully to Imgur", async () => {
      axios.post.mockResolvedValue({ status: 200 });
      const response = await request(app)
        .post("/images")
        .attach("files", Buffer.from("file content"), "test-file.jpg");
      expect(response.status).toBe(200);
      expect(response.text).toBe("success");
    });

    it("Images fail to upload to Imgur due to a rejection by axios.", async () => {
      axios.post.mockRejectedValue({ response: { status: 500 } });
      const response = await request(app)
        .post("/images")
        .attach("files", Buffer.from("file content"), "test-file.jpg");
      expect(response.status).toBe(500);
      expect(response.text).toBe("Failed to upload images to Imgur.");
    });

    it("Files are not attached.", async () => {
      const response = await request(app).post("/images");
      expect(response.status).toBe(400);
      expect(response.text).toBe("No files attached.");
    });

    it("An invalid file is passed.", async () => {
      const response = await request(app)
        .post("/images")
        .attach("files", Buffer.from("file content"), "test-file.txt");
      expect(response.status).toBe(400);
      expect(response.text).toBe(
        "Failed to upload some images to Imgur. Ensure that all files uploaded are of the correct size and type."
      );
    });

    it("Axios returns an error without a response object.", async () => {
      axios.post.mockRejectedValue(new Error("Network Error"));
      const response = await request(app)
        .post("/images")
        .attach("files", Buffer.from("file content"), "test-file.jpg");
      expect(response.status).toBe(500);
      expect(response.text).toBe("Failed to upload images to Imgur.");
    });
  });

  describe("GET /images", () => {
    it("Retrieves a list of images from Imgur.", async () => {
      axios.get.mockResolvedValue({
        data: {
          data: [{ link: IMGUR_IMAGE_URL_BASE }],
        },
      });
      const response = await request(app).get("/images");
      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ link: IMGUR_IMAGE_URL_BASE }]);
    });

    it("Handles network errors.", async () => {
      axios.get.mockRejectedValue(new Error("Network Error"));
      const response = await request(app).get("/images");
      expect(response.status).toBe(500);
      expect(response.text).toBe("Failed to fetch images from Imgur.");
    });

    it("Axios returns an error without a message.", async () => {
      axios.get.mockRejectedValue({});
      const response = await request(app).get("/images");
      expect(response.status).toBe(500);
      expect(response.text).toBe("Failed to fetch images from Imgur.");
    });
  });

  describe("GET /image/:imageid", () => {
    it("Retrieves a specified image from Imgur.", async () => {
      axios.get.mockResolvedValue({
        data: {
          data: { id: "idstring", link: IMGUR_IMAGE_URL_BASE + "idstring" },
        },
      });
      const response = await request(app).get("/image/123");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: "idstring",
        link: IMGUR_IMAGE_URL_BASE + "idstring",
      });
    });

    it("Returns a 404 if the image is not found.", async () => {
      axios.get.mockRejectedValue({ response: { status: 404 } });
      const response = await request(app).get("/image/imageid");
      expect(response.status).toBe(404);
      expect(response.text).toBe("Image not found.");
    });

    it("Handles network errors.", async () => {
      axios.get.mockRejectedValue(new Error("Network Error"));
      const response = await request(app).get("/image/imageid");
      expect(response.status).toBe(500);
      expect(response.text).toBe("Failed to fetch image from Imgur.");
    });

    it("Axios returns an error without a message.", async () => {
      axios.get.mockRejectedValue({});
      const response = await request(app).get("/image/imageid");
      expect(response.status).toBe(500);
      expect(response.text).toBe("Failed to fetch image from Imgur.");
    });
  });

  describe("DELETE /image/:imageid", () => {
    it("Deletes a specified image from Imgur.", async () => {
      axios.delete.mockResolvedValue({ status: 200 });
      const response = await request(app).delete("/image/imageid");
      expect(response.status).toBe(200);
      expect(response.text).toBe("success");
    });

    it("Returns a 404 if the image is not found.", async () => {
      axios.delete.mockRejectedValue({ response: { status: 404 } });
      const response = await request(app).delete("/image/imageid");
      expect(response.status).toBe(404);
      expect(response.text).toBe("Image not found.");
    });

    it("Handles network errors.", async () => {
      axios.delete.mockRejectedValue(new Error("Network Error"));
      const response = await request(app).delete("/image/imageid");
      expect(response.status).toBe(500);
      expect(response.text).toBe("Failed to delete image from Imgur.");
    });

    it("Axios returns an error without a message.", async () => {
      axios.delete.mockRejectedValue({});
      const response = await request(app).delete("/image/imageid");
      expect(response.status).toBe(500);
      expect(response.text).toBe("Failed to delete image from Imgur.");
    });
  });
});
