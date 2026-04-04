import { API_BASE_URL, apiService, endpoints } from '@/lib/api';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Activate = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function activateAccount() {
      if (userId) {
        await axios
          .post(`${API_BASE_URL}${endpoints.activateAccount(userId)}`, {})
          .then(() => {
            toast.success('Account activated! Please login.');
            navigate('/signin');
          })
          .catch(() => {
            toast.error('Activation failed. Please try again.');
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }
    activateAccount();
  }, [userId, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {loading ? (
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary mb-4"></div>
      ) : (
        <div>Activation failed or missing code.</div>
      )}
    </div>
  );
};

export default Activate;
