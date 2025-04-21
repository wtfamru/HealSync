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

### Prepared for Blockchain Integration
- Smart contract architecture designed
- Wallet connection UI components ready
- ThirdWeb SDK integration prepared
- Blockchain event listeners structured
- Transaction handling system designed

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
- **Web3 Development**: ThirdWeb
- **Smart Contract Language**: Solidity
- **Wallet Integration**: ThirdWeb Connect

## 📝Next Steps – Blockchain Integration

We are now transitioning into full blockchain integration using **ThirdWeb** for deployment and interaction with smart contracts. The goal is to build a seamless bridge between decentralized smart contract logic and Firebase for real-time data management.

### Smart Contract Deployment Plan

We will deploy and connect the following modules:

- Donor Registration Contract  
- Patient Registration Contract  
- Organ Matching Contract  
- Hospital Verification Contract  
- Transaction Management Contract

### Integration Objectives

- Connect donor registration with smart contracts  
- Implement automated organ matching via on-chain logic  
- Store hospital verification status on-chain  
- Enable transparent donation tracking  
- Integrate hospital verification and transplant approval workflows  

### Web3 Features To Be Added

- Wallet connection and management (MetaMask/WalletConnect)  
- Gas fee estimation and transaction cost handling  
- Transaction status tracking and user confirmations  
- Block confirmation and finality tracking  
- Smart contract event subscription for real-time updates  

---

### Smart Contract Functional Goals

#### Donor Management
- Register donors on-chain  
- Track organ availability and status (Active/Deceased)  
- Maintain donation history per donor  

#### Patient Management
- Register patients on-chain  
- Track organ requirements and priority  
- Maintain and manage dynamic waiting lists  

#### Hospital Operations
- Verify hospitals on-chain  
- Confirm matches and transplants  
- Maintain blockchain-based transplant records  

#### Matching System
- Implement automatic organ matching algorithm  
- Prioritize based on urgency, blood compatibility, and HLA match  
- Ensure fair and medically compatible allocation


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
