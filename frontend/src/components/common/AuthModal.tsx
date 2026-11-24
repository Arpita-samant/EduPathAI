import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AiOrb } from './AiOrb';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, register, loginDemo } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        if (!fullName.trim()) throw new Error('Please enter your full name.');
        await register(email, password, fullName);
      } else {
        await login(email, password);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginDemo();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize demo student profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17191C]/25 backdrop-blur-xs">
      <div className="bg-white rounded-[24px] max-w-md w-full border border-[#E4E5E9] shadow-modal overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-7">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <AiOrb size="sm" pulse={true} />
              <div>
                <h2 className="text-xl font-normal text-[#17191C] tracking-tight">
                  {isRegister ? 'Create Your Account' : 'Welcome to Workspace'}
                </h2>
                <p className="text-[13px] text-[#6F7782] mt-0.5 font-normal">
                  {isRegister
                    ? 'Start closing skill gaps with verified AI guidance'
                    : 'Sign in to access your adaptive roadmap and live roles'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#6F7782] hover:text-[#17191C] rounded-xl hover:bg-[#F9F9FB] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1-Click Demo Profile Button */}
          <button
            type="button"
            onClick={handleDemoClick}
            disabled={loading}
            className="w-full mb-5 flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl text-[13px] font-medium bg-gradient-to-r from-[#536C8A]/10 via-[#C7B5D9]/15 to-[#A8B9D0]/10 text-[#193D50] border border-[#C7B5D9]/40 hover:border-[#C7B5D9] transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#536C8A]" />
            <span>Try 1-Click Demo Workspace (No Signup Required)</span>
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E4E5E9]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-[#6F7782] font-normal">
                or continue with email
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-[#C84C4C] border border-red-100 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="block text-[12px] font-medium text-[#17191C] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E4E5E9] text-[14px] text-[#17191C] placeholder:text-[#6F7782]/60 focus:border-[#536C8A] focus:ring-1 focus:ring-[#536C8A] outline-none transition"
                />
              </div>
            )}

            <div>
              <label className="block text-[12px] font-medium text-[#17191C] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E4E5E9] text-[14px] text-[#17191C] placeholder:text-[#6F7782]/60 focus:border-[#536C8A] focus:ring-1 focus:ring-[#536C8A] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#17191C] mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E4E5E9] text-[14px] text-[#17191C] placeholder:text-[#6F7782]/60 focus:border-[#536C8A] focus:ring-1 focus:ring-[#536C8A] outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-[#536C8A] hover:bg-[#435872] text-white text-[14px] font-medium transition shadow-soft flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Processing...' : isRegister ? 'Create Workspace Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-[13px] text-[#6F7782] hover:text-[#17191C] transition cursor-pointer"
            >
              {isRegister
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
