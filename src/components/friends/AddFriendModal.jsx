import React, { useState } from "react";
import { searchUsers, sendFriendRequest } from "../../services/friendService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function AddFriendModal({ isOpen, onClose }) {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    async function handleSearch(e) {
        e.preventDefault();
        if (!searchTerm) return;
        setLoading(true);
        try {
            const results = await searchUsers(searchTerm);
            // Filter out self
            const filtered = results.filter(u => u.uid !== currentUser.uid);
            setSearchResults(filtered);
        } catch (err) {
            // console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSendRequest(userId) {
        try {
            await sendFriendRequest(currentUser.uid, {
                email: currentUser.email,
                displayName: currentUser.displayName
            }, userId);
            showToast("Request Sent!", "success");
            setSearchTerm("");
            setSearchResults([]);
            onClose();
        } catch (err) {
            // console.error(err);
            showToast("Error sending request: " + err.message, "error");
        }
    }

    function handleInvite() {
        const inviteText = `Join me on ExpenseManager! We can track our shared expenses easily.Sign up here: ${window.location.origin}/register`;
        navigator.clipboard.writeText(inviteText).then(() => {
            showToast("Invite link copied to clipboard!", "success");
        });
    }

    return (
        <div className="fixed inset-0 z-[80] flex justify-center items-center px-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md relative z-10 animate-slide-up overflow-hidden transition-colors">

                {/* Header */}
                <div className="bg-white dark:bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Add Friend</h3>
                    <button onClick={onClose} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Invite Card */}
                    <div
                        onClick={handleInvite}
                        className="bg-gray-900 dark:bg-black rounded-xl p-5 text-white shadow-lg relative overflow-hidden group hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 border border-gray-800"
                    >
                        <div className="relative z-10 flex items-center justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-lg mb-1">Invite Friends via Link</h4>
                                <p className="text-gray-400 text-xs leading-relaxed">Send a link to anyone to split bills instantly.</p>
                            </div>
                            <div className="bg-white/20 h-10 w-10 flex items-center justify-center rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                        </div>
                        {/* Decorative background shapes */}
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    </div>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider">Or Search Users</span>
                        <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                    </div>

                    {/* Search Form */}
                    <div className="space-y-4">
                        <form onSubmit={handleSearch} className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="email"
                                placeholder="Enter email address..."
                                className="w-full pl-11 pr-20 py-4 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-2 bottom-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-4 rounded-xl text-xs font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 transition-colors"
                            >
                                Find
                            </button>
                        </form>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                                <span className="text-xs font-medium">Searching for user...</span>
                            </div>
                        )}

                        {/* Results */}
                        {!loading && searchResults.length > 0 && (
                            <div className="space-y-3 animate-fade-in">
                                {searchResults.map(user => (
                                    <div key={user.uid} className="flex justify-between items-center bg-white dark:bg-gray-700 p-3 rounded-2xl border border-gray-100 dark:border-gray-600 shadow-sm hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black font-bold text-sm shadow-md">
                                                {user.displayName ? user.displayName[0].toUpperCase() : "U"}
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-bold text-gray-800 dark:text-white">{user.displayName}</h5>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleSendRequest(user.uid)}
                                            className="bg-gray-900 dark:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold shadow hover:bg-black dark:hover:bg-gray-900 transition-transform active:scale-95 flex items-center gap-1.5"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                                            </svg>
                                            Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && searchResults.length === 0 && searchTerm && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>
                                <p className="text-gray-900 dark:text-gray-200 font-medium text-sm">No users found</p>
                                <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Check the email spelling and try again.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
