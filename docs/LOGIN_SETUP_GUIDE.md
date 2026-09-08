# Login System - Setup and Configuration Guide

## Quick Start

### 1. Installation
No additional packages needed! The login system uses native browser APIs and existing dependencies.

### 2. File Locations
```
frontend/src/
├── pages/
│   ├── UnifiedLogin.tsx          # Main login page
│   └── doctor/
│       └── DoctorLogin.tsx        # [DEPRECATED - Use UnifiedLogin]
├── utils/
│   ├── passwordValidator.ts       # Password validation utilities
│   └── biometricAuth.ts          # Biometric authentication utilities
├── config/
│   └── loginConfig.ts            # Login configuration settings
├── types/
│   └── biometric.ts              # TypeScript type definitions
├── components/
│   └── PasswordStrengthIndicator.tsx # Reusable component
└── App.tsx                       # Updated routing (uses /login)
```

### 3. Enable the Login System

The login system is already integrated into `App.tsx`. The route is available at:
```
http://localhost:5173/login
```

## Configuration

### Custom Password Requirements

Edit `frontend/src/config/loginConfig.ts`:

```typescript
PASSWORD: {
  MIN_LENGTH: 12,              // Change minimum length
  REQUIRE_UPPERCASE: true,     // Require A-Z
  REQUIRE_LOWERCASE: true,     // Require a-z
  REQUIRE_NUMBER: true,        // Require 0-9
  REQUIRE_SPECIAL_CHAR: true,  // Require special chars
  SPECIAL_CHARS: '!@#$%^&*()_+-=[]{};\':"|,.<>/?'
}
```

### Enable/Disable Features

```typescript
FEATURES: {
  ENABLE_PASSWORD_VALIDATION: true,
  ENABLE_BIOMETRIC_LOGIN: true,
  ENABLE_REMEMBER_ME: true,
  ENABLE_PASSWORD_RESET: false,
  ENABLE_TWO_FACTOR: false
}
```

### UI Customization

```typescript
UI: {
  SHOW_PASSWORD_STRENGTH: true,    // Show strength indicator
  SHOW_BIOMETRIC_OPTION: true,     // Show biometric button
  ANIMATION_DURATION: 300,         // Animation speed (ms)
  SHOW_DEMO_CREDENTIALS: true      // Show demo credentials
}
```

### API Endpoint Configuration

```typescript
API: {
  BASE_URL: 'http://localhost:8000/api',
  ENDPOINTS: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    REGISTER_BIOMETRIC: '/biometric/register',
    AUTHENTICATE_BIOMETRIC: '/biometric/authenticate'
  }
}
```

## Usage Guide

### Accessing the Login Page

1. **Start development server:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Open in browser:**
   ```
   http://localhost:5173/login
   ```

### Login Flow

#### Patient Login
```
1. Click "Login as Patient"
2. Enter username
3. Enter password meeting requirements
4. Click "Sign In"
→ Redirects to patient portal (/)
```

#### Doctor Login
```
1. Click "Login as Doctor"
2. Enter username
3. Enter password meeting requirements
4. Click "Sign In"
→ Redirects to doctor dashboard (/doctor/dashboard)
```

#### Biometric Login (if device supports it)
```
1. Choose role (Patient or Doctor)
2. Click "Biometric Login" button
3. Use fingerprint or face recognition
4. Confirm browser permission
→ Automatic redirection based on role
```

### Password Validation

