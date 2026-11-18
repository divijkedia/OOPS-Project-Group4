import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Shield, Sparkles, ArrowRight, UserPlus, Eye, EyeOff } from 'lucide-react';
import type { Role } from '../../types/auth';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid corporate email'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['EMPLOYEE', 'TECHNICIAN']),
  department: z.string().optional(),
  specialization: z.string().optional(),
  phone: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'EMPLOYEE',
      department: 'Finance',
      specialization: 'DATABASE',
    },
  });

  const selectedRole: Role = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerAuth({
        role: data.role,
        username: data.username,
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        department: data.role === 'EMPLOYEE' ? data.department : undefined,
        specialization: data.role === 'TECHNICIAN' ? data.specialization : undefined,
      });

      showToast({
        type: 'success',
        title: 'Registration Successful',
        message: 'Account created! You may now sign in with your credentials.',
      });
      navigate(`/login?user=${data.username}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Username or email may already be taken.';
      showToast({
        type: 'error',
        title: 'Registration Failed',
        message: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row app-royal-bg">
      {/* Left: Brand Presentation Panel */}
      <div className="md:w-1/2 app-royal-bg text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
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

        <div className="my-10 relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-semibold mb-4 text-brand-pink">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join Enterprise Operations</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Register New Enterprise Member
          </h2>
          <p className="mt-3 text-slate-200 text-sm sm:text-base leading-relaxed">
            Create an Employee account to report disruptions or a Technician account to resolve enterprise tickets.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          CS F213 / MAC F212 OOP Course Project
        </div>
      </div>

      {/* Right: Registration Form Panel */}
      <div className="md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center max-w-lg mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create an Account
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Fill in your operational profile details below.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              labelClassName="text-slate-200"
              placeholder="e.g. Sarah Connor"
              {...register('fullName')}
              error={errors.fullName?.message}
              required
            />
            <Input
              label="Username"
              labelClassName="text-slate-200"
              placeholder="e.g. emp_sarah"
              {...register('username')}
              error={errors.username?.message}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Corporate Email"
              labelClassName="text-slate-200"
              type="email"
              placeholder="sarah@enterprise.com"
              {...register('email')}
              error={errors.email?.message}
              required
            />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Operational Role"
              labelClassName="text-slate-200"
              {...register('role')}
              options={[
                { label: 'Employee (Report & Track)', value: 'EMPLOYEE' },
                { label: 'Technician (Investigate & Resolve)', value: 'TECHNICIAN' },
              ]}
              required
            />

            {selectedRole === 'EMPLOYEE' ? (
              <Input
                label="Department"
                labelClassName="text-slate-200"
                placeholder="Finance, HR, Legal..."
                {...register('department')}
                error={errors.department?.message}
              />
            ) : (
              <Select
                label="Domain Specialization"
                labelClassName="text-slate-200"
                {...register('specialization')}
                options={[
                  { label: 'Database & Caches', value: 'DATABASE' },
                  { label: 'Networks & Routing', value: 'NETWORK' },
                  { label: 'Cloud Infrastructure', value: 'CLOUD' },
                  { label: 'Security & IAM', value: 'SECURITY' },
                  { label: 'Software & APIs', value: 'SOFTWARE' },
                ]}
              />
            )}
          </div>

          <Input
            label="Phone Number (Optional)"
            labelClassName="text-slate-200"
            placeholder="+1 (555) 000-0000"
            {...register('phone')}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              leftIcon={<UserPlus className="w-4 h-4" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full text-base font-bold"
            >
              Complete Registration
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-slate-300">
          <span>Already have an account? </span>
          <Link to="/login" className="font-bold text-brand-pink hover:text-brand-pink-hover hover:underline">
            Sign in here →
          </Link>
        </div>
      </div>
    </div>
  );
};
