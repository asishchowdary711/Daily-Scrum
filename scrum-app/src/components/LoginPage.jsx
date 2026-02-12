import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { checkRateLimit, formatLockoutTime } from '../auth/rateLimiter';
import { Eye, EyeOff, Zap, Lock, User, AlertTriangle, Loader2, Moon, Sun } from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '../theme/ThemeContext';

const LoginPage = () => {
    const { login } = useAuth();
    const { resolvedTheme, toggleTheme } = useTheme();

    const initialRate = checkRateLimit();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lockoutSeconds, setLockoutSeconds] = useState(initialRate.allowed ? 0 : initialRate.lockoutSeconds);
    const [remainingAttempts, setRemainingAttempts] = useState(initialRate.allowed ? initialRate.remainingAttempts : 0);

    const lockoutTimerRef = useRef(null);
    const usernameRef = useRef(null);

    useEffect(() => {
        usernameRef.current?.focus();
    }, []);

    useEffect(() => {
        if (lockoutSeconds <= 0) return undefined;

        lockoutTimerRef.current = setInterval(() => {
            setLockoutSeconds((prev) => {
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

        await new Promise(r => setTimeout(r, 280));

        const result = await login(username, password, rememberMe);

        if (!result.success) {
            setError(result.error);
            if (result.lockoutSeconds > 0) setLockoutSeconds(result.lockoutSeconds);
            if (result.remainingAttempts !== undefined) setRemainingAttempts(result.remainingAttempts);
        }

        setIsLoading(false);
    };

    const inputClass = 'input-base w-full pl-11 pr-4 py-3.5 rounded-xl text-sm';

    return (
        <div className="min-h-screen bg-app flex items-center justify-center p-4 relative overflow-hidden">
            <button
                onClick={toggleTheme}
                className="icon-btn absolute top-5 right-5 p-2 rounded-lg z-20"
                title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            >
                {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'var(--primary-soft)' }} />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'color-mix(in oklab, var(--primary) 18%, transparent)' }} />
            </div>

            <div
                className="absolute inset-0 opacity-[0.035]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(120,130,150,.32) 1px, transparent 1px), linear-gradient(90deg, rgba(120,130,150,.32) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />

            <div className="relative z-10 w-full max-w-[420px] login-fade-in">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 login-logo-glow">
                        <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-theme-primary">ScrumPro</h1>
                    <p className="text-sm mt-1 text-theme-muted">Daily Stand-up Tracker</p>
                </div>

                <div className="glass-card p-8">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-theme-primary">Welcome back</h2>
                        <p className="text-sm mt-0.5 text-theme-muted">Sign in to continue to your dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 z-10 text-theme-muted" />
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

                        <div className="relative">
                            <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 z-10 text-theme-muted" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                placeholder="Password"
                                className={clsx(inputClass, 'pr-11')}
                                disabled={isLoading || lockoutSeconds > 0}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="icon-btn absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md z-10"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group select-none">
                                <button
                                    type="button"
                                    onClick={() => setRememberMe(!rememberMe)}
                                    className={clsx(
                                        'w-4 h-4 rounded border transition-all flex items-center justify-center',
                                        rememberMe
                                            ? 'bg-[var(--primary)] border-[var(--primary)]'
                                            : 'border-theme hover:border-[var(--primary)]'
                                    )}
                                >
                                    {rememberMe && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                                <span className="text-xs text-theme-muted group-hover:text-theme-primary transition-colors">
                                    Remember me
                                </span>
                            </label>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 p-3 rounded-xl danger-soft border border-rose-400/25">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-medium">{error}</p>
                                    {lockoutSeconds > 0 && (
                                        <p className="text-[11px] mt-1 opacity-80">
                                            Locked for: <span className="font-mono font-bold">{formatLockoutTime(lockoutSeconds)}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {remainingAttempts > 0 && remainingAttempts < 3 && !error && (
                            <p className="text-[11px] text-center text-amber-600">
                                {remainingAttempts} login attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || lockoutSeconds > 0}
                            className="btn-primary w-full py-3.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Authenticating...
                                </>
                            ) : lockoutSeconds > 0 ? (
                                `Locked - ${formatLockoutTime(lockoutSeconds)}`
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-theme flex items-center justify-center gap-2">
                        <Lock className="w-3 h-3 text-emerald-500/70" />
                        <span className="text-[10px] font-medium uppercase tracking-wider text-theme-muted">
                            Session Protected
                        </span>
                    </div>
                </div>

                <p className="text-center text-[11px] mt-6 text-theme-muted">
                    ScrumPro v1.0 • Built for daily stand-ups
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
