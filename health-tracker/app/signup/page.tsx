"use client";

import { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      toast.success("Account created! Please check your email to verify.", { duration: 6000 });
      router.push('/login');
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen p-6 justify-center pb-24">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-neutral-100">Create Account</h1>
        <p className="text-neutral-400">Join HealthTracker</p>
      </div>

      <Card>
        <form onSubmit={handleSignup} className="space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            placeholder="•••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={6}
          />

          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}

          <div className="pt-3">
            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </div>
        </form>
      </Card>

      <div className="text-center mt-8">
        <p className="text-neutral-500 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
