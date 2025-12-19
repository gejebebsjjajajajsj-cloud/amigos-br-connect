import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgeVerification from '@/components/AgeVerification';
import ClubProfile from '@/components/ClubProfile';

const ProfilePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
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

  if (!slug) {
    navigate('/');
    return null;
  }

  if (!isVerified) {
    return <AgeVerification onVerify={handleVerify} />;
  }

  return <ClubProfile slug={slug} />;
};

export default ProfilePage;
