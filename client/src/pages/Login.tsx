import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Github } from 'lucide-react';
import { Button, Input, Card } from '../components/ui/UIComponents';
import { axiosClient } from '../utils/axiosClient';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/useAuth';

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

export const Login = () => {
  const {login} = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;
    
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      setIsLoading(true);

      await axiosClient.post('/auth/login', { email, password }, {withCredentials: true});

      toast.success('Login successful!');
      login();
      navigate('/app/dashboard');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('FULL ERROR RESPONSE:', error.response?.data);
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Enter your credentials to access your account">
      <form onSubmit={handleLogin} className="space-y-5">
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
        />

        <Button type="submit" className="w-full h-12">Sign In</Button>
      </form>
      
      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-card px-4 text-muted-foreground font-medium">Or continue with</span>
          </div>
        </div>
        <Button variant="outline" type="button" className="w-full mt-6 gap-2 h-12" onClick={() => navigate('/app/dashboard')}>
          <Github size={18} /> GitHub
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <NavLink to="/auth/register" className="text-foreground hover:underline font-semibold">Sign up</NavLink>
      </p>
    </AuthLayout>
  );
};
