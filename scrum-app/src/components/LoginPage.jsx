import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { checkRateLimit, formatLockoutTime } from '../auth/rateLimiter';
import { Eye, EyeOff, Zap, Lock, User, AlertTriangle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

const LoginPage = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lockoutSeconds, setLockoutSeconds] = useState(0);
    const [remainingAttempts, setRemainingAttempts] = useState(5);

    const lockoutTimerRef = useRef(null);
    const usernameRef = useRef(null);

    // Focus username on mount
    useEffect(() => {
        usernameRef.current?.focus();
    }, []);

    // Check rate limit on mount
    useEffect(() => {
        const check = checkRateLimit();
        if (!check.allowed && check.lockoutSeconds > 0) {
            setLockoutSeconds(check.lockoutSeconds);
            setRemainingAttempts(0);
        } else {
            setRemainingAttempts(check.remainingAttempts);
        }
    }, []);

    // Lockout countdown
    useEffect(() => {
        if (lockoutSeconds > 0) {
            lockoutTimerRef.current = setInterval(() => {
                setLockoutSeconds(prev => {
                    if (prev <= 1) {
                        clearInterval(lockoutTimerRef.current);
                        setError('');
                        const check = checkRateLimit();
                        setRemainingAttempts(check.remainingAttempts);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (lockoutTimerRef.current) clearInterval(lockoutTimerRef.current);
        };
    }, [lockoutSeconds]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (lockoutSeconds > 0) return;
        if (!username.trim()) {
            setError('Please enter your username');
            return;
        }
        if (!password) {
            setError('Please enter your password');
            return;
        }

        setIsLoading(true);
        setError('');

        // Small delay for UX (prevents flashing)
        await new Promise(r => setTimeout(r, 400));

        const result = await login(username, password, rememberMe);

        if (!result.success) {
            setError(result.error);
            if (result.lockoutSeconds > 0) {
                setLockoutSeconds(result.lockoutSeconds);
            }
            if (result.remainingAttempts !== undefined) {
                setRemainingAttempts(result.remainingAttempts);
            }
        }

        setIsLoading(false);
    };

    const inputClass = "w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/30 transition-all duration-200";

    return (
        <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl" style={{ animationDelay: '4s' }} />
            </div>

            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Login card */}
            <div className="relative z-10 w-full max-w-[420px] login-fade-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 mx-auto mb-4 login-logo-glow">
                        <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">ScrumPro</h1>
                    <p className="text-sm text-slate-500 mt-1">Daily Stand-up Tracker</p>
                </div>

                {/* Card */}
                <div className="glass-card p-8 shadow-2xl shadow-black/40">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-white">Welcome back</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Sign in to continue to your dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div className="relative">
                            <User className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
                            <input
                                ref={usernameRef}
                                type="text"
                                value={username}
                                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                placeholder="Username"
                                className={inputClass}
                                disabled={isLoading || lockoutSeconds > 0}
                                autoComplete="username"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                placeholder="Password"
                                className={clsx(inputClass, "pr-11")}
                                disabled={isLoading || lockoutSeconds > 0}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors z-10"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div
                                    onClick={() => setRememberMe(!rememberMe)}
                                    className={clsx(
                                        "w-4 h-4 rounded border transition-all cursor-pointer flex items-center justify-center",
                                        rememberMe
                                            ? "bg-blue-600 border-blue-600"
                                            : "border-white/[0.15] hover:border-white/[0.25]"
                                    )}
                                >
                                    {rememberMe && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors select-none">
                                    Remember me
                                </span>
                            </label>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs text-rose-300 font-medium">{error}</p>
                                    {lockoutSeconds > 0 && (
                                        <p className="text-[11px] text-rose-400/70 mt-1">
                                            Locked for: <span className="font-mono font-bold text-rose-300">{formatLockoutTime(lockoutSeconds)}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Remaining attempts warning */}
                        {remainingAttempts > 0 && remainingAttempts < 3 && !error && (
                            <p className="text-[11px] text-amber-400/80 text-center">
                                {remainingAttempts} login attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading || lockoutSeconds > 0}
                            className="w-full py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Authenticating...
                                </>
                            ) : lockoutSeconds > 0 ? (
                                `Locked — ${formatLockoutTime(lockoutSeconds)}`
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Security badge */}
                    <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-center gap-2">
                        <Lock className="w-3 h-3 text-emerald-500/60" />
                        <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">
                            SHA-256 Encrypted • Session Protected
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-[11px] text-slate-600 mt-6">
                    ScrumPro v1.0 • Built for daily stand-ups
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
