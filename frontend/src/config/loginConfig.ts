/**
 * Login System Configuration
 * Centralized settings for the unified login system
 */

export const LOGIN_CONFIG = {
  // Password validation settings
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL_CHAR: true,
    SPECIAL_CHARS: '!@#$%^&*()_+-=[]{};\':"|,.<>/?',
    STRENGTH_THRESHOLDS: {
      MEDIUM: 12,
      STRONG: 16
    }
  },

  // Biometric authentication settings
  BIOMETRIC: {
    TIMEOUT: 60000, // milliseconds
    USER_VERIFICATION: 'preferred' as const, // 'required' | 'preferred' | 'discouraged'
    ENABLE_ON_REGISTRATION: false,
    ALLOW_BACKUP_AUTHENTICATOR: true
  },

  // Session settings
  SESSION: {
    REMEMBER_ME_DURATION: 7 * 24 * 60 * 60, // 7 days in seconds
    SESSION_TIMEOUT: 30 * 60, // 30 minutes in seconds
    AUTO_LOGOUT_WARNING: 5 * 60 // 5 minutes before logout
  },

  // UI Settings
  UI: {
    SHOW_PASSWORD_STRENGTH: true,
    SHOW_BIOMETRIC_OPTION: true,
    ANIMATION_DURATION: 300, // milliseconds
    SHOW_DEMO_CREDENTIALS: true
  },

  // Demo credentials (for development)
  DEMO: {
    DOCTOR: {
      username: 'doctor',
      password: 'Demo@1234',
      email: 'doctor@demo.com'
    },
    PATIENT: {
      username: 'patient',
      password: 'Patient@2024',
      email: 'patient@demo.com'
    }
  },

  // API endpoints
  API: {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    ENDPOINTS: {
      LOGIN: '/login',
      LOGOUT: '/logout',
      REGISTER_BIOMETRIC: '/biometric/register',
      AUTHENTICATE_BIOMETRIC: '/biometric/authenticate',
      REFRESH_TOKEN: '/refresh-token'
    }
  },

  // Messages
  MESSAGES: {
    PASSWORD_REQUIREMENTS_TITLE: 'Password requirements:',
    PASSWORD_ERRORS: {
      MIN_LENGTH: 'Password must be at least 8 characters long',
      NO_UPPERCASE: 'Password must contain at least one uppercase letter',
      NO_LOWERCASE: 'Password must contain at least one lowercase letter',
      NO_NUMBER: 'Password must contain at least one number',
      NO_SPECIAL_CHAR: 'Password must contain at least one special character'
    },
    LOGIN_ERRORS: {
      INVALID_CREDENTIALS: 'Invalid username or password',
      BIOMETRIC_FAILED: 'Biometric authentication failed',
      BIOMETRIC_CANCELLED: 'Biometric authentication was cancelled',
      BIOMETRIC_NOT_AVAILABLE: 'Biometric authentication is not available on this device',
      NETWORK_ERROR: 'Network error. Please check your connection.',
      UNKNOWN_ERROR: 'An unknown error occurred. Please try again.'
    },
    SUCCESS: {
      LOGIN_SUCCESS: 'Login successful. Redirecting...',
      BIOMETRIC_REGISTERED: 'Biometric authentication has been registered.',
      PASSWORD_CHANGED: 'Password changed successfully.'
    }
  },

  // Feature flags
  FEATURES: {
    ENABLE_PASSWORD_VALIDATION: true,
    ENABLE_BIOMETRIC_LOGIN: true,
    ENABLE_REMEMBER_ME: true,
    ENABLE_PASSWORD_RESET: true,
    ENABLE_TWO_FACTOR: false
  }
};

export type LoginConfig = typeof LOGIN_CONFIG;

/**
 * Get config value with fallback
 */
export const getConfig = <T>(path: string, defaultValue?: T): T | undefined => {
  const keys = path.split('.');
  let value: any = LOGIN_CONFIG;

  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return defaultValue;
  }

  return value as T;
};

/**
 * Override config at runtime (useful for testing)
 */
export const overrideConfig = (updates: Partial<LoginConfig>) => {
  Object.assign(LOGIN_CONFIG, updates);
};