All passwords must include:
- ✓ Minimum 8 characters
- ✓ At least one uppercase letter (A-Z)
- ✓ At least one lowercase letter (a-z)
- ✓ At least one number (0-9)
- ✓ At least one special character (!@#$%^&*...)

**Real-time feedback:**
- Red errors show what's missing
- Strength bar updates as you type
- Clear requirements list when invalid

### Testing

#### Demo Credentials

**Doctor:**
```
Username: doctor
Password: Demo@1234
```

**Patient:**
```
Username: patient
Password: Patient@2024
```

#### Test Scenarios

1. **Valid Login:**
   - Username: `doctor`
   - Password: `Demo@1234`
   - Expected: Redirects to `/doctor/dashboard`

2. **Invalid Password:**
   - Username: `doctor`
   - Password: `demo1234` (no uppercase)
   - Expected: Shows error "Password must contain..."

3. **Short Password:**
   - Username: `doctor`
   - Password: `Demo@1` (7 chars)
   - Expected: Shows "Password must be at least 8 characters"

4. **Biometric:**
   - Click "Biometric Login"
   - Expected: Shows authentication prompt (browser-dependent)

## API Integration

### Backend Login Endpoint

The login component expects this API response:

```typescript
// Request
POST /api/login
Content-Type: application/json
{
  "email": "doctor@hospital.com",  // username@domain.com format
  "password": "Demo@1234"
}

// Response (200 OK)
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "email": "doctor@hospital.com",
    "role": "doctor",
    "full_name": "Dr. Smith"
  }
}

// Error Response (401 Unauthorized)
{
  "message": "Invalid credentials"
}
```

### Backend Requirements

1. **Hash passwords** using bcrypt:
   ```python
   # Python example
   from passlib.context import CryptContext
   pwd_context = CryptContext(schemes=["bcrypt"])
   hashed = pwd_context.hash("Demo@1234")
   ```

2. **Validate passwords** before hashing:
   ```python
   # Ensure all requirements are met
   # (backend validation is optional but recommended)
   ```

3. **Return JWT token:**
   ```python
   # Create JWT with user info
   token = create_access_token(user_id=user.id)
   ```

4. **Set CORS headers** (if frontend is separate):
   ```python
   # Allow requests from frontend origin
   from fastapi.middleware.cors import CORSMiddleware
   app.add_middleware(CORSMiddleware, allow_origins=["*"])
   ```

## Customization Examples

### Change Button Colors

Edit `UnifiedLogin.tsx`:

```typescript
// Role selection buttons
style={{
  backgroundColor: '#3b82f6',  // Change this color
  borderColor: '#1e40af'       // Change this color
}}

// Login button
style={{
  backgroundColor: '#667eea',  // Change this color
  color: 'white'
}}
```

### Add Custom Logo

In the header of `UnifiedLogin.tsx`:

```typescript
<div style={{ textAlign: 'center', marginBottom: '40px' }}>
  <img 
    src="/logo.png" 
    alt="Sahayak" 
    style={{ width: '100px', marginBottom: '20px' }}
  />
  <h1>Welcome to Sahayak</h1>
</div>
```

### Modify Password Requirements

In `passwordValidator.ts`:

```typescript
export const validatePassword = (password: string) => {
  const errors: string[] = [];
  
  // Add custom requirement
  if (!/[A-Z]{2}/.test(password)) {
    errors.push('Must contain at least 2 uppercase letters');
  }
  
  // ... rest of validation
};
```

## Troubleshooting

### Login Page Not Loading

**Problem:** Blank page or routing error

**Solution:**
1. Check `App.tsx` has updated import:
   ```typescript
   import UnifiedLogin from './pages/UnifiedLogin';
   ```

2. Verify route is defined:
   ```typescript
   <Route path="/login" element={<UnifiedLogin />} />
   ```

3. Check browser console for errors

### Password Requirements Not Showing

**Problem:** Can't see password requirements

**Solution:**
1. Check `SHOW_PASSWORD_STRENGTH` in config is `true`
2. Type in password field to trigger validation
3. Check browser developer tools for CSS issues

### Biometric Not Available

**Problem:** No "Biometric Login" button

**Solution:**
1. Check `SHOW_BIOMETRIC_OPTION` in config is `true`
2. Device must have biometric hardware (fingerprint/face)
3. Browser must support WebAuthn (Chrome 67+, Firefox 60+, Safari 13+, Edge 18+)
4. Must be on HTTPS (or localhost)
5. Check browser permission prompt

### API Connection Error

**Problem:** "Login failed" when submitting credentials

**Solution:**
1. Verify backend is running:
   ```bash
   curl http://localhost:8000/api/login -X POST
   ```

2. Check `API.BASE_URL` in config:
   ```typescript
   API: {
     BASE_URL: 'http://localhost:8000/api'
   }
   ```

3. Verify CORS is enabled on backend
4. Check network tab in browser DevTools for actual error

### Wrong Redirect After Login

**Problem:** Doctor redirects to patient portal or vice versa

**Solution:**
1. Check API returns correct `role` field:
   ```typescript
   "role": "doctor"  // or "patient"
   ```

2. Verify `setUser()` call in `handleLogin`:
   ```typescript
   setUser({ ...res.user, role: userRole });
   ```

## Advanced Usage

### Custom Login Hook

Create a reusable hook for login:

```typescript
// hooks/useLogin.ts
export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAppContext();
  const navigate = useNavigate();

  const login = async (username: string, password: string, role: 'patient' | 'doctor') => {
    setIsLoading(true);
    try {
      const res = await authApi.login(username, password);
      setUser({ ...res.user, role });
      navigate(role === 'doctor' ? '/doctor/dashboard' : '/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};
```

### Password Reset Flow

To add password reset:

1. Create new component `ResetPassword.tsx`
2. Add route `/forgot-password`
3. Send reset email from backend
4. Validate new password with same requirements

### Two-Factor Authentication

To add 2FA:

1. After successful login, show OTP screen
2. Send OTP via email or SMS
3. Verify OTP before setting user context
4. Redirect after verification

## Performance Tips

1. **Lazy load biometric APIs:**
   ```typescript
   const [biometricAvailable, setBiometricAvailable] = useState(false);
   useEffect(() => {
     // Check only once on component mount
   }, []);
   ```

2. **Debounce password validation:**
   ```typescript
   const debounce = (fn: Function, delay: number) => {
     let timeoutId: NodeJS.Timeout;
     return (...args: any[]) => {
       clearTimeout(timeoutId);
       timeoutId = setTimeout(() => fn(...args), delay);
     };
   };
   ```

3. **Cache validation results:**
   ```typescript
   const validationCache = new Map<string, PasswordValidationResult>();
   ```

## Security Best Practices

1. ✓ Never log passwords to console
2. ✓ Use HTTPS in production
3. ✓ Implement rate limiting on backend
4. ✓ Use secure cookies for tokens
5. ✓ Hash passwords with bcrypt
6. ✓ Implement account lockout after failed attempts
7. ✓ Add CSRF token validation
8. ✓ Use Content Security Policy (CSP) headers

## Support & Resources

- **WebAuthn Spec:** https://www.w3.org/TR/webauthn-2/
- **OWASP:** https://owasp.org/www-community/authentication/
- **MDN Web Docs:** https://developer.mozilla.org/en-US/docs/Web/API/WebAuthn_API
- **Passkeys Guide:** https://passkeys.io/

---

**Last Updated:** 2024  
**Version:** 1.0.0
