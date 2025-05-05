'use client';
import { useState } from 'react';

export default function AuthForm({ type = 'login', onSubmit }) {
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-muted p-8 rounded-lg shadow-lg max-w-md w-full">
      {type === 'register' && (
        <input
          name="name"
          type="text"
          placeholder="Your Name"
          className="input w-full p-4 rounded-lg bg-color-code-bg text-color-code-text focus:ring-2 focus:ring-primary focus:outline-none"
          onChange={handleChange}
          required
        />
      )}
      <input
        name="email"
        type="email"
        placeholder="Email"
        className="input w-full p-4 rounded-lg bg-color-code-bg text-color-code-text focus:ring-2 focus:ring-primary focus:outline-none"
        onChange={handleChange}
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        className="input w-full p-4 rounded-lg bg-color-code-bg text-color-code-text focus:ring-2 focus:ring-primary focus:outline-none"
        onChange={handleChange}
        required
      />
      <button type="submit" className="btn w-full py-3 rounded-xl bg-primary text-white hover:bg-primary-hover transition">
        {type === 'login' ? 'Login' : 'Register'}
      </button>
    </form>
  );
}
