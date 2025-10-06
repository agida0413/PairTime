import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f5f7fa;
    color: #333;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: inherit;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  input, textarea {
    font-family: inherit;
    outline: none;
  }

  /* React Toastify Custom Styles */
  .Toastify__toast {
    border-radius: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    font-weight: 600;
    font-size: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    color: white !important;
  }

  .Toastify__toast-body {
    color: white !important;
    padding: 8px;
  }

  .Toastify__toast--success {
    background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  }

  .Toastify__toast--error {
    background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  }

  .Toastify__toast--warning {
    background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
    color: white !important;
  }

  .Toastify__toast--info {
    background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  }

  .Toastify__progress-bar {
    background: rgba(255, 255, 255, 0.8);
  }

  .Toastify__close-button {
    color: white !important;
    opacity: 0.8;
  }

  .Toastify__close-button:hover {
    opacity: 1;
  }

  .Toastify__toast-icon {
    width: 20px;
    margin-right: 8px;
  }
`;

export const theme = {
  colors: {
    primary: '#ff6b9d',
    primaryDark: '#e85882',
    primaryLight: '#ffacc8',
    secondary: '#4f9cf9',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    background: '#f5f7fa',
    white: '#ffffff',
    grey: {
      100: '#f8f9fa',
      200: '#e9ecef',
      300: '#dee2e6',
      400: '#ced4da',
      500: '#adb5bd',
      600: '#6c757d',
      700: '#495057',
      800: '#343a40',
      900: '#212529',
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d',
      disabled: '#adb5bd',
    },
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    xl: '16px',
    round: '50%',
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.1)',
    large: '0 8px 16px rgba(0, 0, 0, 0.1)',
    xl: '0 12px 24px rgba(0, 0, 0, 0.15)',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },
};
