import React, { useState } from "react";
import { login, loginWithGoogle } from "../../services/authService";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../common/ThemeToggle";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError("");
            setLoading(true);
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError("Failed to log in: " + err.message);
        }
        setLoading(false);
    }

    async function handleGoogleLogin() {
        try {
            setError("");
            await loginWithGoogle();
            navigate("/dashboard");
        } catch (err) {
            setError("Failed to log in with Google: " + err.message);
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Brand Sidebar - Matching Register Page (Black/Dark Theme) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-900 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
                <div className="relative z-10 text-center px-10">
                    <h1 className="text-5xl font-black text-white mb-6">Welcome Back.</h1>
                    <p className="text-gray-400 text-xl max-w-md mx-auto">
                        Manage your debts, track shared expenses, and keep your friendships free of awkward money conversations.
                    </p>
                </div>
                {/* Decor */}
                <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
            </div>

            {/* Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 relative">
                {/* Header (Logo + Theme Toggle) */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">E</div>
                        <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">ExpenseManager</span>
                    </Link>
                    <ThemeToggle />
                </div>

                <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 mt-16 lg:mt-0">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Sign In</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Enter your credentials to access your account</p>
                    </div>

                    {error && <div className="p-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">⚠️ {error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Password</label>
                                <a href="#" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold transition-colors">Forgot?</a>
                            </div>
                            <input
                                type="password"
                                className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
                            {loading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full py-3 border border-gray-200 dark:border-gray-700 rounded-xl flex justify-center items-center gap-3 text-gray-700 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <img className="w-5 h-5" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo" />
                        Google
                    </button>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Don't have an account? <Link to="/register" className="text-gray-900 dark:text-white font-bold hover:underline">Sign up for free</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
