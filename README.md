# GANRestore — AI Image Deblurring

A web application for image deblurring using a GAN-based image restoration pipeline.

## Technologies

* Frontend: React and Vite
* Backend: Python and Flask
* Machine learning: PyTorch and a pretrained image restoration model

## Requirements

* Windows 10 or 11
* Python 3.11
* Node.js and npm
* Internet connection for installing dependencies

## Project Structure

* `backend/`: Flask API and image restoration logic
* `frontend/`: React web interface
* `backend/deblur_deployment/pretrained/fpn_inception.h5`: Model checkpoint

## Run the Backend

Open a terminal in the project folder and run:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-gan.txt
.\.venv\Scripts\python.exe app.py
```

Keep this terminal open.

## Run the Frontend

Open a second terminal in the project folder and run:

```powershell
cd frontend
npm install
npm run dev
```

Keep this terminal open.

## Open the Website

Visit http://localhost:5173/

Upload a blurry image and view the restored result.

## Notes

* The pretrained model checkpoint must be present.
* The first startup may download additional model weights.
* Processing may be slower on CPU-only computers.
