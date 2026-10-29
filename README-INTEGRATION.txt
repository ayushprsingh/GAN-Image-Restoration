GAN Image Deblurring - Integrated Project

1. Extract this ZIP.
2. Backend setup (Windows PowerShell):
   cd backend
   py -3.11 -m venv .venv
   .venv\Scripts\Activate.ps1
   python -m pip install --upgrade pip
   pip install -r requirements-gan.txt
   python app.py

   Use a compatible PyTorch build for your computer (CPU is fine but slower).
   First startup downloads the InceptionResNet-v2 ImageNet backbone (~200 MB) from the configured HTTPS mirror if it is not already cached.
   Keep internet access enabled on first startup. The GAN checkpoint is included.

3. In a second terminal: cd frontend; npm install; npm run dev
4. Open the local Vite URL shown in the terminal (normally http://localhost:5173).
5. Upload an image and click the deblur button. Flask remains at http://127.0.0.1:5000.

API contract is unchanged: POST /api/deblur with multipart field `image`, response includes success, original_image, restored_image.

Notes: this uses the pretrained DeblurGAN-v2 checkpoint and conventional sharpening post-processing; it is not a newly trained GAN. Do not include .venv or node_modules in submissions.
