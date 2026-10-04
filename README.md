# LeafSense AI: Crop Disease Detection Prototype

LeafSense AI is a modern, high-precision plant disease detection system built using Deep Learning. This prototype demonstrates how AI can be leveraged for early disease identification in agriculture.

## 🚀 Features
- **AI-Powered Diagnostics**: Detects diseases like Early Blight, Late Blight, and Rust with high confidence.
- **Modern UI**: Dark-themed, responsive interface with glassmorphism and smooth animations.
- **Real-time Feedback**: Instant prediction results with confidence scores.
- **Treatment Suggestions**: Provides descriptions and recommended actions for detected diseases.
- **Drag & Drop**: Seamless image upload experience.

## 🛠️ Tech Stack
- **Frontend**: React.js, Tailwind CSS, Framer Motion, Lucide Icons, Axios.
- **Backend**: Flask, TensorFlow/Keras, OpenCV, NumPy.
- **Model**: MobileNetV2 (Transfer Learning).

## 📁 Project Structure
- `backend/`: Flask API and image processing logic.
- `frontend/`: React application (Vite).
- `training/`: Python script to train the model on the PlantVillage dataset.
- `backend/model/`: Contains the trained `.h5` model and class indices.

## ⚙️ Setup Instructions

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Training the Model (Optional)
To train the model on your own data:
1. Download the [PlantVillage Dataset](https://www.kaggle.com/datasets/emmarex/plantdisease).
2. Update the `DATASET_PATH` in `training/train_model.py`.
3. Run: `python training/train_model.py`.
4. The script will save `crop_disease_model.h5` directly to the backend folder.

## 🧪 API Endpoints
- `POST /predict`: Accepts a leaf image and returns the disease diagnosis.
- `GET /health`: Checks if the server and model are online.

## 📝 Mock Mode
If no `.h5` model file is detected, the backend will automatically run in **Mock Mode**, providing randomized results for demonstration purposes.

---
Built with ❤️ for Sustainable Agriculture.
