function Loading() {
  return (
    <div className="loading-box">
      <div className="loading-spinner"></div>

      <div>
        <h3>Deblurring image...</h3>

        <p>
          The GAN model is processing your image. Please wait.
        </p>
      </div>
    </div>
  );
}

export default Loading;