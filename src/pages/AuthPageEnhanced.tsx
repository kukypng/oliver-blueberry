
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useLicenseValidation } from '@/hooks/useLicenseValidation';
import { LicenseActivationSection } from '@/components/auth/LicenseActivationSection';
import { AuthForm } from '@/components/auth/AuthForm';

export const AuthPageEnhanced = () => {
  const { user } = useAuth();
  const { data: isLicenseValid } = useLicenseValidation();
  const navigate = useNavigate();

  const handleLicenseActivated = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Main Auth Form */}
        <AuthForm />
        
        {/* License Activation Section - Only show if user is logged in but license is invalid */}
        {user && isLicenseValid === false && (
          <LicenseActivationSection 
            user={user} 
            onLicenseActivated={handleLicenseActivated}
          />
        )}
      </div>
    </div>
  );
};
