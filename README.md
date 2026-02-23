# 🧠 Facial Emotion Recognition

A full-stack mobile application that uses deep learning to detect and classify facial emotions in real-time or from captured photos. Built with **Expo (React Native)** on the frontend and **FastAPI + DeepFace** on the backend.

---

## 📱 Screenshots

| Splash | Welcome | Camera (Real-time) | Camera (Capture) |
|--------|---------|-------------------|-----------------|
| Loading screen with animated pulse rings | Feature overview + launch | Live scan with emotion overlay | Capture & analyze single frame |

---

## 🗂️ Project Structure

```
FacialEmotionRecognition/
├── frontend/                  # Expo React Native app
│   ├── app/
│   │   ├── _layout.tsx        # Root layout (Redux + SafeAreaProvider)
│   │   ├── index.tsx          # Splash screen
│   │   ├── welcome.tsx        # Welcome / onboarding screen
│   │   └── camera.tsx         # Camera screen (real-time + capture)
│   ├── store/
│   │   ├── store.ts           # Redux store configuration
│   │   ├── hooks.ts           # Typed useAppDispatch / useAppSelector
│   │   ├── services/
│   │   │   └── emotionApi.ts  # RTK Query API (capture mode)
│   │   └── slices/
│   │       └── emotionSlice.ts # Redux slice + thunk (real-time mode)
│   ├── global.css             # Tailwind / NativeWind global styles
│   ├── tailwind.config.js     # Tailwind v3 config
│   ├── babel.config.js        # Babel config with NativeWind
│   ├── metro.config.js        # Metro bundler config with NativeWind
│   └── package.json
│
└── backend/                   # FastAPI server
    └── main.py                # Emotion analysis API
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- Yarn >= 4
- Python >= 3.9
- Expo Go app (iOS / Android) or a simulator
- A device and computer on the **same local network**

---

## 🖥️ Backend Setup (FastAPI)

### 1. Navigate to the backend directory

```bash
cd backend
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # macOS / Linux
venv\Scripts\activate           # Windows
```

### 3. Install dependencies

```bash
pip install fastapi uvicorn deepface opencv-python pillow numpy
```

### 4. Run the server

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

> The `--host 0.0.0.0` flag is required so your mobile device can reach the server over your local network.

### 5. Verify it's running

Open your browser and go to:
```
http://localhost:8000
```
You should see:
```json
{ "message": "Facial Emotion Recognition API is running" }
```

API docs are available at:
```
http://localhost:8000/docs
```

---

## 📡 API Reference

### `GET /`
Health check endpoint.

**Response:**
```json
{ "message": "Facial Emotion Recognition API is running" }
```

---

### `POST /analyze-frame`
Analyzes a single camera frame sent as a base64 encoded image string.

**Request body:**
```json
{
  "image": "base64_encoded_image_string"
}
```

**Success response (200):**
```json
{
  "success": true,
  "dominant_emotion": "happy",
  "emotions": {
    "angry": 0.02,
    "disgust": 0.0,
    "fear": 0.5,
    "happy": 94.2,
    "neutral": 3.1,
    "sad": 1.1,
    "surprise": 1.08
  }
}
```

**Error response (500):**
```json
{ "detail": "error message" }
```

---

## 📲 Frontend Setup (Expo)

### 1. Navigate to the frontend directory

```bash
cd frontend
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Set your API URL

Find your local machine's IP address:

```bash
# macOS / Linux
ipconfig getifaddr en0

# Windows
ipconfig
```

Then update the `baseUrl` in **both** of these files with your IP:

**`store/services/emotionApi.ts`**
```ts
baseQuery: fetchBaseQuery({
  baseUrl: "http://YOUR_LOCAL_IP:8000",
}),
```

**`store/slices/emotionSlice.ts`**
```ts
const API_URL = "http://YOUR_LOCAL_IP:8000";
```

> ⚠️ Do **not** use `localhost` — your phone can't reach your computer's localhost. Use your machine's actual local IP e.g. `http://192.168.1.42:8000`.

### 4. Start the development server

```bash
yarn expo start --clear
```

Scan the QR code with **Expo Go** on your phone, or press `i` for iOS simulator / `a` for Android emulator.

---

## 📦 Dependencies

### Frontend

| Package | Purpose |
|--------|---------|
| `expo` | Core Expo framework |
| `expo-router` | File-based routing |
| `expo-camera` | Camera access and frame capture |
| `@reduxjs/toolkit` | State management (RTK Query + slices) |
| `react-redux` | React bindings for Redux |
| `nativewind` | Tailwind CSS for React Native |
| `tailwindcss` | Utility-first CSS (v3) |
| `react-native-reanimated` | Animations (v3) |
| `react-native-safe-area-context` | Safe area handling |

### Backend

| Package | Purpose |
|--------|---------|
| `fastapi` | Web framework |
| `uvicorn` | ASGI server |
| `deepface` | Facial emotion recognition model |
| `opencv-python` | Image processing |
| `pillow` | Image decoding |
| `numpy` | Array operations |

---

## 🏗️ Architecture

### State Management

The app uses two different Redux patterns depending on the camera mode:

**Real-time mode → Redux Thunk (`emotionSlice.ts`)**
- Fires every 5 seconds via `setInterval`
- Uses an `isAnalyzing` ref to prevent overlapping requests
- Low quality (0.3) for faster uploads
- Cleans up automatically on mode switch or screen exit

**Capture mode → RTK Query (`emotionApi.ts`)**
- Single one-shot request on button tap
- Higher quality (0.6) for better accuracy
- Automatic loading / error state management
- Cache resets on retake

### Emotion Detection Flow

```
Camera Frame (base64)
       ↓
   FastAPI /analyze-frame
       ↓
   DeepFace.analyze()
       ↓
  dominant_emotion + emotion scores
       ↓
   Redux State
       ↓
   UI (badge + bars)
```

---

## ⚙️ Configuration

### Adjusting real-time interval

In `camera.tsx`, change the interval (default `1500ms`):
```ts
}, 1500); // analyze every X milliseconds
```

### Adjusting image quality

| Setting | Value | Trade-off |
|---------|-------|-----------|
| Real-time quality | `0.3` | Faster, less accurate |
| Capture quality | `0.6` | Slower, more accurate |

Lower quality = smaller payload = faster API response. Tune based on your network speed.

### Supported emotions

DeepFace returns scores for these 7 emotions:

- 😊 Happy
- 😐 Neutral
- 😮 Surprised
- 😡 Angry
- 😨 Fear
- 🤢 Disgust
- 😢 Sad

---

## 🛠️ Troubleshooting

**Camera not showing**
- Make sure you granted camera permission on your device
- Restart Expo with `yarn expo start --clear`

**API not reachable from phone**
- Confirm your phone and computer are on the same Wi-Fi network
- Check that you used your machine's local IP, not `localhost`
- Make sure the FastAPI server is running with `--host 0.0.0.0`
- Check your firewall isn't blocking port `8000`

**Tailwind classes not applying**
- Make sure you're using Tailwind v3 (`yarn add tailwindcss@3`)
- Clear cache: `yarn expo start --clear`
- Check `global.css` is imported in `_layout.tsx`

**`react-native-reanimated` crash**
- Ensure `react-native-reanimated/plugin` is **last** in `babel.config.js`
- Clear cache: `yarn expo start --clear`

**DeepFace slow on first run**
- DeepFace downloads model weights on first use — this is expected. Subsequent runs are faster.

---

## 📄 License

MIT License — feel free to use, modify, and distribute.