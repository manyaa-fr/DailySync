import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button, Input, Card } from '../components/ui/UIComponents';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { axiosClient } from '../utils/axiosClient';
import { toast } from 'react-toastify';

const AuthLayout = ({ children, title, subtitle }: { children?: React.ReactNode, title: string, subtitle: string }) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
    <Card className="w-full max-w-md p-10 relative z-10 shadow-sm border-border bg-card">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-foreground text-background mb-6 font-bold text-lg">DS</div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="text-base text-muted-foreground mt-3">{subtitle}</p>
      </div>
      {children}
    </Card>
  </div>
);    

export const Register = () => {
const [isHidden, setIsHidden] = React.useState(true);
const [isLoading, setIsLoading] = React.useState(false);

const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const form = e.currentTarget;
  try {
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData);
    delete values.confirmPassword;
    const response = await axiosClient.post('/auth/register', values);
    const data = response.data;

    toast.success('Registration successful! Please log in.');

    localStorage.setItem("token", data.token);

    console.log('Registration successful:', data);

    if ( isLoading ) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = '/auth/login';
    }, 1500);
    form.reset();
  } catch (error) {
    console.error('FULL ERROR RESPONSE:', error.response?.data);
    toast.error(error.response?.data?.detail || 'Registration failed');
    setIsLoading(false);
  }
};


  return (
    <AuthLayout title="Create an account" subtitle="Start tracking your productivity today">
        <form onSubmit={handleRegister} className="space-y-5">
        <Input
            label="Full Name"
            name="fullName"
            placeholder="Jane Doe"
            required
        />

        <Input
            label="Email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
        />

        <div className="relative">
            <Input
            label="Password"
            name="password"
            type={isHidden ? 'password' : 'text'}
            placeholder="••••••••"
            required
            />
            <button
            type="button"
            className="absolute top-10 right-3 text-muted-foreground hover:text-foreground"
            onClick={() => setIsHidden(!isHidden)}
            >
            {isHidden ? <FaEye /> : <FaEyeSlash />}
            </button>
        </div>

        <div className="relative">
            <Input
            label="Confirm Password"
            name="confirmPassword"
            type={isHidden ? 'password' : 'text'}
            placeholder="••••••••"
            required
            />
            <button
            type="button"
            className="absolute top-10 right-3 text-muted-foreground hover:text-foreground"
            onClick={() => setIsHidden(!isHidden)}
            >
            {isHidden ? <FaEye /> : <FaEyeSlash />}
            </button>
        </div>
        <Button type="submit" className="w-full h-12" disabled={isLoading}>
             {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
        </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <NavLink to="/auth/login" className="text-foreground hover:underline font-semibold">Sign in</NavLink>
      </p>
    </AuthLayout>
  );
};