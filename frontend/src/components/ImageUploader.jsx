function ImageUploader({
  selectedFile,
  previewUrl,
  onFileSelect,
  onDeblur,
  isProcessing,
}) {
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    onFileSelect(file);
  };

  return (
    <section className="upload-section">
      <div className="section-heading">
        <span className="step-number">01</span>

        <div>
          <h2>Upload Blurred Image</h2>
          <p>
            Select an image that you want to restore using the GAN model.
          </p>
        </div>
      </div>

      <label className="upload-box">
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileChange}
        />

        {!previewUrl ? (
          <div className="upload-placeholder">
            <div className="upload-icon">↑</div>

            <h3>Choose an image</h3>

            <p>
              Click here to upload JPG, JPEG, PNG or WEBP
            </p>

            <span>Maximum recommended size: 10 MB</span>
          </div>
        ) : (
          <div className="preview-container">
            <img
              src={previewUrl}
              alt="Selected blurred image"
              className="preview-image"
            />

            <div className="preview-overlay">
              <span>Click to change image</span>
            </div>
          </div>
        )}
      </label>

      {selectedFile && (
        <div className="file-info">
          <div>
            <strong>{selectedFile.name}</strong>

            <span>
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>

          <span className="file-ready">Ready</span>
        </div>
      )}

      <button
        className="deblur-button"
        onClick={onDeblur}
        disabled={!selectedFile || isProcessing}
      >
        {isProcessing ? (
          <>
            <span className="button-spinner"></span>
            Processing...
          </>
        ) : (
          <>
            ✨ Deblur Image
          </>
        )}
      </button>
    </section>
  );
}

export default ImageUploader;