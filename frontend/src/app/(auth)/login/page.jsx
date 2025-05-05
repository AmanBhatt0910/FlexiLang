'use client';
import AuthForm from '@/components/AuthForm';
import { useRouter } from 'next/navigation';
import axios from '@/utils/axiosInstance';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (formData) => {
    try {
      const res = await axios.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      router.push('/translate');
    } catch (err) {
      alert(err?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted">
      <AuthForm type="login" onSubmit={handleLogin} />
    </div>
  );
}
