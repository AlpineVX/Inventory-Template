# VEX Robotics Inventory Control — Complete User & Coach Manual

Welcome to the **VEX Robotics Inventory Control System**. This web application is a 100% standalone, zero-dependency, beginner-friendly inventory tracking system built for VEX V5 robotics teams, high schools, middle schools, and club workshops.

---

## ⚡ 60-Second Quick Start

If you want your robotics team up and running in under a minute:

1. **Open the Website** on any computer, tablet, or smartphone.
2. Click the **"Customize / Clone"** button in the top bar.
3. Type your **School Name** (e.g. *Westlake High School Robotics*) and **VEX Club Number** (e.g. *1234*).
4. Click **"Auto-Generate A–G"** to create sub-teams (e.g. `1234A`, `1234B`, `1234C`).
5. (Optional) Set your **Admin Security PIN** (default is `654`).
6. Click **"Apply to Website"**.
7. **Done!** Your inventory system is ready for checkouts.

---

## 🚀 How Any Team Can Make Their Own Copy

Want a private copy hosted 24/7 with your own link? Choose any of these 3 free methods:

### Option 1: 1-Click Fork in Google AI Studio (Easiest)
1. Share this web application's URL with your sister school or other team.
2. Open it in **Google AI Studio Build**.
3. Click **"Remix"** or **"Duplicate"** in the top corner.
4. AI Studio instantly provisions a private, dedicated instance with its own URL hosted on Google Cloud for free.

### Option 2: 100% Free 24/7 Hosting on Vercel or Netlify
1. Push this code to your school club's GitHub account.
2. Go to [Vercel](https://vercel.com) or [Netlify](https://netlify.com) (both offer 100% free hosting for educational clubs).
3. Import your GitHub repository and click **Deploy**.
4. You get a permanent custom web address (e.g. `team1234inventory.vercel.app`).

### Option 3: Tournament Pit Laptop (No Internet Needed!)
- Because the entire inventory system is disconnected from external servers and stores data directly in the browser (`localStorage`), you can bookmark the page on your team's pit laptop.
- Builders can scan parts in and out with **zero arena Wi-Fi or cellular service** required.

---

## 🎨 Customizing for Your School

Click **"Customize / Clone"** in the top bar to adjust:
- **Full School / Club Name**: Displays in header wordmarks, reports, and audit logs.
- **VEX Club Number**: Automatically prefixes all sub-teams and forms.
- **Sub-Teams Manager**: Add custom teams like `1234A`, `1234B`, `Drive Team`, `Mentor`, or `Pit Box`.
- **Upload Custom Logo**: Upload any PNG, JPG, or SVG mascot image to replace the default emblem.
- **Admin PIN**: Default is `654`. Change this to any code you want to protect Admin Settings.
- **Start of Season Reset**: Click **"Check In All Parts"** to mark all 279 catalog components Available in their designated storage cabinets.

---

## 📦 Daily Student & Builder Checkout Guide

### Checking OUT a Component
1. Click **"+ Check Out"** in the top bar (or center `+` icon on phone).
2. Tap the component category (e.g. *Optical*, *Distance*, *Inertial*, *Rotational*, *Brain*, *Radio*, *Solenoids*).
3. Tap the part number (e.g. `001`) or type the ID (e.g. `VEXS-DIST-1`).
4. Select which sub-team is taking the hardware.
5. Enter the borrower's email address (for accountability).
6. Click **"Complete Check Out"**.

### Checking IN a Returned Component
1. Click **"Check In / Return"**.
2. Select the component type & number being returned.
3. Select your team and add any condition notes (e.g. *"Works great"* or *"Cable worn"*).
4. Click **"Return Component to Pit"**.
5. The part immediately marks as Available in storage.

### Part ID Numbering System
- **V5 Robot Brains**: `VEXB-1` through `VEXB-20` (Cabinet 1)
- **V5 Radios**: `VEXR-1` through `VEXR-30` (Cabinet 1)
- **Pneumatics Solenoids**: `VEXSOL-1` through `VEXSOL-31` (Pneumatics Cabinet)
- **Distance Sensors**: `VEXS-DIST-1` through `VEXS-DIST-30` (Sensor Cabinet)
- **Optical Sensors**: `VEXS-O-1` through `VEXS-O-33` (Sensor Cabinet)
- **Inertial Sensors**: `VEXS-INER-1` through `VEXS-INER-11` (Sensor Cabinet)
- **Rotational Sensors**: `VEXS-ROT-1` through `VEXS-ROT-24` (Sensor Cabinet)

---

## 🏷️ Setting Up the Cabinet QR Code

1. Click **"Logos & QR Badges"** in the header or bottom bar.
2. The website automatically generates a real, scannable QR code matching your active web address with your school name printed directly on it.
3. Click **"Download QR Code (PNG)"**.
4. Print the image on standard paper or sticker paper.
5. Tape the QR code onto the front of your workshop parts cabinet.
6. Builders can now scan the QR code with their phone camera to check parts out in 5 seconds.

---

## 💾 Backups, Exporting, and Data Safety

- **Download Complete Backup (.json)**:
  - Go to **"Customize / Clone" > "Export & Import Setup"**.
  - Click **"Download Setup File (.json)"**.
  - Save this file to Google Drive or a flash drive. It contains your school profile, admin PIN, all 279 parts, and all checkout logs.
- **Restore on a New Laptop**:
  - Open the website on the new computer.
  - Go to **"Export & Import Setup" > "Select JSON File to Restore"**.
  - Select your backup file. Everything is restored immediately.
- **Exporting Spreadsheets (.csv)**:
  - In the **Inventory** tab, click **"Export CSV"** to generate an Excel-compatible report of all items and current team holders.

---

## 📊 Connecting a Google Sheet (Optional)

You do **NOT** need Google Sheets. But if your school district or mentor requires cloud spreadsheet sync:
1. Open a Google Sheet.
2. In this website, click **Settings (gear icon) > "Apps Script Backend Code"**.
3. Click **"Copy Complete Code"**.
4. In Google Sheets, click **Extensions > Apps Script**, paste the code, and click Save.
5. Click **Deploy > New deployment > Web app**, set *Who has access* to **Anyone**, and copy the URL ending in `/exec`.
6. Paste that URL into **Settings > API Endpoint Connection** and click **Connect & Sync**.

---

## ❓ FAQ & Troubleshooting

- **Q: What is the default Admin PIN?**  
  **A:** `654`. You can change it anytime in the **Customize / Clone** modal.

- **Q: Do changes stay saved when I refresh or close the tab?**  
  **A:** Yes, everything is automatically saved in your browser's persistent storage.

- **Q: Can students use this on mobile phones?**  
  **A:** Yes, the website includes a dedicated phone interface with bottom navigation and thumb-friendly buttons.

- **Q: How do we reset for next season?**  
  **A:** Open **"Customize / Clone"** and click **"Check In All Parts"**. All 279 items will be marked Available in cabinets.
