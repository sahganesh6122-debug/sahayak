/**
 * Biometric Authentication Utilities
 * Provides WebAuthn/FIDO2 support for biometric login
 * Supports fingerprint, face recognition, and platform authenticators
 */

export interface BiometricUser {
  id: string;
  username: string;
  role: 'patient' | 'doctor';
  credentialId: string;
  publicKey: string;
  registeredAt: string;
}

export interface BiometricOptions {
  timeout?: number;
  userVerification?: 'required' | 'preferred' | 'discouraged';
}

/**
 * Check if the browser supports WebAuthn
 */
export const isBiometricSupported = async (): Promise<boolean> => {
  try {
    return !!(
      window.PublicKeyCredential &&
      (await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
    );
  } catch (err) {
    console.error('Error checking biometric support:', err);
    return false;
  }
};

/**
 * Register a biometric authenticator
 * In production, this would communicate with a backend server
 */
export const registerBiometric = async (
  userId: string,
  username: string,
  role: 'patient' | 'doctor',
  options?: BiometricOptions
): Promise<BiometricUser | null> => {
  try {
    if (!window.PublicKeyCredential) {
      throw new Error('WebAuthn is not supported on this device');
    }

    // Generate a random challenge
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    // Prepare credential creation options
    const creationOptions: CredentialCreationOptions = {
      publicKey: {
        challenge,
        rp: {
          name: 'Sahayak Healthcare',
          id: window.location.hostname
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: username,
          displayName: username
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 }, // ES256
          { type: 'public-key', alg: -257 } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          residentKey: 'preferred',
          userVerification: options?.userVerification || 'preferred'
        },
        timeout: options?.timeout || 60000,
        attestation: 'direct'
      }
    };

    // Create credential
    const credential = (await navigator.credentials.create(
      creationOptions
    )) as PublicKeyCredential | null;

    if (!credential) {
      throw new Error('Failed to create credential');
    }

    // Store biometric credential info
    const biometricUser: BiometricUser = {
      id: userId,
      username,
      role,
      credentialId: arrayBufferToBase64(credential.id as unknown as ArrayBuffer),
      publicKey: 'public-key-' + Date.now(), // Simplified for demo
      registeredAt: new Date().toISOString()
    };

    // Save to localStorage (in production, send to backend)
    localStorage.setItem(
      `biometric_${userId}`,
      JSON.stringify(biometricUser)
    );

    return biometricUser;
  } catch (err) {
    console.error('Error registering biometric:', err);
    return null;
  }
};

/**
 * Authenticate using biometric
 * In production, this would verify with a backend server
 */
export const authenticateWithBiometric = async (
  options?: BiometricOptions
): Promise<{ userId: string; role: 'patient' | 'doctor' } | null> => {
  try {
    if (!window.PublicKeyCredential) {
      throw new Error('WebAuthn is not supported on this device');
    }

    // Generate a random challenge
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    // Prepare assertion options
    const assertionOptions: CredentialRequestOptions = {
      publicKey: {
        challenge,
        timeout: options?.timeout || 60000,
        userVerification: options?.userVerification || 'preferred'
      }
    };

    // Get credential (authenticate)
    const assertion = (await navigator.credentials.get(
      assertionOptions
    )) as PublicKeyCredential | null;

    if (!assertion) {
      throw new Error('Authentication failed');
    }

    // In production, verify the assertion with the backend
    // For demo purposes, we'll simulate a successful authentication
    const mockUserId = 'biometric_' + Date.now();
    const mockRole: 'patient' | 'doctor' = Math.random() > 0.5 ? 'patient' : 'doctor';

    return {
      userId: mockUserId,
      role: mockRole
    };
  } catch (err) {
    console.error('Error authenticating with biometric:', err);
    return null;
  }
};

/**
 * Utility function to convert ArrayBuffer to Base64
 */
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Utility function to convert Base64 to ArrayBuffer
 * (Reserved for future use)
 */
// const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
//   const binary = atob(base64);
//   const bytes = new Uint8Array(binary.length);
//   for (let i = 0; i < binary.length; i++) {
//     bytes[i] = binary.charCodeAt(i);
//   }
//   return bytes.buffer;
// };

/**
 * Get all registered biometric authenticators for a user
 */
export const getBiometricCredentials = (userId: string): BiometricUser | null => {
  try {
    const stored = localStorage.getItem(`biometric_${userId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error('Error retrieving biometric credentials:', err);
    return null;
  }
};

/**
 * Remove biometric credential for a user
 */
export const removeBiometricCredential = (userId: string): boolean => {
  try {
    localStorage.removeItem(`biometric_${userId}`);
    return true;
  } catch (err) {
    console.error('Error removing biometric credential:', err);
    return false;
  }
};

/**
 * Check if biometric is registered for a specific user
 */
export const isBiometricRegistered = (userId: string): boolean => {
  return getBiometricCredentials(userId) !== null;
};
