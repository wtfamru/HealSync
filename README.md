# HealSync - Decentralized Organ Donation Platform

HealSync is a hybrid platform connecting organ donors with recipients, combining the security of blockchain technology with the reliability of Firebase. Built with Next.js, Firebase, and ThirdWeb for smart contract deployment.

## 🚀 Features Implemented

### Authentication & Data Management (Firebase)
- Complete authentication system with Firebase Auth
- Secure data storage with Firestore
- Role-based access (Donors, Hospitals)
- Protected routes and authenticated sessions
- User profile management
- Real-time data updates
- Structured data models

### Donor Features
- Comprehensive donor registration form with:
  - Personal details (Name, DOB, Gender)
  - Contact information
  - Blood group selection
  - Multiple organ donation preferences
  - ID verification
  - Hospital selection
- Pledge submission system
- Status tracking
- Hospital assignment

### Hospital Dashboard
- Complete hospital management interface with:
  - Statistical overview and analytics
  - Donor registration system
  - Patient registration
  - Organ verification workflow
  - Transplant matching
  - Donor status management
  - PDF report upload/verification
  - Searchable donor and pledge lists

### Advanced Features
- Real-time donor status updates
- PDF report management for organ verification
- Advanced search and filtering
  - Donor search
  - Pledge filtering
  - Organ availability tracking
- Detailed view dialogs for pledge information
- Status tracking (Active/Deceased/Verified)
- Multi-step verification process

### Blockchain Integration (Completed)
- Smart contract implementation with:
  - Donor registration and management
  - Recipient registration and waiting list
  - Hospital verification system
  - Organ matching algorithm
  - Transplant confirmation system
- Wallet connection and management
- Gas fee estimation and transaction handling
- Real-time blockchain event tracking
- Transparent donation tracking
- Secure hospital verification workflow

## 🛠️ Tech Stack

### Core Stack
- **Frontend Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **State Management**: React Context
- **Notifications**: Sonner
- **Icons**: Lucide React

### Blockchain Stack
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Smart Contract Language**: Solidity
- **Web3 Development**: ThirdWeb
- **Smart Contract Framework**: OpenZeppelin
- **Wallet Integration**: ThirdWeb Connect

## 📝 Smart Contract Features

### Core Functionality
- **Donor Management**
  - On-chain donor registration
  - Organ availability tracking
  - Donation history maintenance
  - Medical information storage

- **Recipient Management**
  - Patient registration system
  - Priority-based waiting list
  - Urgency level tracking
  - Medical compatibility checks

- **Hospital Operations**
  - Hospital verification system
  - Admin role management
  - Transplant confirmation workflow
  - Record maintenance

- **Matching System**
  - Automated organ matching algorithm
  - Blood group compatibility checks
  - HLA matching verification
  - Priority-based allocation
  - Waiting time consideration

## 🚀 Getting Started

1. Clone the repository
```bash
git clone https://github.com/wtfamru/healsync.git
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

4. Run the development server
```bash
npm run dev
```

## 📦 Environment Variables

Create a `.env.local` file with the following variables:
```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# ThirdWeb Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=
NEXT_PUBLIC_CONTRACT_ADDRESS=
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [ThirdWeb](https://thirdweb.com/)
- [Firebase](https://firebase.google.com/)
- [OpenZeppelin](https://openzeppelin.com/)
