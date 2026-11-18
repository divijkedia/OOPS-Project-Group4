import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Shield, Sparkles, User, Wrench, ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill username from query param if passed from landing modal (e.g. ?user=emp_john)
  const initialUsername = searchParams.get('user') || '';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: initialUsername,
      password: initialUsername ? 'password123' : '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const user = await login(data);
      showToast({
        type: 'success',
        title: 'Authentication Successful',
        message: `Welcome back, ${user.fullName} (${user.role})!`,
      });

      // Navigate to intended route or role default
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname;
      if (from && from !== '/login') {
        navigate(from, { replace: true });
      } else {
        const destination = {
          EMPLOYEE: '/employee',
          TECHNICIAN: '/technician',
          ADMIN: '/admin',
        }[user.role] || '/';
        navigate(destination, { replace: true });
      }
    } catch (err: unknown) {
      let errorMessage = err instanceof Error ? err.message : 'Invalid credentials. Please verify your username and password.';
      if (errorMessage.includes('Cannot connect to backend server')) {
        errorMessage = 'Backend is initializing on port 8080. Please wait a few seconds and try again.';
      }
      showToast({
        type: 'error',
        title: 'Login Failed',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setQuickAccount = (username: string) => {
    setValue('username', username, { shouldValidate: true });
    setValue('password', 'password123', { shouldValidate: true });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row app-royal-bg">
      {/* Left: Dark Royal Blue Brand Showcase Panel */}
      <div className="md:w-1/2 app-royal-bg text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-brand-pink/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-azure/30 blur-3xl rounded-full pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 group focus:outline-none">
            <div className="w-9 h-9 rounded-xl bg-brand-pink flex items-center justify-center shadow-pink group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-brand-deep fill-brand-deep" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Resolvo
            </span>
          </Link>
        </div>

        {/* Center Presentation Copy */}
        <div className="my-10 relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-semibold mb-4 text-brand-pink">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Enterprise Portal</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Seamless IT Incident Management
          </h2>
          <p className="mt-3 text-slate-200 text-sm sm:text-base leading-relaxed">
            Log in to manage incident resolution workflows, monitor real-time SLA countdowns, and maintain 99.8% operational availability.
          </p>

          {/* Quick Credential Badges */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              One-Click Test Account Fill:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setQuickAccount('emp_john')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold glass-pill hover:bg-white/20 transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-brand-pink" />
                Employee (John)
              </button>
              <button
                type="button"
                onClick={() => setQuickAccount('tech_alice')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold glass-pill hover:bg-white/20 transition-all cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 text-brand-cyan" />
                Technician (Alice)
              </button>
              <button
                type="button"
                onClick={() => setQuickAccount('admin')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold glass-pill hover:bg-white/20 transition-all cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                Admin
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Default password: <code className="text-brand-pink font-bold">password123</code></p>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-400">
          CS F213 / MAC F212 Object-Oriented Programming Project
        </div>
      </div>

      {/* Right: Crisp Form Panel */}
      <div className="md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sign In to Your Account
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Enter your enterprise credentials to access your dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Username"
            labelClassName="text-slate-200"
            placeholder="e.g. emp_john or admin"
            {...register('username')}
            error={errors.username?.message}
            required
          />

          <div className="relative">
            <Input
              label="Password"
              labelClassName="text-slate-200"
              type={showPassword ? 'text' : 'password'}
              placeholder="************"
              {...register('password')}
              error={errors.password?.message}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full text-base font-bold"
            >
              Sign In to Portal
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-slate-300">
          <span>Don't have an enterprise account? </span>
          <Link to="/register" className="font-bold text-brand-pink hover:text-brand-pink-hover hover:underline">
            Register new user →
          </Link>
        </div>
      </div>
    </div>
  );
};
