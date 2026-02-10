# 🏎️ F1 Telemetry Analyzer

> **Advanced Formula 1 Telemetry Analysis System with AI-Powered Insights & Blockchain Verification**

A professional-grade telemetry analysis platform for Formula 1 racing, combining real-time data processing, artificial intelligence-driven performance insights, and blockchain-based data verification.

![F1 Telemetry Analyzer](./Screenshoot/Screenshot%20(632).png)

---

## ✨ Features

### 🎯 Core Functionality
- **Real-Time Telemetry Analysis** - Process and visualize F1 car telemetry data in real-time
- **AI Performance Insights** - Machine learning-powered suggestions for performance optimization
- **Multi-Storage Options** - PostgreSQL, Firebase Firestore, and Ethereum blockchain support
- **Interactive Charts** - Professional engineering-grade visualization using Chart.js
- **Responsive Dashboard** - Modern, Ferrari-inspired dark theme UI

### 🤖 AI-Powered Features
- Automated lap time predictions
- Driver mistake detection and analysis
- Performance score calculations
- Sector-by-sector optimization suggestions
- Comparative lap analysis

### 🔗 Blockchain Integration
- Ethereum Sepolia testnet integration
- Immutable lap record storage
- IPFS-based telemetry data storage
- Smart contract verification
- Decentralized leaderboard system

### 📊 Data Visualization
- Speed, throttle, brake, and gear telemetry charts
- Sector time breakdowns
- Tire wear and compound tracking
- Track temperature monitoring
- Performance comparison tools

---

## 🖼️ Screenshots

### Dashboard Overview
![Dashboard](./Screenshoot/Screenshot%20(627).png)
*Main dashboard with Ferrari SF-24 and system overview*

### Telemetry Analysis
![Telemetry Charts](./Screenshoot/Screenshot%20(628).png)
*Real-time telemetry data visualization with AI insights*

### Data Input & Management
![Lap Input](./Screenshoot/Screenshot%20(629).png)
*Lap data input interface with multiple storage options*

### Complete System View
![Full Dashboard](./Screenshoot/Screenshot%20(632).png)
*Complete dashboard with all features integrated*

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Chart.js** - Data visualization
- **Framer Motion** - Smooth animations
- **Wagmi** - Ethereum interactions
- **Viem** - Ethereum library

### Backend
- **FastAPI** - High-performance Python API framework
- **PostgreSQL** - Primary database
- **Firebase Firestore** - Cloud database option
- **SQLAlchemy** - ORM for database operations
- **Pydantic** - Data validation

### Blockchain
- **Solidity** - Smart contract development
- **Hardhat** - Ethereum development environment
- **Ethers.js** - Blockchain interactions
- **IPFS (Pinata)** - Decentralized storage
- **Sepolia Testnet** - Ethereum test network

### AI/ML
- **Scikit-learn** - Machine learning models
- **Pandas & NumPy** - Data processing
- **Prophet** - Time series forecasting

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 14+
- MetaMask wallet (for blockchain features)

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/F1-Telemetry-Analyzer.git
cd F1-Telemetry-Analyzer
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Initialize database
python -c "from database import init_db; init_db()"

# Run backend
uvicorn main:app --reload --port 8000
```

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with API URLs

# Run development server
npm run dev
```

#### 4. Smart Contracts (Optional)
```bash
cd contracts

# Install dependencies
npm install

# Deploy contracts
npx hardhat run scripts/deploy.js --network sepolia
```

### Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## 📁 Project Structure

```
F1-Telemetry-Analyzer/
├── frontend/              # Next.js frontend application
│   ├── app/              # App router pages
│   ├── components/       # React components
│   ├── lib/              # Utility functions
│   └── types/            # TypeScript definitions
├── backend/              # FastAPI backend
│   ├── main.py           # API entry point
│   ├── models.py         # Database models
│   ├── database.py       # Database configuration
│   └── ml_service.py     # AI/ML services
├── contracts/            # Smart contracts
│   ├── contracts/        # Solidity files
│   ├── scripts/          # Deployment scripts
│   └── test/             # Contract tests
├── ml/                   # Machine learning models
│   └── models/           # Trained ML models
└── docs/                 # Documentation
```

---

## 🔌 API Endpoints

### Telemetry
- `GET /telemetry/laps` - Retrieve all lap records
- `POST /telemetry/laps` - Create new lap record
- `GET /telemetry/lap/{lap_number}` - Get detailed lap data
- `DELETE /telemetry/lap/{lap_number}` - Delete lap record

### Analysis
- `GET /analysis/lap/{lap_number}` - Get AI analysis for specific lap
- `POST /analysis/predict` - Predict lap time
- `GET /analysis/leaderboard` - Get performance leaderboard

### Blockchain
- `POST /blockchain/store` - Store lap data on blockchain
- `GET /blockchain/verify/{lap_number}` - Verify lap on blockchain
- `GET /blockchain/leaderboard` - Get blockchain-verified leaderboard

---

## 🎨 Design Philosophy

The UI features a **professional Ferrari-inspired theme** with:
- Dark, elegant backgrounds with smooth gradients
- F1 red accent colors (`#E10600`)
- Racing-focused typography (Orbitron, Rajdhani)
- Engineering-grade data visualization
- Smooth animations and transitions

---

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost/f1_telemetry
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_KEY=your_pinata_secret
WEB3_PROVIDER_URL=https://sepolia.infura.io/v3/YOUR_KEY
CONTRACT_ADDRESS=0x...
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=11155111
```

---

## 📊 Database Schema

### Laps Table
- `lap_number` - Unique lap identifier
- `lap_time` - Total lap time (milliseconds)
- `source` - Data source (manual/api/blockchain)
- `created_at` - Timestamp
- Telemetry metrics (speed, throttle, brake, etc.)

### Telemetry Data Points
- Timestamped sensor readings
- Sector information
- Tire compound and wear
- Track conditions

---

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test
npm run build  # Production build check
```

### Backend Tests
```bash
cd backend
pytest tests/
```

### Smart Contract Tests
```bash
cd contracts
npx hardhat test
```

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
vercel deploy
```

### Backend (Railway/Render)
```bash
# Configure environment variables in platform
# Deploy from GitHub repository
```

### Database
- PostgreSQL on Railway/Supabase
- Firebase Firestore for cloud option

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Formula 1** - For inspiration and telemetry data standards
- **Ferrari SF-24** - Design inspiration
- **OpenAI** - AI capabilities
- **Ethereum Foundation** - Blockchain infrastructure
- **Next.js Team** - Amazing React framework

---

## 📧 Contact

**Project Maintainer**: Your Name
- GitHub: [@zhao-leihan)
- Email: your.email@example.com

**Project Link**: [https://github.com/zhao-leihan/F1-Telemetry-Analyzer](https://github.com/zhao-leihan/F1-Telemetry-Analyzer)

---

<div align="center">

### Built with Zhao han for Formula 1 enthusiasts and data scientists

**⭐ Star this repo if you find it useful!**

</div>
