function ImageComparison({ originalUrl, restoredUrl }) {
  if (!originalUrl && !restoredUrl) {
    return null;
  }

  return (
    <section className="results-section">
      <div className="section-heading">
        <span className="step-number">02</span>

        <div>
          <h2>Deblurring Result</h2>

          <p>
            Compare the original blurred image with the restored output.
          </p>
        </div>
      </div>

      <div className="comparison-grid">
        <div className="image-card">
          <div className="image-card-header">
            <div>
              <span className="image-label">INPUT</span>
              <h3>Blurred Image</h3>
            </div>
          </div>

          <div className="result-image-container">
            <img
              src={originalUrl}
              alt="Original blurred image"
              className="result-image"
            />
          </div>
        </div>

        <div className="image-card restored-card">
          <div className="image-card-header">
            <div>
              <span className="image-label restored-label">
                OUTPUT
              </span>

              <h3>Deblurred Image</h3>
            </div>
          </div>

          <div className="result-image-container">
            {restoredUrl ? (
              <img
                src={restoredUrl}
                alt="Deblurred restored image"
                className="result-image"
              />
            ) : (
              <div className="result-placeholder">
                <span>Restored image will appear here</span>
              </div>
            )}
          </div>

          {restoredUrl && (
            <a
              href={restoredUrl}
              download="deblurred-image.png"
              className="download-button"
            >
              ↓ Download Restored Image
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

export default ImageComparison;