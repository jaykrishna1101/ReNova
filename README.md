An overall workflow of AI E Waste recycling system
when a user enters
      |
Role selection(seller/buyer)+LOGIN
  --------------------|-------------------------
User                                           buyer
 |                                               |
gets a opencv based scanner                 (gets notified whenever a object is listed for sale)
it shows component in img                    else buyer can select the specific object if he wants
toxicity,recyclable,harmful components       if object specific :
  |                                          buyer gets a map on screen with the specific object user location
user can either list it for sale by          else:
sharing there address or not                 buyer gets a map with all the components user address in it




# ReNova - AI-Powered E-Waste Recycling Platform

ReNova is a sustainable e-waste recycling platform that connects sellers of electronic waste with verified buyers/recyclers. It uses AI to analyze e-waste, estimate its value, and detect harmful substances, making recycling transparent, profitable, and eco-friendly.

## 🚀 Features

### For Sellers:
-   **AI-Powered Analysis**: Upload or capture photos of your e-waste. Our AI identifies the product, detects harmful substances, estimates resale value (in ₹), and checks recyclability.
-   **Geolocation**: Tag your pickup location precisely using GPS.
-   **Dashboard**: Manage your listings and track your eco-impact (Eco-Score).

### For Buyers/Recyclers:
-   **Marketplace**: Browse e-waste listings on an interactive map.
-   **Advanced Filtering**: Filter by proximity, toxicity level, and estimated value.
-   **Verified Listings**: View detailed composition and toxicity reports for each item.

### Key Tech Features:
-   **Dynamic Maps**: Interactive maps using Leaflet.
-   **Real-time Auth**: Secure Google and GitHub login via Supabase.
-   **Responsive Design**: Mobile-first UI with beautiful animations using Framer Motion.

## 🛠️ Tech Stack

-   **Frontend**: [Next.js](https://nextjs.org/) (React framework)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Maps**: [React Leaflet](https://react-leaflet.js.org/)
-   **Backend / Auth**: [Supabase](https://supabase.com/)
-   **AI Analysis**: (Integrated Mock/Real API endpoint)

## 📦 Getting Started

### Prerequisites
-   Node.js (v18+)
-   npm or pnpm
-   Supabase Account

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/jaykrishna1101/ReNova.git
    cd ReNova
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    NEXT_PUBLIC_OPENCAGE_API_KEY=your_opencage_api_key # Optional: For address geocoding
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🛡️ Authentication Setup

To enable Google and GitHub sign-in:
1.  Go to your Supabase Dashboard -> Authentication -> Providers.
2.  Enable **Google** and **GitHub**.
3.  Add the Callback URL: `http://localhost:3000/auth/callback` (for local dev).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---
*Built with ❤️ for a greener planet.*
