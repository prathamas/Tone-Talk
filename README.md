# 🎨 ToneTalk

ToneTalk is a full-stack **MERN** chat app with real-time messaging, profile management, and an AI-assisted tone checker powered by **VADER**. Deployed UI with a sleek, responsive design.

---

## ✨ Features
- 🔐 **Auth**: JWT login/signup, protected routes (React Context)
- 💬 **Chat**: Real-time messaging via **Socket.IO**, seen/unseen indicators
- 🧭 **Sidebar**: Online users + unseen message counts
- 🧪 **Tone Check**: VADER sentiment gating with user confirmation on negative tone
- 👤 **Profiles**: Avatar upload (Base64 → **Cloudinary**), name & bio edit
- 🎨 **UI**: TailwindCSS, responsive layout, background image support
- ☁️ **Deploy**: Frontend on Vercel, backend on your Node host, DB on MongoDB Atlas

---

## 🧰 Tech Stack
- **Frontend**: React, Vite, TailwindCSS, React Router, React Hot Toast, Socket.IO Client
- **Backend**: Node.js, Express, Socket.IO, Cloudinary SDK, VADER sentiment, Mongoose
- **DB**: MongoDB Atlas
- **Deploy**: Vercel (client), any Node host (server)

---

## 🗂️ Project Structure
  ToneTalk/
  │── client/ # React app (Vite)
  │ └── public/ # Static assets (e.g., bgimage.png)
  │── server/ # Express + Socket.IO
  │── README.md
  │── .gitignore

---

## ⚙️ Setup

### 1) Clone
```bash
git clone https://github.com/prathamas/ToneTalk.git
cd ToneTalk
```
### 2) Server
```bash
cd server
npm install
```
# create server/.env (see below)
npm run dev   # or: npm start

#server/.env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
PORT=5000

### 3) Client
```bash
cd ../client
npm install
```
# create client/.env (see below)
npm run dev

#client/.env
VITE_BACKEND_URL=http://localhost:5000

## 🚀 Deployment

- Frontend (Vercel): Build with npm run build (Vite) and deploy the client/ project.
- Backend: Deploy server/ to Render/railway/fly.io/etc. Expose the URL in client/.env as VITE_BACKEND_URL=https://your-server.com.
- MongoDB: Use Atlas connection string in server/.env.

 ## 🔌 Key Endpoints (Server)

-POST /api/auth/login — Login (JWT)
- POST /api/auth/register — Signup
- GET /api/auth/check — Validate token
- PUT /api/auth/update-profile — Update profile
- GET /api/messages/users — Sidebar users + unseen counts
- GET /api/messages/:id — Conversation with selected user
- POST /api/messages/send/:id — Send message (text/image)
- PUT /api/messages/mark/:id — Mark single message as seen

## 🧪 Tone Checker (VADER)

- Runs on message text before send.
- If compound score < threshold (e.g., -0.6), app asks for confirmation via toast modal.
- On confirm → sends message; on cancel → aborts.
- Threshold can be tuned in code if needed.

## 🤝 Contributing

- PRs welcome. For major changes, open an issue to discuss first.
  
## 📄 License

- This project is open-source and available under the [MIT License](LICENSE).






