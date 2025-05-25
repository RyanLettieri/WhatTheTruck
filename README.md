# WhatTheTruck

WhatTheTruck is a React Native mobile app that connects food truck drivers and customers. Drivers can manage their trucks, set availability, and update menus, while customers can browse trucks, view maps, and manage their accounts.

---

## Features

- **Driver Dashboard:**  
  - Create and manage food trucks  
  - Set truck availability  
  - View and edit truck details (including menu and cuisines)

- **Customer Dashboard:**  
  - Browse available trucks  
  - View trucks on a map  
  - Manage account details

- **Authentication:**  
  - Sign up and sign in for both drivers and customers

- **Appwrite Backend:**  
  - User authentication  
  - Data storage for trucks, users, and profiles

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- [Appwrite](https://appwrite.io/) project (or use the provided endpoint)

### Installation

1. **Clone the repository:**
    ```sh
    git clone https://github.com/yourusername/whatthetruck-rn.git
    cd whatthetruck-rn
    ```

2. **Install dependencies:**
    ```sh
    yarn install
    # or
    npm install
    ```

3. **Set up environment variables:**
    - Copy `.env.example` to `.env` and fill in your Appwrite credentials if needed.


4. **Start the Expo development server:**
    ```sh
    expo start
    ```

5. **Run on your device or emulator:**
    - Use the Expo Go app on your phone, or run on an Android/iOS emulator.

---

## Project Structure

- `src/pages/` — All main screens (DriverDashboard, CustomerDashboard, TruckDetails, etc.)
- `src/api/` — Appwrite API integration
- `src/constants/` — App constants (cuisines, etc.)
- `assets/` — Images and static assets

---

## Environment Variables

Make sure to set your Appwrite endpoint, project ID, and collection IDs in your environment or constants files.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

MIT

---

## Contact

For questions or support, open an issue or contact the maintainer.