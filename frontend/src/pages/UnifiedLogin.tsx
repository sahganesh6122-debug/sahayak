import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { authApi } from '../services/api';
import { validatePassword, getPasswordStrengthColor } from '../utils/passwordValidator';

type UserRole = 'patient' | 'doctor' | null;

const UnifiedLogin: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAppContext();
  
  // State management
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [showBiometricOption, setShowBiometricOption] = useState(false);

  // Check if biometric API is available
  useEffect(() => {
    const checkBiometric = async () => {
      if (window.PublicKeyCredential) {
        try {
          const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setBiometricAvailable(available);
          setShowBiometricOption(available);
        } catch (err) {
          console.log('Biometric not available:', err);
        }
      }
    };
    checkBiometric();
  }, []);

  // Validate password on change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    if (newPassword.length > 0) {
      const validation = validatePassword(newPassword);
      setPasswordErrors(validation.errors);
      setPasswordStrength(validation.strength);
    } else {
      setPasswordErrors([]);
    }
  };

  // Handle standard login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userRole) {
      setError('Please select a user type');
      return;
    }
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    const validation = validatePassword(password);
    if (!validation.isValid) {
      setError('Password does not meet requirements');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // For patient, use username directly; for doctor, use as email
      const loginIdentifier = userRole === 'doctor' ? `${username}@hospital.com` : username;
      const res = await authApi.login(loginIdentifier, password);
      setUser({ ...res.user, role: userRole });
      
      if (userRole === 'patient') {
        navigate('/patient/welcome');
      } else {
        navigate('/doctor/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle biometric login
  const handleBiometricLogin = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Simulated biometric authentication
      // In production, this would use WebAuthn API
      const mockBiometricAuth = async (): Promise<{ id: string; role: UserRole }> => {
        return new Promise((resolve, reject) => {
          // Simulate user verification
          const confirmed = window.confirm(
            'Verify your identity using biometric authentication. Click OK to proceed.'
          );
          
          if (confirmed) {
            // Mock successful biometric authentication
            const mockUserId = 'biometric_user_' + Date.now();
            const role = userRole || 'patient';
            resolve({ id: mockUserId, role: role as UserRole });
          } else {
            reject(new Error('Biometric authentication cancelled'));
          }
        });
      };

      const bioAuth = await mockBiometricAuth();
      
      if (bioAuth.role === 'patient') {
        setUser({ id: bioAuth.id, email: 'biometric@patient.local', role: 'patient', full_name: 'Biometric User' });
        navigate('/patient/welcome');
      } else if (bioAuth.role === 'doctor') {
        setUser({ id: bioAuth.id, email: 'biometric@doctor.local', role: 'doctor', full_name: 'Dr. Biometric User' });
        navigate('/doctor/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Biometric authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Back button - clear role selection
  const handleBack = () => {
    setUserRole(null);
    setUsername('');
    setPassword('');
    setError('');
    setPasswordErrors([]);
  };

  // Role selection screen
  if (!userRole) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '500px',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 10px 0' }}>
              Welcome to Sahayak
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
              Healthcare Case Management System
            </p>
          </div>

          <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '15px', marginBottom: '30px' }}>
            Please select your user type to continue
          </p>

          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Patient Button */}
            <button
              onClick={() => setUserRole('patient')}
              style={{
                padding: '20px',
                backgroundColor: '#f0f9ff',
                border: '2px solid #3b82f6',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e40af',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#e0f2fe';
                (e.target as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#f0f9ff';
                (e.target as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: '28px' }}>🏥</span>
              <span>Login as Patient</span>
            </button>

            {/* Doctor Button */}
            <button
              onClick={() => setUserRole('doctor')}
              style={{
                padding: '20px',
                backgroundColor: '#fef3c7',
                border: '2px solid #f59e0b',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '600',
                color: '#b45309',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#fef08a';
                (e.target as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#fef3c7';
                (e.target as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: '28px' }}>👨‍⚕️</span>
              <span>Login as Doctor</span>
            </button>
          </div>

          <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '13px', color: '#9ca3af' }}>
            <p>Don't have an account? Contact your administrator</p>
          </div>
        </div>
      </div>
    );
  }

  // Login form screen
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>
            {userRole === 'doctor' ? '👨‍⚕️ Doctor Login' : '🏥 Patient Login'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            {userRole === 'doctor' 
              ? 'Access your clinical dashboard' 
              : 'Complete your health assessment'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '20px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#991b1b',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Biometric Option */}
        {showBiometricOption && (
          <button
            onClick={handleBiometricLogin}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '20px',
              backgroundColor: '#f3f4f6',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              opacity: isLoading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                (e.target as HTMLElement).style.backgroundColor = '#e5e7eb';
                (e.target as HTMLElement).style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                (e.target as HTMLElement).style.backgroundColor = '#f3f4f6';
                (e.target as HTMLElement).style.transform = 'translateY(0)';
              }
            }}
          >
            <span style={{ fontSize: '18px' }}>🔐</span>
            Biometric Login
          </button>
        )}

        {/* Divider */}
        {showBiometricOption && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px',
            gap: '10px'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
            <span style={{ color: '#9ca3af', fontSize: '13px' }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '16px' }}>
          {/* Username */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={userRole === 'doctor' ? 'Dr. Smith' : 'Enter your username'}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                (e.target as HTMLElement).style.borderColor = '#667eea';
                (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                (e.target as HTMLElement).style.borderColor = '#d1d5db';
                (e.target as HTMLElement).style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Password
              </label>
              {password && (
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: getPasswordStrengthColor(passwordStrength)
                }}>
                  {passwordStrength === 'weak' ? '⚠️ Weak' : passwordStrength === 'medium' ? '⚡ Medium' : '✓ Strong'}
                </span>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Min 8 chars: Aa1!Xx"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 12px',
                  paddingRight: '40px',
                  borderRadius: '8px',
                  border: passwordErrors.length > 0 && password ? '1px solid #ef4444' : '1px solid #d1d5db',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  (e.target as HTMLElement).style.borderColor = '#667eea';
                  (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  (e.target as HTMLElement).style.borderColor = passwordErrors.length > 0 && password ? '#ef4444' : '#d1d5db';
                  (e.target as HTMLElement).style.boxShadow = 'none';
                }}
              />
              
              {/* Show/Hide Password Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '4px'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {/* Password Strength Bar */}
            {password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{
                  height: '4px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%',
                    backgroundColor: getPasswordStrengthColor(passwordStrength),
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            )}

            {/* Password Requirements */}
            {password && passwordErrors.length > 0 && (
              <div style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: '6px'
              }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', color: '#b45309' }}>
                  Password requirements:
                </p>
                <ul style={{
                  margin: 0,
                  paddingLeft: '20px',
                  fontSize: '12px',
                  color: '#b45309'
                }}>
                  {passwordErrors.map((error, idx) => (
                    <li key={idx} style={{ margin: '4px 0' }}>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '12px',
              marginTop: '8px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              opacity: isLoading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                (e.target as HTMLElement).style.backgroundColor = '#5568d3';
                (e.target as HTMLElement).style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                (e.target as HTMLElement).style.backgroundColor = '#667eea';
                (e.target as HTMLElement).style.transform = 'translateY(0)';
              }
            }}
          >
            {isLoading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        {/* Back Button */}
        <button
          onClick={handleBack}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '12px',
            backgroundColor: 'transparent',
            color: '#667eea',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            opacity: isLoading ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              (e.target as HTMLElement).style.backgroundColor = '#f3f4f6';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              (e.target as HTMLElement).style.backgroundColor = 'transparent';
            }
          }}
        >
          ← Back to Role Selection
        </button>

        {/* Demo Info */}
        {userRole === 'doctor' && (
          <div style={{
            marginTop: '24px',
            padding: '12px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#0c4a6e'
          }}>
            <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>Demo Credentials:</p>
            <p style={{ margin: '4px 0', fontFamily: 'monospace' }}>Username: doctor</p>
            <p style={{ margin: '4px 0', fontFamily: 'monospace' }}>Password: Demo@1234</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedLogin;
