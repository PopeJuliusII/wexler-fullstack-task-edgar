import React, { useState, useCallback } from "react";
import Header from "./Header";
import UploadConsole from "./UploadConsole";
import ImageGrid from "./ImageGrid";

function App() {
  //TODO: A significant gain in performance can be achieved by only
  // pulling the specific number of images needed. This could be achieved
  // by using a paginated endpoint and converting recompute to a number of images.
  const [recompute, setRecompute] = useState(true);

  const handleUploadSuccess = useCallback(() => {
    setRecompute((prev) => !prev);
  }, []);

  return (
    <div className="bg-base-200  min-h-screen flex flex-col">
      <Header />
      <UploadConsole onUploadSuccess={handleUploadSuccess} />
      <ImageGrid recompute={recompute} setRecompute={setRecompute} />
    </div>
  );
}

export default App;
