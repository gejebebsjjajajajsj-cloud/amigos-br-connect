import { useState, useEffect } from 'react';
import AgeVerification from '@/components/AgeVerification';
import ClubProfile from '@/components/ClubProfile';

const Index = () => {
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('age_verified');
    if (verified === 'true') {
      setIsVerified(true);
    }
  }, []);

  const handleVerify = () => {
    localStorage.setItem('age_verified', 'true');
    setIsVerified(true);
  };

  if (!isVerified) {
    return <AgeVerification onVerify={handleVerify} />;
  }

  return <ClubProfile />;
};

export default Index;
