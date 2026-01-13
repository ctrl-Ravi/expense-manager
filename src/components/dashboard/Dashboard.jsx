import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { getFriends, subscribeToSentRequests, getUserProfile, searchUsers, sendFriendRequest } from "../../services/friendService";
import { subscribeToTransactions } from "../../services/transactionService";
import FriendList from "../friends/FriendList";
import TransactionList from "../transactions/TransactionList";
import TransactionForm from "../transactions/TransactionForm";
import AddFriendModal from "../friends/AddFriendModal";
import { useToast } from "../../context/ToastContext";
import ThemeToggle from "../common/ThemeToggle";
import { useSettings } from "../../context/SettingsContext";
import CurrencyModal from "../common/CurrencyModal";

export default function Dashboard() {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const { currency, setCurrency } = useSettings();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [friends, setFriends] = useState([]);
    const [pendingFriends, setPendingFriends] = useState([]); // Friends we sent requests to
    const [totalToReceive, setTotalToReceive] = useState(0);
    const [totalToPay, setTotalToPay] = useState(0);

    const [selectedFriend, setSelectedFriend] = useState(null);
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);
    const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [preSelectedFriendForTx, setPreSelectedFriendForTx] = useState(null);
    const [preSelectedType, setPreSelectedType] = useState('lend');

    // activeTab: 'friends' | 'activity' | 'profile' (Bottom Nav)
    const [activeTab, setActiveTab] = useState('friends');
    const [balanceMap, setBalanceMap] = useState({});

    // Mobile check (simple resize listener could be added, but relying on CSS hidden mostly)
    // We will just use logic: If on mobile, show ONE activeTab content.
    // If on Desktop, show Side-by-Side (Friend | Activity).

    useEffect(() => {
        if (!currentUser) return;
        loadFriends();

        // Subscribe to Transactions
        const unsubTx = subscribeToTransactions(currentUser.uid, (data) => {
            setTransactions(data);
            calculateBalance(data, currentUser.uid);
        });

        // Subscribe to Sent Requests (Pending Friends)
        const unsubSent = subscribeToSentRequests(currentUser.uid, async (requests) => {
            // Requests only have 'to' uid. Need to fetch profiles.
            // basic caching or just fetching unique IDs
            const pendingProfiles = [];
            for (const req of requests) {
                // To avoid N+1 if list is stable, we could check existing state, 
                // but for now simple fetch is safer for correctness.
                // We assume getUserProfile is fast (cached by Firestore client SDK mostly)
                if (req.to) {
                    const profile = await getUserProfile(req.to);
                    if (profile) {
                        pendingProfiles.push({ ...profile, isPending: true, requestId: req.id });
                    }
                }
            }
            setPendingFriends(pendingProfiles);
        });

        return () => {
            unsubTx();
            unsubSent();
        };
    }, [currentUser]);

    async function loadFriends() {
        if (currentUser) {
            const data = await getFriends(currentUser.uid);
            setFriends(data);
        }
    }

    async function handleAddFriendByEmail(email) {
        if (!email) return;
        try {
            // 1. Search User
            const users = await searchUsers(email);
            if (users.length === 0) {
                showToast("User not found with that email.", "error");
                return null;
            }
            const targetUser = users[0];

            // 2. Check if already friend
            if (friends.find(f => f.uid === targetUser.uid)) {
                showToast("Already your friend!", "info");
                return targetUser;
            }

            // 3. Check if we are sending to ourselves
            if (targetUser.uid === currentUser.uid) {
                showToast("You cannot add yourself.", "error");
                return null;
            }

            // 4. Send Request
            // (Function handles duplicate check internally usually, but we can try/catch)
            await sendFriendRequest(currentUser.uid, {
                email: currentUser.email,
                displayName: currentUser.displayName
            }, targetUser.uid);

            showToast("Friend Request Sent!", "success");
            return { ...targetUser, isPending: true };

            return { ...targetUser, isPending: true };
        } catch (err) {
            // console.error(err);
            showToast("Failed to add friend: " + err.message, "error");
            return null;
        }
    }

    function calculateBalance(txs, uid) {
        let total = 0;
        const balances = {};

        // Calculate balances per friend
        txs.forEach(tx => {
            let amount = parseFloat(tx.amount);
            let otherId = (tx.from === uid) ? tx.to : tx.from;
            if (!balances[otherId]) balances[otherId] = 0;

            if (tx.type === 'lend') {
                if (tx.from === uid) { balances[otherId] += amount; }
                else { balances[otherId] -= amount; }
            } else if (tx.type === 'repay') {
                if (tx.from === uid) { balances[otherId] += amount; }
                else { balances[otherId] -= amount; }
            }
        });

        // Split "To Pay" vs "To Receive"
        let toReceive = 0;
        let toPay = 0;

        Object.values(balances).forEach(val => {
            if (val > 0) toReceive += val;
            if (val < 0) toPay += Math.abs(val);
        });

        setTotalToReceive(toReceive);
        setTotalToPay(toPay);
        setBalanceMap(balances);
    }

    async function handleLogout() {
        try {
            await logout();
            navigate("/login");
        } catch (e) {
            // console.error(e);
        }
    }

    function handleFriendSelect(friend) {
        if (selectedFriend && selectedFriend.uid === friend.uid) {
            setSelectedFriend(null);
            // If deselecting, go back to friends tab on mobile? Or stay? 
            // Better to default back to friends if they toggle off.
            // But usually this toggle logic is for desktop.
        } else {
            setSelectedFriend(friend);
            // On mobile, auto-switch to transactions to see history
            setActiveTab('activity');
        }
    }

    function handleBackToFriends() {
        setSelectedFriend(null);
        setActiveTab('friends');
    }

    function handleEditTransaction(tx) {
        setEditingTransaction(tx);
        // We can pre-select the friend involved if we want, or rely on form logic
        setIsTxModalOpen(true);
    }

    function handleNewTransaction(type = 'lend') {
        setEditingTransaction(null);
        if (selectedFriend) {
            setPreSelectedFriendForTx(selectedFriend);
        } else {
            setPreSelectedFriendForTx(null);
        }
        setPreSelectedType(type);
        setIsTxModalOpen(true);
    }

    // Filter transactions
    const displayedTransactions = selectedFriend
        ? transactions.filter(t => t.from === selectedFriend.uid || t.to === selectedFriend.uid)
        : transactions;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col pb-20 md:pb-0 transition-colors duration-200">
            {/* --- Phone Header --- */}
            <header className="bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black font-bold text-lg">
                        {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : "U"}
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Hello,</p>
                        <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
                            {currentUser?.displayName || "User"}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsAddFriendOpen(true)}
                        className="bg-gray-50 dark:bg-gray-700 text-black dark:text-white p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-100 dark:border-gray-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                        </svg>
                    </button>
                </div>
            </header>

            <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6">

                {/* --- Split Balance Cards --- */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-emerald-500 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-1">To Receive</p>
                            <h2 className="text-2xl font-bold">{currency}{totalToReceive.toFixed(2)}</h2>
                        </div>
                        {/* Decorative circle */}
                        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white opacity-20 rounded-full"></div>
                    </div>

                    <div className="bg-rose-500 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-rose-100 text-xs font-semibold uppercase tracking-wider mb-1">To Pay</p>
                            <h2 className="text-2xl font-bold">{currency}{totalToPay.toFixed(2)}</h2>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white opacity-20 rounded-full"></div>
                    </div>
                </div>

                {/* --- Content Area --- */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Friends List (Visible if tab='friends' OR md:block) */}
                    <div className={`md:col-span-4 lg:col-span-4 ${activeTab === 'friends' ? 'block' : 'hidden md:block'}`}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-2 border border-blue-50 dark:border-gray-700 transition-colors">
                            <h3 className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase p-2">All Friends</h3>
                            <FriendList
                                friends={[...friends, ...pendingFriends]}
                                onSelectFriend={handleFriendSelect}
                                balances={balanceMap}
                                onRefresh={loadFriends}
                            />
                        </div>
                    </div>

                    {/* Activity List (Visible if tab='activity' OR md:block) */}
                    <div className={`
                        md:col-span-8 lg:col-span-8 
                        ${activeTab === 'activity' ? 'block' : 'hidden md:block'}
                        ${selectedFriend ? 'fixed inset-0 z-[60] bg-white dark:bg-gray-900 md:static md:bg-transparent md:z-auto' : ''}
                    `}>
                        <div className={`
                            bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-blue-50 dark:border-gray-700 min-h-[400px] flex flex-col transition-colors
                            ${selectedFriend ? 'h-full rounded-none border-none shadow-none md:rounded-xl md:border md:shadow-sm overflow-hidden' : 'p-4'}
                        `}>
                            {selectedFriend ? (
                                <div className="flex flex-col h-full relative">
                                    {/* Friend Detail Header */}
                                    <div className="sticky top-0 bg-white dark:bg-gray-800 z-20 shadow-sm transition-colors">
                                        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700">
                                            <button
                                                onClick={handleBackToFriends}
                                                className="md:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
                                                {selectedFriend.displayName}
                                            </h3>
                                        </div>

                                        {/* Status Banner */}
                                        <div className={`px-4 py-6 flex flex-col items-center justify-center border-b dark:border-gray-700 transition-colors relative overflow-hidden ${(balanceMap[selectedFriend.uid] || 0) > 0 ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20' :
                                            (balanceMap[selectedFriend.uid] || 0) < 0 ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20' : 'bg-gray-50 dark:bg-gray-800'
                                            }`}>
                                            {/* Background Pattern/Icon */}
                                            <div className="absolute opacity-5 -right-4 -bottom-4 transform rotate-12">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="currentColor" viewBox="0 0 24 24">
                                                    {(balanceMap[selectedFriend.uid] || 0) !== 0 && (
                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.15-1.46-3.27-3.4h1.96c.1 1.05 1.18 1.91 2.53 1.91 1.29 0 2.13-.73 2.13-1.65 0-1.22-1.28-1.59-2.81-2.19-2.28-.9-4.13-2.02-4.13-4.32 0-1.89 1.33-3.03 3.01-3.37V3h2.67v1.92c1.39.29 2.54 1.25 2.82 3h-1.97c-.24-1.07-1.12-1.68-2.22-1.68-1.16 0-1.99.71-1.99 1.57 0 1.2 1.54 1.63 3.19 2.29 2.12.86 3.75 2.05 3.75 4.35 0 1.84-1.35 2.86-2.92 3.33z" />
                                                    )}
                                                </svg>
                                            </div>

                                            <p className={`text-xs font-bold uppercase tracking-wider mb-2 relative z-10 ${(balanceMap[selectedFriend.uid] || 0) > 0 ? 'text-green-600' :
                                                (balanceMap[selectedFriend.uid] || 0) < 0 ? 'text-red-600' : 'text-gray-500'
                                                }`}>
                                                {(balanceMap[selectedFriend.uid] || 0) > 0 ? "You will receive" :
                                                    (balanceMap[selectedFriend.uid] || 0) < 0 ? "You need to pay" : "Settled Up"}
                                            </p>
                                            <p className={`text-4xl font-black relative z-10 tracking-tight ${(balanceMap[selectedFriend.uid] || 0) > 0 ? 'text-green-700' :
                                                (balanceMap[selectedFriend.uid] || 0) < 0 ? 'text-red-700' : 'text-gray-700'
                                                }`}>
                                                {currency}{Math.abs(balanceMap[selectedFriend.uid] || 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Scrollable Transaction History */}
                                    <div className="flex-1 overflow-y-auto p-4 pb-32">
                                        {displayedTransactions.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p>No transactions yet</p>
                                            </div>
                                        ) : (
                                            <TransactionList
                                                transactions={displayedTransactions}
                                                onEdit={handleEditTransaction}
                                            />
                                        )}
                                    </div>

                                    {/* Fixed Bottom Action Bar */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 z-20 flex gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-colors">
                                        <button
                                            onClick={() => handleNewTransaction('lend')}
                                            className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-200 active:scale-95 transition flex items-center justify-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                            <span>I Gave</span>
                                        </button>
                                        <button
                                            onClick={() => handleNewTransaction('borrow')}
                                            className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-200 active:scale-95 transition flex items-center justify-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                            <span>I Received</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-b dark:border-gray-700 mb-4">
                                    <h3 className="font-bold text-gray-800 dark:text-white">Recent Activity</h3>
                                </div>
                            )}

                            {!selectedFriend && (
                                <TransactionList
                                    transactions={displayedTransactions}
                                    onEdit={handleEditTransaction}
                                />
                            )}
                        </div>
                    </div>

                    {/* Profile/Menu Tab Content */}
                    <div className={`md:col-span-12 ${activeTab === 'profile' ? 'block' : 'hidden'}`}>
                        <div className="max-w-md mx-auto pb-8">
                            {/* Profile Header */}
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 mb-6 text-center border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-24 bg-gray-100 dark:bg-gray-700"></div>
                                <div className="relative z-10">
                                    <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl text-black dark:text-white font-bold shadow-xl border-4 border-white dark:border-gray-800">
                                        {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : "U"}
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{currentUser?.displayName}</h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">{currentUser?.email}</p>
                                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-bold border border-gray-200 dark:border-gray-600">
                                        <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse"></span>
                                        Free Plan
                                    </div>
                                </div>
                            </div>

                            {/* Menu Groups */}
                            <div className="space-y-6">
                                {/* Group 1: General */}
                                <div>
                                    <h4 className="px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">General</h4>
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700 overflow-hidden">
                                        <button
                                            onClick={() => setIsCurrencyModalOpen(true)}
                                            className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition relative group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-900 dark:text-white">
                                                <span className="font-bold text-lg">{currency}</span>
                                            </div>
                                            <div className="text-left flex-1">
                                                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">Currency</p>
                                                <p className="text-[10px] text-gray-400">Tap to change</p>
                                            </div>
                                            <div className="text-sm font-bold text-gray-600 dark:text-gray-400 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors">
                                                {currency}
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/register`);
                                                showToast("Link copied to clipboard!", "success");
                                            }}
                                            className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-900 dark:text-white">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                </svg>
                                            </div>
                                            <div className="text-left flex-1">
                                                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">Invite Friends</p>
                                                <p className="text-xs text-gray-500">Get premium features</p>
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 dark:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Group 2: App */}
                                <div>
                                    <h4 className="px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">App</h4>
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700 overflow-hidden">
                                        <button
                                            onClick={() => window.open('https://wa.me/917279062862', '_blank')}
                                            className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-900 dark:text-white">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="text-left flex-1">
                                                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">Help & Support</p>
                                                <p className="text-xs text-gray-500">Contact via WhatsApp</p>
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 dark:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        <button onClick={handleLogout} className="w-full p-4 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/10 transition group">
                                            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 group-hover:bg-white dark:group-hover:bg-red-900 transition">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                            </div>
                                            <div className="text-left flex-1">
                                                <p className="font-medium text-red-600 dark:text-red-400 text-sm">Sign Out</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mt-8">
                                <p className="text-xs text-gray-300 dark:text-gray-600">ExpenseManager v4.1.0</p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* --- Floating Action Button (FAB) --- */}
            <button
                onClick={() => handleNewTransaction('lend')}
                className="fixed bottom-24 right-6 md:bottom-10 md:right-10 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-50 transition-transform active:scale-95"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>

            {/* --- Bottom Navigation Bar (Mobile Only) --- */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-around py-2 pb-4 z-40 safe-area-bottom transition-colors">

                <button
                    onClick={() => setActiveTab('friends')}
                    className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'friends' ? 'text-black dark:text-white' : 'text-gray-400'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-[10px] font-medium">Friends</span>
                </button>

                <button
                    onClick={() => setActiveTab('activity')}
                    className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'activity' ? 'text-black dark:text-white' : 'text-gray-400'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span className="text-[10px] font-medium">Activity</span>
                </button>

                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'profile' ? 'text-black dark:text-white' : 'text-gray-400'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-[10px] font-medium">Menu</span>
                </button>

            </div>

            {/* Modal */}
            {
                isTxModalOpen && (
                    <TransactionForm
                        friend={preSelectedFriendForTx}
                        friends={[...friends, ...pendingFriends]}
                        initialType={preSelectedType}
                        initialData={editingTransaction}
                        onClose={() => setIsTxModalOpen(false)}
                        onAddFriend={handleAddFriendByEmail}
                    />
                )
            }

            <AddFriendModal
                isOpen={isAddFriendOpen}
                onClose={() => setIsAddFriendOpen(false)}
            />

            <CurrencyModal
                isOpen={isCurrencyModalOpen}
                onClose={() => setIsCurrencyModalOpen(false)}
                currentCurrency={currency}
                onSelect={setCurrency}
            />
        </div >
    );
}
