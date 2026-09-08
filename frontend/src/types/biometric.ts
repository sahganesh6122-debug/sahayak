/**
 * WebAuthn/Biometric Authentication Types
 */

/**
 * Extends the global Window interface to include WebAuthn APIs
 */
declare global {
  interface Window {
    PublicKeyCredential: typeof PublicKeyCredential;
  }
}

/**
 * Biometric authentication result
 */
export interface BiometricAuthResult {
  success: boolean;
  userId?: string;
  role?: 'patient' | 'doctor';
  error?: string;
}

/**
 * Biometric registration result
 */
export interface BiometricRegisterResult {
  success: boolean;
  credentialId?: string;
  message?: string;
  error?: string;
}

/**
 * Password validation response
 */
export interface PasswordValidation {
  isValid: boolean;
  score: number; // 0-100
  strength: 'weak' | 'medium' | 'strong';
  feedback: string[];
  requirements: {
    minLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export {};
