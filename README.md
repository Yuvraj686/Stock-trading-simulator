# 📈 Stock Trading Simulator

A responsive, full-stack web application that allows users to experience the thrill of the stock market without financial risk. Users can create an account, manage a virtual wallet, buy and sell stocks, monitor their investment portfolio, and keep a log of all their transactions.

## ✨ Features

- **Secure Authentication:** User sign-up and log-in seamlessly powered by JWT-based secure authorization with hashed passwords.
- **Virtual Wallet:** Users receive virtual currency upon signing up and can perform secure stock purchases without real-world risk.
- **Dashboard & Portfolio:** Track active investments, calculate net worth fluctuations, and analyze stock holdings in a clean intuitive interface.
- **Market Capabilities:** Simulated buying and selling of stocks based on real-world stock prices.
- **Transaction History:** Keep a comprehensive log of all purchases, sales, and wallet actions over time.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React + Vite
- **Language:** TypeScript
- **State Management / Data Fetching:** Axios / Custom Hooks (React)
- **Styling:** CSS 

### Backend
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL (hosted on Supabase)
- **ORM:** SQLAlchemy
- **Data Validation:** Pydantic
- **Authentication:** OAuth2 with Passlib & python-jose

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and Python installed on your local machine.

### Backend Setup
1. Navigate to the root directory and create a virtual environment:
   ```bash
   python -m venv venv
   source venv/Scripts/activate # On Windows use: .\venv\Scripts\activate
   ```
2. Install the backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the root codebase with your Supabase Postgres Database credentials:
   ```env
   database_hostname=...
   database_port=...
   database_password=...
   database_name=postgres
   database_username=postgres
   secret_key=YOUR_SECRET_JWT_KEY
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