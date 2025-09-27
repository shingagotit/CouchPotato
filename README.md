# 🍿 CouchPotato

A modern, Netflix-inspired streaming platform built with React and TypeScript. CouchPotato provides a premium entertainment experience with comprehensive movie and TV show browsing, user management, and a sleek professional interface.

![CouchPotato](https://img.shields.io/badge/CouchPotato-Streaming%20Platform-red?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

## ✨ Features

### 🎬 Content Discovery
- **Comprehensive Movie & TV Show Library** - Browse thousands of titles with TMDB API integration
- **Advanced Search & Filtering** - Find content by genre, rating, release date, and more
- **Infinite Scroll** - Seamless content loading for uninterrupted browsing
- **Multi-Language Support** - Content available in 10+ international languages
- **Smart Recommendations** - Personalized content suggestions

### 🔐 Authentication System
- **Secure User Registration** - Complete signup flow with validation
- **Admin Approval Process** - New users require admin approval for access
- **Telegram Bot Integration** - Real-time notifications for user management
- **Role-Based Access Control** - Admin and user permission levels
- **Session Management** - Secure login/logout functionality

### ❤️ Personal Features
- **My List Watchlist** - Save movies and TV shows for later viewing
- **Professional UI** - Netflix-inspired design with grid and list views
- **Smart Sorting** - Sort by date added, title, or rating
- **Content Filtering** - Filter by movies, TV shows, or view all
- **Play Random** - Discover content with random selection

### 👨‍💼 Admin Dashboard
- **User Management** - Approve, deny, promote, and manage users
- **Analytics Dashboard** - View user statistics and platform metrics
- **Telegram Bot Control** - Manage bot interactions and commands
- **Real-time Notifications** - Instant updates on user registrations

### 🎨 Professional Design
- **Netflix-Inspired UI** - Modern, sleek interface design
- **Responsive Layout** - Perfect experience on desktop, tablet, and mobile
- **Dark Theme** - Professional dark mode throughout
- **Smooth Animations** - Polished hover effects and transitions
- **Adaptive Components** - Smart positioning and responsive elements

## 🚀 Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS + Shadcn/ui components
- **State Management**: React Context API + Local Storage
- **API Integration**: TMDB API for movie/TV data
- **Notifications**: Telegram Bot API
- **UI Components**: Custom Netflix-style components
- **Icons**: Lucide React icon library

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/shingagotit/CouchPotato.git
   cd CouchPotato
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:8080
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔑 Admin Access

For administrative access, use these credentials:

- **Email**: `admin@couchpotato.com`
- **Password**: `admin123`

Admin users can:
- Access the admin dashboard
- Approve/deny user registrations
- Manage user roles and permissions
- View platform analytics
- Control Telegram bot interactions

## 🤖 Telegram Bot Setup

CouchPotato includes Telegram bot integration for user management notifications:

1. **Bot Token**: `8051082292:AAGGlCmbl38GOQSZxxOEqBLUetyBoiZfSAE`
2. **Chat ID**: `1048281561`
3. **Bot Username**: `@CouchPotatoAdmin_bot`

### Bot Commands
- New user registrations trigger automatic notifications
- Admins can approve/deny users via Telegram responses
- Real-time user management updates

## 📱 Key Pages & Features

### 🏠 Home Dashboard
- Featured content carousel
- Trending movies and TV shows
- Personalized recommendations
- Quick access to all sections

### 🎬 Movies & TV Shows
- Comprehensive browsing with infinite scroll
- Advanced filtering and sorting options
- Detailed content information
- Add to watchlist functionality

### ❤️ My List
- Personal watchlist management
- Grid and list view modes
- Smart sorting and filtering
- Play random functionality

### 🔍 Search
- Global content search
- Real-time search results
- Filter by content type
- Advanced search options

### 👨‍💼 Admin Dashboard
- User management interface
- Platform analytics
- Telegram bot control
- System administration tools

## 🎨 Design Philosophy

CouchPotato follows a Netflix-inspired design philosophy with:

- **Dark Theme**: Professional black background with white text
- **Red Accents**: Brand colors for CTAs and highlights
- **Smooth Animations**: Polished hover effects and transitions
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Professional Typography**: Clear hierarchy and readable fonts
- **Intuitive UX**: Familiar streaming platform interactions

## 🔧 Configuration

### Environment Variables
Create a `.env` file for production deployment:

```env
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
VITE_TELEGRAM_CHAT_ID=your_telegram_chat_id
```

### Deployment

The project is ready for deployment on:
- **Vercel** - Automatic deployment from GitHub
- **Netlify** - Static site hosting
- **GitHub Pages** - Free hosting option
- **Custom Server** - Self-hosted deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TMDB API** - Movie and TV show data
- **Shadcn/ui** - Beautiful UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide** - Beautiful icon library
- **React Team** - Amazing frontend framework

## 📞 Support

For support, email admin@couchpotato.com or join our Telegram channel.

---

**Built with ❤️ by the CouchPotato Team**

*Enjoy your streaming experience! 🍿*