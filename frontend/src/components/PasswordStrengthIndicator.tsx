/**
 * Password Strength Indicator Component
 * Displays visual feedback on password strength
 */

import React from 'react';
import { validatePassword, getPasswordStrengthColor } from './passwordValidator';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showRequirements = true
}) => {
  if (!password) return null;

  const validation = validatePassword(password);
  const strengthColor = getPasswordStrengthColor(validation.strength);

  return (
    <div style={{ marginTop: '12px' }}>
      {/* Strength Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px'
      }}>
        <div style={{
          height: '6px',
          backgroundColor: '#e5e7eb',
          borderRadius: '3px',
          flex: 1,
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: validation.strength === 'weak' ? '33%' : validation.strength === 'medium' ? '66%' : '100%',
            backgroundColor: strengthColor,
            transition: 'width 0.3s ease'
          }}></div>
        </div>
        <span style={{
          fontSize: '12px',
          fontWeight: '600',
          color: strengthColor
        }}>
          {validation.strength === 'weak' ? '⚠️ Weak' : validation.strength === 'medium' ? '⚡ Medium' : '✓ Strong'}
        </span>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && validation.errors.length > 0 && (
        <div style={{
          padding: '10px',
          backgroundColor: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '6px'
        }}>
          <p style={{
            margin: '0 0 8px 0',
            fontSize: '12px',
            fontWeight: '600',
            color: '#b45309'
          }}>
            Password requirements:
          </p>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '12px',
            color: '#b45309'
          }}>
            {validation.errors.map((error, idx) => (
              <li key={idx} style={{ margin: '4px 0' }}>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
