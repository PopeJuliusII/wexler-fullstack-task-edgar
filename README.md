# Wexler Code Task

Wexler's app includes a page to upload documents, which are then sent for processing in our Machine Learning pipeline. This task is to build a simple version of this page for images. 

## Task Overview

This task consists of developing an image upload and management system where users can upload multiple images to Imgur, view a list of uploaded images, and see them displayed. The task is divided into two parts: the UI (frontend) and the API (backend).

### Part 1: UI (Frontend)

The frontend application should be built using React. It will provide a user interface for uploading images and displaying the list of uploaded images with thumbnails.

**Requirements:**
- Create a form to upload multiple images
- Display a list of uploaded images with thumbnails
- Integrate with the backend API to handle image uploads and retrieval

### Part 2: API (Backend)

The backend application should be built using Node.js and Express. It will handle image uploads to Imgur and store metadata of the uploaded images/

**Requirements:**
- Set up an Express server to handle image uploads
- Use Imgur API to store images ([API docs](https://apidocs.imgur.com/), Client ID key [here](https://eu.onetimesecret.com/secret/53njtiuxxfe3zsi4bzohs1dev2sj6da) or available in Repository secrets under IMGUR_API, no need to set up an account or application yourself)
- Provide endpoints to upload images and retrieve the list of uploaded images
- Handle both large and small image files efficiently

## Repo structure

- The frontend part of the task is hosted in the ui subfolder
- The backend part of the task is hosted in api subfolder

## Getting Started

### Prerequisites

- Node.js and Yarn installed on your machine.

### Deliverable

- A forked repository with your solution implemented
