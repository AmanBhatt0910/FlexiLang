'use client';
import AuthForm from '@/components/AuthForm';
import { useRouter } from 'next/navigation';
import axios from '@/utils/axiosInstance';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = async (formData) => {
    try {
      const res = await axios.post('/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      router.push('/translate');
    } catch (err) {
      alert(err?.response?.data?.message || 'Register failed');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted">
      <AuthForm type="register" onSubmit={handleRegister} />
    </div>
  );
}
