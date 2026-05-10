# 📈 Stock Trading Simulator

A responsive, full-stack web application that allows users to experience the thrill of the stock market without financial risk. Users can create an account, manage a virtual wallet, buy and sell stocks, monitor their investment portfolio, and keep a log of all their transactions.

## ✨ Features

- **Secure Authentication:** User sign-up and log-in seamlessly powered by Supabase Auth.
- **Virtual Wallet:** Users receive virtual currency upon signing up and can perform secure stock purchases without real-world risk.
- **Dashboard & Portfolio:** Track active investments, calculate net worth fluctuations, and analyze stock holdings in a clean intuitive interface.
- **Market Capabilities:** Simulated buying and selling of stocks based on real-world stock prices.
- **Transaction History:** Keep a comprehensive log of all purchases, sales, and wallet actions over time.
- **Realtime Group Chat:** Live chat system for all logged-in users using Supabase Realtime.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React + Vite
- **Language:** TypeScript
- **Styling:** CSS
- **Database Client:** Supabase JS

### Backend
- **Framework:** FastAPI (Python)
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **Realtime:** Supabase Realtime

## 🚀 Getting Started

### Prerequisites
- Node.js
- Python 3.8+
- Supabase account

### Setup Instructions

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Note down your project URL and API keys

2. **Run SQL Migration**
   - In your Supabase dashboard, go to SQL Editor
   - Run the `create_tables.sql` script to create all tables, policies, and functions

3. **Enable Realtime**
   - In Supabase dashboard, go to Database > Replication
   - Enable Realtime for the `messages` table

4. **Set Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials:
     ```
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_ANON_KEY=your-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     VITE_API_BASE_URL=http://localhost:8000
     ```

5. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   # On Windows: venv\Scripts\activate
   # On macOS/Linux: source venv/bin/activate
   pip install -r ../requirements.txt
   uvicorn app.main:app --reload
   ```

6. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

7. **Access the App**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── database.py      # Supabase client
│   │   ├── config.py        # Settings
│   │   ├── oauth2.py        # Auth middleware
│   │   ├── schemas.py       # Pydantic models
│   │   └── routers/         # API routes
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and API client
│   │   └── constants.ts    # App constants
│   ├── package.json
│   └── vite.config.ts
├── create_tables.sql        # Supabase schema
└── .env.example            # Environment template
```
   algorithm=HS256
   access_token_expire_minutes=30
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn backend.app.main:app --reload
   ```

### Frontend Setup
1. Open a new terminal instance and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🤝 Contribution
Feel free to fork the repository, make suggestions, and open pull requests!

## 📜 License
This project is open-source and available under the MIT License.