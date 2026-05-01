# 🌌 Velion Network

**Premium Cyber-Intelligence Sharing & Security Reporting Platform**

Velion Network is a high-performance, encrypted sharing platform designed for the next generation of digital intelligence. Built with a stunning dark cyberpunk aesthetic, it features real-time breaking news tickers, role-based access control, and a redundant multi-cloud storage system.

---

## 🚀 Quick Setup

### 1. Prerequisites
- **Node.js** (Latest LTS)
- **Firebase Project** (Auth & Firestore)
- **Supabase Project** (Storage & Backups)

### 2. Local Installation
1. **Clone and Install:**
   ```bash
   npm install
   ```
2. **Environment Configuration:**
   Create a `.env.local` file and add your keys:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```
3. **Run Development Server:**
   ```bash
   npm run dev
   ```

---

## 🏗️ Cloud Management Guide

### 📂 Supabase (Storage & Backups)
All physical files (Avatars & Templates) are stored here to avoid Google Cloud permission issues.
1. **Create Bucket:** Create a **Public** bucket named `velion-storage`.
2. **Backups:** Use the **Admin Dashboard** in the app to sync live Firebase data into Supabase for safe-keeping.

### 🔥 Firebase (Auth & Live Data)
Handles user authentication and the lightning-fast real-time database.
1. **Firestore Rules:** Copy the contents of `firestore.rules` into your Firebase Console.
2. **Auth:** Enable Email/Password and Google login.

### ⚡ Vercel (Hosting & Analytics)
The frontend is hosted on Vercel for maximum speed.
1. **Deploy:** Connect your GitHub repo to Vercel.
2. **Analytics:** The app is pre-configured with Vercel Analytics to track your traffic dashboard.

---

## 🛡️ Role System
- **Owner:** Full system control and user management.
- **Admin:** Infrastructure management and permissions.
- **Moderator:** Content verification and platform management.
- **User:** Accessing nodes and community interaction.

---

<div align="center">
  <p>Built for the Velion Network Community</p>
</div>
