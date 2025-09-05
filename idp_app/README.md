# Stytch IDP App

A React application for authenticating users via Stytch B2B with email/password using the discovery flow.

## Features

- **Email/Password Authentication**: Login with email and password
- **Organization Discovery**: Automatically discovers user's organization (no need to enter org ID)
- **Password Reset**: Built-in password reset functionality with email flow
- **Session Management**: Display session details when logged in
- **Logout Functionality**: Revoke session and clear authentication
- **Detailed Error Messages**: User-friendly error reporting for authentication issues
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Configuration

The app uses the following Stytch B2B credentials:

- **Project ID**: `project-test-6849076e-d381-4c46-a477-75501bbe3431`
- **Public Token**: `public-token-test-22dae31b-07a8-4af8-9b58-be277c857fb9`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, Alert, LoadingSpinner)
│   ├── forms/          # Form components (LoginForm, PasswordResetForm)
│   ├── layout/         # Layout components (ErrorBoundary)
│   └── SessionDisplay.tsx # Session information display
├── contexts/           # React Context providers
│   └── AuthContext.tsx # Authentication state management
├── hooks/              # Custom React hooks
│   └── useAuth.ts      # Authentication hook
├── pages/              # Page-level components
│   └── LoginPage.tsx   # Main login page
├── services/           # External service integrations
│   └── stytch.ts       # Stytch API integration with discovery
├── types/              # TypeScript type definitions
│   └── auth.ts         # Authentication-related types
├── utils/              # Utility functions
│   └── cn.ts           # Class name utility
└── styles/             # Global styles
    └── globals.css     # Tailwind CSS and custom styles
```

## How It Works

### Authentication Flow

1. **Login Screen**: User enters email and password
2. **Organization Discovery**: App automatically discovers the user's organization
3. **Password Authentication**: Authenticates against discovered organization
4. **Session Creation**: Creates and stores session token
5. **Session Display**: Shows user and organization details

### Discovery Flow

The app uses Stytch's discovery flow to:
- Find organizations associated with an email address
- Eliminate the need for users to know their organization ID
- Automatically select the appropriate organization for authentication

### Password Reset Flow

1. User clicks "Forgot your password?"
2. Enters email address
3. App discovers organization and sends reset email
4. User follows email link to reset password
5. New session created after successful reset

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Navigate to the idp_app directory:
   ```bash
   cd idp_app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3001`

### Available Scripts

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Key Components

### AuthContext
- Manages global authentication state
- Provides login, logout, and password reset functions
- Automatically checks for existing sessions on load

### LoginForm
- React Hook Form for validation
- Email and password validation
- Error handling and display
- Password reset link

### SessionDisplay
- Shows authenticated user information
- Displays organization details
- Admin/Member role indication
- Logout functionality

### Stytch Service
- Organization discovery implementation
- Password authentication with discovered org
- Session management
- Password reset flow
- Detailed error handling

## Error Handling

The app provides detailed error messages for:

- **Invalid Credentials**: Clear message when email/password is wrong
- **Organization Not Found**: When no organization exists for email
- **Member Not Found**: When user doesn't exist in organization
- **Password Required**: When password auth is not enabled
- **Network Errors**: Connection and API issues
- **Session Expiry**: Automatic logout on expired sessions

## Security Features

- **No Organization ID Input**: Users can't accidentally enter wrong org
- **Automatic Discovery**: Prevents information leakage about org IDs
- **Session Token Management**: Secure token storage and validation
- **Password Reset Security**: Token-based reset with expiration
- **Error Boundary**: Graceful error handling for React errors

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **React Hook Form** - Form handling and validation
- **Tailwind CSS** - Styling
- **Stytch Vanilla JS SDK** - Authentication
- **react-error-boundary** - Error handling
- **clsx + tailwind-merge** - Class name utilities

## Development Notes

- All components are functional (no class components)
- Strict TypeScript configuration
- Comprehensive error handling
- Mobile-responsive design
- Form validation with React Hook Form
- Context-based state management
- Auto-discovery eliminates org ID complexity