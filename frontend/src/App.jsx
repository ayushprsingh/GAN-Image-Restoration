import { useEffect, useState } from "react";

import Header from "./components/Header";
import ImageUploader from "./components/ImageUploader";
import ImageComparison from "./components/ImageComparison";
import Loading from "./components/Loading";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [originalUrl, setOriginalUrl] = useState(null);
  const [restoredUrl, setRestoredUrl] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (file) => {
    setError("");
    setRestoredUrl(null);
    setOriginalUrl(null);

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size should be less than 10 MB.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(newPreviewUrl);
  };

  const handleDeblur = async () => {
    if (!selectedFile) {
      setError("Please upload an image first.");
      return;
    }

    setError("");
    setIsProcessing(true);
    setOriginalUrl(null);
    setRestoredUrl(null);

    try {
      // Create form data
      const formData = new FormData();

      // "image" must match Flask request.files["image"]
      formData.append("image", selectedFile);

      // Send image to Flask backend
      const response = await fetch(
        "http://127.0.0.1:5000/api/deblur",
        {
          method: "POST",
          body: formData,
        }
      );

      // Convert Flask response to JSON
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Image processing failed."
        );
      }

      // Flask returns relative image paths.
      const backendUrl = "http://127.0.0.1:5000";

      setOriginalUrl(
        `${backendUrl}${data.original_image}`
      );

      setRestoredUrl(
        `${backendUrl}${data.restored_image}`
      );

    } catch (error) {
      console.error("Deblur error:", error);

      setError(
        error.message ||
        "Could not connect to the backend."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app">

      <Header />

      <main className="main-container">

        <section className="hero-section">

          <span className="project-badge">
            B.Tech Final Year Project
          </span>

          <h1>
            Method for Smoothing the Blur Images
            <br />
            by De-blurring Them Using GAN
          </h1>

          <p>
            An AI-based image restoration system that uses
            Generative Adversarial Networks to reduce blur and
            reconstruct clearer images.
          </p>

        </section>

        <div className="workflow-card">

          <ImageUploader
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            onFileSelect={handleFileSelect}
            onDeblur={handleDeblur}
            isProcessing={isProcessing}
          />

          {error && (
            <div className="error-message">
              <span>!</span>
              {error}
            </div>
          )}

          {isProcessing && <Loading />}

          {!isProcessing && (
            <ImageComparison
              originalUrl={originalUrl}
              restoredUrl={restoredUrl}
            />
          )}

        </div>

        <section className="technology-section">

          <h2>System Workflow</h2>

          <div className="workflow-steps">

            <div className="workflow-step">
              <span>01</span>
              <h3>Upload</h3>
              <p>Select blurred image</p>
            </div>

            <div className="workflow-arrow">→</div>

            <div className="workflow-step">
              <span>02</span>
              <h3>Preprocess</h3>
              <p>Prepare image for GAN</p>
            </div>

            <div className="workflow-arrow">→</div>

            <div className="workflow-step">
              <span>03</span>
              <h3>GAN Model</h3>
              <p>Generate restored image</p>
            </div>

            <div className="workflow-arrow">→</div>

            <div className="workflow-step">
              <span>04</span>
              <h3>Output</h3>
              <p>Display deblurred image</p>
            </div>

          </div>

        </section>

      </main>

      <footer>
        <p>
          GAN-Based Image Deblurring System •
          B.Tech Final Year Project
        </p>
      </footer>

    </div>
  );
}

export default App;