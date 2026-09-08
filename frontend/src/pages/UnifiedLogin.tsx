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
  const [showBiometricOption, setShowBiometricOption] = useState(false);

  // Hospital theme colors
  const colors = {
    primary: '#0F766E', // Hospital teal
    primaryLight: '#14B8A6',
    primaryDark: '#0D5F59',
    secondary: '#0369A1', // Medical blue
    accent: '#DC2626', // Alert red
    success: '#059669',
    background: '#F0F9FF',
    surface: '#FFFFFF',
    text: '#1F2937',
    textLight: '#6B7280',
    border: '#E5E7EB',
    hover: '#F3F4F6',
  };

  // Check if biometric API is available
  useEffect(() => {
    const checkBiometric = async () => {
      if (window.PublicKeyCredential) {
        try {
          const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
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

  // Role selection screen - Hospital themed
  if (!userRole) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'center' }}>
          {/* Left Side - Hospital Branding */}
          <div style={{ color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ marginBottom: '30px' }}>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <span style={{ fontSize: '56px' }}>⚕️</span>
                <span>Sahayak</span>
              </div>
              <p style={{ fontSize: '18px', opacity: 0.9, margin: '0 0 10px 0' }}>
                Healthcare Case Management System
              </p>
              <div style={{ height: '3px', width: '60px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '2px', marginBottom: '20px' }}></div>
            </div>
            
            <div style={{ marginBottom: '40px' }}>
              <p style={{ fontSize: '16px', opacity: 0.95, lineHeight: 1.6 }}>
                Empowering healthcare providers and patients with intelligent clinical case management, secure documentation, and comprehensive patient care coordination.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '16px', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔒</div>
                <div style={{ fontSize: '12px', fontWeight: '600', opacity: 0.9 }}>SECURE & ENCRYPTED</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '16px', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📱</div>
                <div style={{ fontSize: '12px', fontWeight: '600', opacity: 0.9 }}>MOBILE FRIENDLY</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '16px', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
                <div style={{ fontSize: '12px', fontWeight: '600', opacity: 0.9 }}>REAL-TIME UPDATES</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '16px', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏆</div>
                <div style={{ fontSize: '12px', fontWeight: '600', opacity: 0.9 }}>TRUSTED CARE</div>
              </div>
            </div>
          </div>

          {/* Right Side - Role Selection */}
          <div style={{
            background: colors.surface,
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative top accent */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight}, ${colors.secondary})`,
            }}></div>

            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: colors.text, margin: '0 0 10px 0' }}>
                Welcome Back
              </h1>
              <p style={{ color: colors.textLight, fontSize: '16px', margin: 0 }}>
                Select your role to access your dashboard
              </p>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              {/* Patient Button - Modern Card Design */}
              <button
                onClick={() => setUserRole('patient')}
                className="portal-button"
                style={{
                  padding: '32px',
                  background: `linear-gradient(135deg, #E0F7FA 0%, #80DEEA 50%, #4DD0E1 100%)`,
                  border: 'none',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#00695C',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0, 172, 193, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.transform = 'translateY(-8px) scale(1.02)';
                  target.style.boxShadow = '0 20px 40px rgba(0, 172, 193, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.6)';
                  // Animate icon
                  const icon = target.querySelector('.portal-icon') as HTMLElement;
                  if (icon) icon.style.transform = 'scale(1.15) rotate(5deg)';
                  // Animate arrow
                  const arrow = target.querySelector('.portal-arrow') as HTMLElement;
                  if (arrow) arrow.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.transform = 'translateY(0) scale(1)';
                  target.style.boxShadow = '0 8px 24px rgba(0, 172, 193, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
                  // Reset icon
                  const icon = target.querySelector('.portal-icon') as HTMLElement;
                  if (icon) icon.style.transform = 'scale(1) rotate(0deg)';
                  // Reset arrow
                  const arrow = target.querySelector('.portal-arrow') as HTMLElement;
                  if (arrow) arrow.style.transform = 'translateX(0)';
                }}
              >
                {/* Left Side - Icon Container */}
                <div 
                  className="portal-icon"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '80px',
                    minHeight: '80px',
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    fontSize: '48px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}>
                  🏥
                </div>

                {/* Right Side - Text Content */}
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: '700',
                    marginBottom: '6px',
                    letterSpacing: '0.5px'
                  }}>
                    Patient Portal
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    opacity: 0.8, 
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    Complete your health assessment
                  </div>
                  <div style={{
                    fontSize: '11px',
                    opacity: 0.6,
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}>
                    <span>✓ Quick Access</span>
                    <span>✓ Secure Data</span>
                  </div>
                </div>

                {/* Right Arrow Indicator */}
                <div 
                  className="portal-arrow"
                  style={{
                    fontSize: '24px',
                    opacity: 0.6,
                    transition: 'all 0.3s ease',
                    transform: 'translateX(0)'
                  }}>
                  →
                </div>

                {/* Animated Background Gradient */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transition: 'left 0.5s ease',
                  pointerEvents: 'none'
                }} />
              </button>

              {/* Doctor Button - Modern Card Design */}
              <button
                onClick={() => setUserRole('doctor')}
                className="portal-button"
                style={{
                  padding: '32px',
                  background: `linear-gradient(135deg, #FFF8E1 0%, #FFE082 50%, #FFD54F 100%)`,
                  border: 'none',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#E65100',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(255, 152, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.transform = 'translateY(-8px) scale(1.02)';
                  target.style.boxShadow = '0 20px 40px rgba(255, 152, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.6)';
                  // Animate icon
                  const icon = target.querySelector('.portal-icon') as HTMLElement;
                  if (icon) icon.style.transform = 'scale(1.15) rotate(-5deg)';
                  // Animate arrow
                  const arrow = target.querySelector('.portal-arrow') as HTMLElement;
                  if (arrow) arrow.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.transform = 'translateY(0) scale(1)';
                  target.style.boxShadow = '0 8px 24px rgba(255, 152, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
                  // Reset icon
                  const icon = target.querySelector('.portal-icon') as HTMLElement;
                  if (icon) icon.style.transform = 'scale(1) rotate(0deg)';
                  // Reset arrow
                  const arrow = target.querySelector('.portal-arrow') as HTMLElement;
                  if (arrow) arrow.style.transform = 'translateX(0)';
                }}
              >
                {/* Left Side - Icon Container */}
                <div 
                  className="portal-icon"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '80px',
                    minHeight: '80px',
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    fontSize: '48px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}>
                  👨‍⚕️
                </div>

                {/* Right Side - Text Content */}
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: '700',
                    marginBottom: '6px',
                    letterSpacing: '0.5px'
                  }}>
                    Doctor Portal
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    opacity: 0.8, 
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    Access your clinical dashboard
                  </div>
                  <div style={{
                    fontSize: '11px',
                    opacity: 0.6,
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}>
                    <span>✓ Patient Cases</span>
                    <span>✓ Analytics</span>
                  </div>
                </div>

                {/* Right Arrow Indicator */}
                <div 
                  className="portal-arrow"
                  style={{
                    fontSize: '24px',
                    opacity: 0.6,
                    transition: 'all 0.3s ease',
                    transform: 'translateX(0)'
                  }}>
                  →
                </div>

                {/* Animated Background Gradient */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transition: 'left 0.5s ease',
                  pointerEvents: 'none'
                }} />
              </button>
            </div>

            <div style={{ marginTop: '40px', textAlign: 'center', borderTop: `1px solid ${colors.border}`, paddingTop: '20px' }}>
              <p style={{ fontSize: '13px', color: colors.textLight, margin: 0 }}>
                Don't have an account?{' '}
                <span style={{ color: colors.primary, fontWeight: '600', cursor: 'pointer' }}>
                  Contact your administrator
                </span>
              </p>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${colors.border}`, fontSize: '11px', color: colors.textLight, textAlign: 'center' }}>
              <p style={{ margin: 0 }}>© 2024 Sahayak Healthcare. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login form screen - Hospital themed
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'center' }}>
        {/* Left Side - Hospital Info */}
        <div style={{ color: 'white', display: 'none', flexDirection: 'column', justifyContent: 'center' }} className="hospital-info">
          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💊</div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
              Secure Healthcare Access
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
              Your health records and medical data are protected with enterprise-grade encryption and security protocols.
            </p>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
              Multi-Factor Authentication
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
              Biometric and password-based authentication ensures only authorized access.
            </p>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
              Real-Time Updates
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
              Stay informed with instant notifications about your care.
            </p>
          </div>

          <style>{`
            @media (min-width: 768px) {
              .hospital-info {
                display: flex !important;
              }
            }
          `}</style>
        </div>

        {/* Right Side - Login Form */}
        <div style={{
          background: colors.surface,
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative top accent */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight}, ${colors.secondary})`,
          }}></div>

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                {userRole === 'doctor' ? '👨‍⚕️' : '🏥'}
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: colors.text, margin: 0 }}>
                  {userRole === 'doctor' ? 'Doctor Portal' : 'Patient Portal'}
                </h2>
                <p style={{ color: colors.textLight, fontSize: '12px', margin: 0, marginTop: '4px' }}>
                  {userRole === 'doctor' 
                    ? 'Access clinical dashboard' 
                    : 'Complete health assessment'}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px 16px',
              marginBottom: '20px',
              backgroundColor: '#FEE2E2',
              border: `1px solid ${colors.accent}`,
              borderRadius: '8px',
              color: '#991B1B',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              {error}
            </div>
          )}

          {/* Biometric Option */}
          {showBiometricOption && (
            <>
              <button
                onClick={handleBiometricLogin}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '14px',
                  marginBottom: '16px',
                  background: `linear-gradient(135deg, ${colors.success} 0%, ${colors.primaryLight} 100%)`,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  opacity: isLoading ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.target as HTMLElement).style.boxShadow = '0 8px 16px rgba(5, 150, 105, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLElement).style.transform = 'translateY(0)';
                    (e.target as HTMLElement).style.boxShadow = 'none';
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>🔒</span>
                Quick Biometric Login
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px',
                gap: '10px'
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }}></div>
                <span style={{ color: colors.textLight, fontSize: '13px', fontWeight: '600' }}>or</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }}></div>
              </div>
            </>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} style={{ display: 'grid', gap: '18px' }}>
            {/* Username */}
            <div>
              <label style={{
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: colors.text,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ fontSize: '16px' }}>👤</span>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={userRole === 'doctor' ? 'Dr. Smith' : 'Enter your username'}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: `2px solid ${colors.border}`,
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  background: colors.surface
                }}
                onFocus={(e) => {
                  (e.target as HTMLElement).style.borderColor = colors.primary;
                  (e.target as HTMLElement).style.boxShadow = `0 0 0 4px rgba(15, 118, 110, 0.1)`;
                }}
                onBlur={(e) => {
                  (e.target as HTMLElement).style.borderColor = colors.border;
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
                  color: colors.text,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ fontSize: '16px' }}>🔑</span>
                  Password
                </label>
                {password && (
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: getPasswordStrengthColor(passwordStrength),
                    background: 'rgba(0,0,0,0.02)',
                    padding: '4px 8px',
                    borderRadius: '4px'
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
                    padding: '12px 14px 12px 14px',
                    paddingRight: '44px',
                    borderRadius: '8px',
                    border: passwordErrors.length > 0 && password ? `2px solid ${colors.accent}` : `2px solid ${colors.border}`,
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s ease',
                    background: colors.surface
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLElement).style.borderColor = colors.primary;
                    (e.target as HTMLElement).style.boxShadow = `0 0 0 4px rgba(15, 118, 110, 0.1)`;
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLElement).style.borderColor = passwordErrors.length > 0 && password ? colors.accent : colors.border;
                    (e.target as HTMLElement).style.boxShadow = 'none';
                  }}
                />
                
                {/* Show/Hide Password Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '4px 8px',
                    opacity: 0.6,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.opacity = '0.6';
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              {/* Password Strength Bar */}
              {password && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{
                    height: '5px',
                    backgroundColor: colors.border,
                    borderRadius: '3px',
                    overflow: 'hidden',
                    background: `linear-gradient(90deg, ${colors.border} 0%, ${colors.border} 100%)`
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
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#FEF3C7',
                  border: `1px solid #FCD34D`,
                  borderRadius: '6px'
                }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', color: '#B45309' }}>
                    Password requirements:
                  </p>
                  <ul style={{
                    margin: 0,
                    paddingLeft: '20px',
                    fontSize: '12px',
                    color: '#B45309'
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
                padding: '14px',
                marginTop: '12px',
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.target as HTMLElement).style.boxShadow = '0 8px 16px rgba(15, 118, 110, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  (e.target as HTMLElement).style.transform = 'translateY(0)';
                  (e.target as HTMLElement).style.boxShadow = 'none';
                }
              }}
            >
              <span style={{ fontSize: '16px' }}>🚀</span>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Back Button */}
          <button
            onClick={handleBack}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '16px',
              backgroundColor: 'transparent',
              color: colors.primary,
              border: `2px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              opacity: isLoading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                (e.target as HTMLElement).style.backgroundColor = colors.hover;
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
              padding: '14px 16px',
              backgroundColor: '#F0F9FF',
              border: `1px solid ${colors.secondary}`,
              borderRadius: '8px',
              fontSize: '12px',
              color: colors.secondary
            }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📋</span> Demo Credentials:
              </p>
              <p style={{ margin: '4px 0', fontFamily: 'monospace', background: 'rgba(0,0,0,0.03)', padding: '4px 8px', borderRadius: '4px' }}>
                Username: <strong>doctor</strong>
              </p>
              <p style={{ margin: '4px 0', fontFamily: 'monospace', background: 'rgba(0,0,0,0.03)', padding: '4px 8px', borderRadius: '4px' }}>
                Password: <strong>Demo@1234</strong>
              </p>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: `1px solid ${colors.border}`, fontSize: '11px', color: colors.textLight, textAlign: 'center' }}>
            <p style={{ margin: 0 }}>© 2024 Sahayak Healthcare. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;
