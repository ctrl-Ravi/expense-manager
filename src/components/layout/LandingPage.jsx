import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';

export default function LandingPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 font-sans selection:bg-blue-500 selection:text-white">
            {/* Floating Navbar - Fixed & Responsive */}
            <nav className="fixed top-4 left-0 right-0 z-50 px-4 md:px-0 flex justify-center">
                <div className="w-full max-w-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl md:rounded-full shadow-lg shadow-black/5 px-6 py-3 transition-all duration-300">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            {/* Black Theme Logo */}
                            <div className="w-9 h-9 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-gray-900 font-bold text-lg shadow-lg transform -rotate-3">E</div>
                            <span className="font-bold text-gray-900 dark:text-white tracking-tight hidden xs:block">ExpenseManager</span>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4">
                            <ThemeToggle />
                            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
                            {currentUser ? (
                                <Link to="/dashboard" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform">
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-3">
                                        Log In
                                    </Link>
                                    <Link to="/register" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform shadow-md">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">

                {/* Clean Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/20 dark:to-transparent -z-10 blur-3xl opacity-60 pointer-events-none"></div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold mb-8 uppercase tracking-wider border border-blue-100 dark:border-blue-800">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    New Version 1.0
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter mb-6 leading-[1.1]">
                    Split bills. <br />
                    <span className="text-gray-400 dark:text-gray-600">Not friendships.</span>
                </h1>

                <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                    Keep track of money with friends and split expenses easily, split travel costs, and settle up with friends. No spreadsheets, no awkward math.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-20 z-10 relative">
                    {currentUser ? (
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold text-lg transition-all shadow-xl hover:-translate-y-1"
                        >
                            Go to Dashboard
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/register')}
                            className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold text-lg transition-all shadow-xl hover:-translate-y-1"
                        >
                            Get Started for Free
                        </button>
                    )}
                </div>

                {/* Organic UI Visual - Live Receipt Card */}
                <div className="relative w-full max-w-md mx-auto perspective-1000">
                    <div className="absolute top-0 left-10 w-full h-full bg-blue-600/10 dark:bg-blue-500/10 rounded-[2rem] transform rotate-3 -z-10 blur-xl"></div>

                    {/* Main Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-700 p-8 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                        <div className="flex justify-between items-start mb-8">
                            <div className="text-left">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Trip to Paris 🇫🇷</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Oct 25 • You, Alice, Bob</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-2xl">🗼</div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { title: "Hotel Booking", cost: "₹450.00", payer: "You paid", color: "text-green-500", icon: "🏨" },
                                { title: "Dinner Expenses", cost: "₹1250.00", payer: "Alice paid", color: "text-gray-500 dark:text-gray-400", icon: "🍷" },
                                { title: "Travel Expenses", cost: "₹35.00", payer: "Bob paid", color: "text-gray-500 dark:text-gray-400", icon: "🚕" }
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-default">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-sm">{item.icon}</div>
                                        <span className="font-bold text-gray-700 dark:text-gray-200">{item.title}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900 dark:text-white">{item.cost}</div>
                                        <div className={`text-xs ${item.color} font-bold`}>{item.payer}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 border-dashed">
                            <div className="flex justify-between items-center">
                                <div className="text-left">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Your split</p>
                                    <p className="text-2xl font-black text-green-500">+ ₹205.00</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">₹1735.00</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Extended Features Grid */}
            <section className="py-24 bg-gray-50 dark:bg-gray-900 border-t border-gray-200/50 dark:border-gray-800/50 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">Everything you need</h2>
                        <p className="text-xl text-gray-500 dark:text-gray-400">Packed with powerful features to manage your shared expenses.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: "💸",
                                title: "Friend Lending",
                                desc: "Track who owes you and who you owe with a simple, intuitive interface."
                            },
                            {
                                icon: "🌍",
                                title: "Multi-Currency",
                                desc: "Support for 25+ currencies including INR, USD, EUR. Global expense tracking made easy."
                            },
                            {
                                icon: "🌓",
                                title: "Dark Mode",
                                desc: "Beautifully designed dark theme that's easy on your eyes, day or night."
                            },
                            {
                                icon: "⚡",
                                title: "Real-time Sync",
                                desc: "Instant updates across devices. Never miss a transaction."
                            },
                            {
                                icon: "🔒",
                                title: "Secure & Private",
                                desc: "Your data is encrypted and secure with enterprise-grade authentication."
                            },
                            {
                                icon: "📱",
                                title: "Mobile First",
                                desc: "Responsive design that works perfectly on your phone, tablet, or desktop."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="group bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Roadmap Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest text-xs">THE FUTURE</span>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white mt-4 mb-4">Coming Soon</h2>
                </div>

                <div className="space-y-8">
                    <div className="group relative overflow-hidden rounded-[2.5rem] shadow-2xl cursor-default">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 transition-transform duration-500 group-hover:scale-105"></div>
                        <div className="relative p-10 md:p-14 text-white flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-6 border border-white/30 tracking-wider uppercase">Next Major Update</div>
                                <h3 className="text-3xl md:text-4xl font-black mb-4">Group Expense Splitting</h3>
                                <p className="text-indigo-100 text-lg leading-relaxed max-w-xl">Plan trips, share house bills, and split expenses with groups. The ultimate way to manage shared costs with multiple people without the headache.</p>
                            </div>
                            <div className="text-8xl transform group-hover:rotate-12 transition-transform duration-500 filter drop-shadow-lg">
                                <span role="img" aria-label="rocket">🚀</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors group cursor-default">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="font-bold text-gray-900 dark:text-white text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Unified Activity Feed</h3>
                                <span className="text-[10px] font-bold text-gray-400 border border-gray-200 dark:border-gray-600 px-3 py-1 rounded-full uppercase tracking-wider">Planned</span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">See all your friend and group activities in one single, intelligent, and interactive feed.</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800 transition-colors group cursor-default">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="font-bold text-gray-900 dark:text-white text-xl group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Smart Analytics</h3>
                                <span className="text-[10px] font-bold text-gray-400 border border-gray-200 dark:border-gray-600 px-3 py-1 rounded-full uppercase tracking-wider">Planned</span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Visual charts and insights into your spending habits and lending patterns to help you save.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <span className="font-bold text-gray-900 dark:text-white">ExpenseManager</span>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                        &copy; 2026. Simple for friends.
                    </div>
                </div>
            </footer>
        </div>
    );
}
