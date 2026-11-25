import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AiOrb } from './AiOrb';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  onClose,
  onSuccess
}) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(initialMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRegister(initialMode === 'signup');
      setError(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!cleanPassword) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        if (!fullName.trim()) throw new Error('Please enter your full name.');
        await register(cleanEmail, cleanPassword, fullName.trim());
      } else {
        await login(cleanEmail, cleanPassword);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17191C]/35 backdrop-blur-xs">
      <div className="bg-white rounded-[24px] max-w-md w-full border border-[#E4E5E9] shadow-modal overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 sm:p-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <AiOrb size="sm" pulse={true} />
              <div>
                <h2 className="text-xl font-normal text-[#17191C] tracking-tight">
                  {isRegister ? 'Create Your Account' : 'Sign In to Workspace'}
                </h2>
                <p className="text-[13px] text-[#6F7782] mt-0.5 font-normal">
                  {isRegister
                    ? 'Start closing skill gaps with verified AI guidance'
                    : 'Access your verified skills, roadmap, and live roles'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#6F7782] hover:text-[#17191C] rounded-xl hover:bg-[#F9F9FB] transition cursor-pointer"
              aria-label="Close auth modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-[#F9F9FB] p-1 border border-[#E4E5E9] mb-4">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                !isRegister
                  ? 'bg-white text-[#17191C] shadow-soft border border-[#E4E5E9]'
                  : 'text-[#6F7782] hover:text-[#17191C]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                isRegister
                  ? 'bg-white text-[#17191C] shadow-soft border border-[#E4E5E9]'
                  : 'text-[#6F7782] hover:text-[#17191C]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message with Quick Action */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-[#C84C4C] border border-red-100 text-xs space-y-1.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              {error.includes('No account found') && (
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setError(null);
                  }}
                  className="text-xs font-medium text-[#536C8A] underline hover:text-[#193D50] ml-6 block cursor-pointer"
                >
                  Click here to switch to Create Account →
                </button>
              )}
              {error.includes('already exists') && (
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError(null);
                  }}
                  className="text-xs font-medium text-[#536C8A] underline hover:text-[#193D50] ml-6 block cursor-pointer"
                >
                  Click here to switch to Sign In →
                </button>
              )}
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
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E4E5E9] text-[14px] text-[#17191C] placeholder:text-[#6F7782]/60 focus:border-[#536C8A] focus:ring-1 focus:ring-[#536C8A] outline-none transition bg-white"
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
                className="w-full px-4 py-2.5 rounded-xl border border-[#E4E5E9] text-[14px] text-[#17191C] placeholder:text-[#6F7782]/60 focus:border-[#536C8A] focus:ring-1 focus:ring-[#536C8A] outline-none transition bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[12px] font-medium text-[#17191C]">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E4E5E9] text-[14px] text-[#17191C] placeholder:text-[#6F7782]/60 focus:border-[#536C8A] focus:ring-1 focus:ring-[#536C8A] outline-none transition bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-[#536C8A] hover:bg-[#435872] text-white text-[14px] font-medium transition shadow-soft flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : isRegister ? 'Create Workspace Account' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Bottom helper */}
          <div className="mt-4 pt-3 border-t border-[#E4E5E9]/60 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs text-[#6F7782] hover:text-[#17191C] transition cursor-pointer"
            >
              {isRegister
                ? 'Already have an account? Sign In'
                : "Don't have an account yet? Create Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
