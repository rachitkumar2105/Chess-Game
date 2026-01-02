# Chess Game

A modern, interactive Chess game application built with React, TypeScript, and Vite. This project features a sleek user interface designed with Tailwind CSS and Shadcn UI, providing a smooth and responsive gaming experience.

## 🚀 Features

- **Interactive Chess Board**: Fully functional chess board with drag-and-drop or click-to-move support (powered by `chess.js`).
- **Move Validation**: Real-time legal move calculation and validation.
- **Game States**: Handles check, checkmate, stalemate, and draw conditions.
- **Modern UI**: Polished interface using Shadcn UI components and Tailwind CSS.
- **Responsive**: mobile-friendly design.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Chess Logic**: [chess.js](https://github.com/jhlywa/chess.js)

## 📦 Installation & Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Ensure you have Node.js installed on your machine.

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Chess Game"
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:8080` (or the port shown in your terminal) to view the application.

## 📂 Project Structure

```
src/
├── components/
│   ├── chess/          # Chess-specific components (Board, Pieces, etc.)
│   └── ui/             # Reusable UI components (Buttons, Dialogs, etc.)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── pages/              # Application pages/routes
├── App.tsx             # Main application component
└── main.tsx            # Entry point
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
