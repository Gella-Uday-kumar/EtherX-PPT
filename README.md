# EtherXPPT - PowerPoint Replica Application

A modern, web-based PowerPoint replica built with React and Node.js, featuring real-time collaboration, comprehensive presentation tools, and professional interface.

## 🚀 Features

### Core Features
- ✅ **Slide Management** - Create, delete, duplicate, and reorder slides
- ✅ **7 Professional Layouts** - Blank, Title Only, Title & Content, Two Column, etc.
- ✅ **Text Formatting** - 10+ fonts, sizes, colors, alignment, spacing
- ✅ **Drawing Tools** - 8 shape types with customizable borders and fills
- ✅ **Enhanced Charts** - 6 chart types with real-time data editing
- ✅ **Add-ins Marketplace** - 6 powerful extensions (Word Cloud, Icons, QR codes, etc.)

### Advanced Features
- ✅ **Export Options** - PDF, PPTX, and image formats
- ✅ **Full-screen Slideshow** - Professional presentation mode
- ✅ **Dark/Light Theme** - Complete theme system
- ✅ **Keyboard Shortcuts** - Professional shortcuts (Ctrl+Shift+N, F5, etc.)
- ✅ **Auto-save** - Every 30 seconds
- ✅ **Undo/Redo** - 50-step history
- ✅ **Responsive Design** - Works on desktop and mobile

## 🛠️ Technology Stack

### Frontend
- **React 18.2.0** - UI framework
- **Vite 4.4.5** - Build tool and dev server
- **Tailwind CSS 3.3.0** - Utility-first CSS framework
- **React Router DOM 6.15.0** - Client-side routing
- **pptxgenjs 3.12.0** - PowerPoint export functionality

### Backend
- **Node.js** - Runtime environment
- **Express.js 4.18.2** - Web framework
- **Socket.io 4.7.2** - Real-time communication
- **MongoDB/Mongoose 7.5.0** - Database and ODM
- **JWT** - Authentication

## 📦 Installation & Setup

### Prerequisites
```bash
Node.js >= 18.0.0
npm >= 8.0.0
```

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd etherxppt-organized

# Install all dependencies
npm run install-all

# Start development servers
npm run dev
```

### Manual Setup
```bash
# Install root dependencies
npm install

# Setup client
cd client
npm install
cd ..

# Setup server
cd server
npm install
cd ..

# Start both servers
npm run dev
```

## 🎯 Usage

1. **Access the Application**
   - Open http://localhost:5173 in your browser
   - Sign up or login to access the editor

2. **Create Presentations**
   - Use the toolbar to add new slides
   - Select layouts from the Layout panel
   - Format text using the Format panel
   - Draw shapes with the Drawing Tools
   - Insert charts and add-ins

3. **Export & Share**
   - Export to PPTX, PDF, or print
   - Start slideshow with F5
   - Use keyboard shortcuts for efficiency

## 🎨 Key Components

### Main Components
- **Dashboard** - Main presentation editor
- **Toolbar** - Primary action buttons
- **Sidebar** - Slide thumbnails and navigation
- **SlideEditor** - Main editing canvas
- **LayoutSelector** - 7 professional layouts
- **FormatPanel** - Text formatting controls
- **DrawingTools** - Shape creation tools
- **EnhancedChartComponent** - 6 chart types
- **AddInsPanel** - Extensions marketplace
- **SlideShow** - Full-screen presentation mode

### Context Providers
- **AuthContext** - User authentication
- **ThemeContext** - Dark/light theme switching
- **PresentationContext** - Slide management and state

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+N` | New Slide |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+C` | Copy |
| `Ctrl+V` | Paste |
| `Ctrl+S` | Save |
| `F5` | Start Slideshow |
| `Escape` | Exit Slideshow |
| `←/→` | Navigate Slides |

## 📊 Export Formats

### PPTX Export
- Full PowerPoint compatibility
- Preserves layouts and formatting
- Supports text, shapes, and basic charts

### PDF Export
- High-quality PDF generation
- Maintains slide layouts
- Perfect for sharing and printing

### Image Export
- PNG format with high resolution
- Individual slide export
- Great for web use and thumbnails

## 🧩 Add-ins Marketplace

### Available Extensions
1. **Word Cloud Generator** - Create beautiful word clouds
2. **Professional Icons Pack** - 1000+ professional icons
3. **QR Code Generator** - Generate QR codes for links
4. **Math Equations** - Insert complex mathematical equations
5. **Interactive Maps** - Embed maps and locations
6. **Social Media Pack** - Embed social media content

## 🎨 Layouts & Templates

### 7 Professional Layouts
1. **Blank** - Empty slide for custom content
2. **Title Only** - Large title area
3. **Title & Content** - Most common layout
4. **Two Column** - Side-by-side content areas
5. **Title + Two Content** - Title with dual content
6. **Section Header** - Large section divider
7. **Comparison** - A vs B comparison layout

## 🔧 Development

### Project Structure
```
etherxppt-organized/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── utils/          # Utility functions
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   └── routes/         # API routes
└── docs/                   # Documentation
```

### Available Scripts
```bash
npm run dev          # Start both client and server
npm run client       # Start only client
npm run server       # Start only server
npm run build        # Build for production
npm run install-all  # Install all dependencies
```

## 🌟 Features in Detail

### Slide Management
- Create unlimited slides
- Drag and drop reordering
- Duplicate slides with one click
- Reset slides to clean state
- Navigate with arrow keys

### Text Formatting
- 10+ professional fonts
- Font sizes from 8pt to 72pt
- Bold, italic, underline styles
- Color picker with quick colors
- Text alignment options
- Line spacing controls
- Letter spacing adjustment

### Drawing Tools
- 8 shape types (rectangle, circle, triangle, etc.)
- Customizable border width and color
- Fill colors with transparency
- Quick color palette
- Real-time preview

### Chart System
- 6 chart types (bar, line, pie, doughnut, area, scatter)
- JSON-based data editing
- Real-time chart updates
- Custom colors and styling
- Export-ready charts

## 🚀 Deployment

### Frontend Deployment
```bash
cd client
npm run build
# Deploy dist/ folder to static hosting
```

### Backend Deployment
```bash
cd server
# Set environment variables
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code examples

---

**EtherXPPT v2.0.0** - Professional presentation software for modern teams.