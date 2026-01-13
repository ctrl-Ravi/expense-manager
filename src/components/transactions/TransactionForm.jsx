import React, { useState, useEffect } from "react";
import { createTransaction, updateTransaction } from "../../services/transactionService";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";

export default function TransactionForm({ friend: initialFriend, friends = [], initialType = "lend", onClose, onAddFriend, initialData = null }) {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const { currency } = useSettings();

    // If editing, use initialData values
    const [amount, setAmount] = useState(initialData ? initialData.amount : "");
    const [description, setDescription] = useState(initialData ? initialData.description : "");
    const [type, setType] = useState(initialData ? initialData.type : initialType);

    // Find friend object if editing
    const getInitialFriend = () => {
        if (initialData) {
            // If I am sender, friend is receiver. If I am receiver, friend is sender.
            // Wait, this depends on how we stored it.
            // Store: from, to.
            // If from === me, friend is to.
            // If to === me, friend is from.
            const friendId = initialData.from === currentUser.uid ? initialData.to : initialData.from;
            return friends.find(f => f.uid === friendId) || null;
        }
        return initialFriend;
    };

    const [selectedFriend, setSelectedFriend] = useState(getInitialFriend());

    // Sync state if initialData changes (handling potential remount issues or prop updates)
    useEffect(() => {
        if (initialData) {
            setAmount(initialData.amount);
            setDescription(initialData.description);
            setType(initialData.type);
            const friendId = initialData.from === currentUser.uid ? initialData.to : initialData.from;
            const friend = friends.find(f => f.uid === friendId);
            if (friend) setSelectedFriend(friend);
        } else {
            // Reset if switching to new mode (though usually unmounts)
            setAmount("");
            setDescription("");
            setType(initialType);
            setSelectedFriend(initialFriend);
        }
    }, [initialData, currentUser, friends, initialFriend, initialType]);

    // Add Friend Mode
    const [isAddingFriend, setIsAddingFriend] = useState(false);
    const [newFriendEmail, setNewFriendEmail] = useState("");
    const [addingLoading, setAddingLoading] = useState(false);

    const [loading, setLoading] = useState(false);
    const isEditMode = !!initialData;

    // If friend is passed or we are editing, we lock it. If not, we allow selection.
    const isFriendLocked = !!initialFriend || isEditMode;

    async function handleSubmit(e) {
        e.preventDefault();
        if (!amount || !description || !selectedFriend) {
            showToast("Please fill in all fields", "error");
            return;
        }

        setLoading(true);
        try {
            let fromId, toId;
            if (type === 'lend' || type === 'repay') {
                fromId = currentUser.uid;
                toId = selectedFriend.uid;
            } else { // borrow
                fromId = selectedFriend.uid;
                toId = currentUser.uid;
            }

            if (isEditMode) {
                await updateTransaction(initialData.id, {
                    amount: parseFloat(amount), // Ensure amount is a number
                    description,
                    type,
                    from: fromId,
                    to: toId
                }, currentUser.uid, currentUser.displayName);

                showToast("Transaction updated!", "success");
            } else {
                await createTransaction(fromId, toId, parseFloat(amount), description, type); // Ensure amount is a number
                showToast("Transaction saved!", "success");
            }
            onClose();
        } catch (error) {
            // console.error(error);
            showToast("Failed to save transaction: " + error.message, "error");
        } finally {
            setLoading(false);
        }
    }

    async function handleAddFriendSubmit(e) {
        e.preventDefault();
        if (!newFriendEmail) return;
        setAddingLoading(true);
        try {
            const newFriend = await onAddFriend(newFriendEmail);
            if (newFriend) {
                // Success
                setSelectedFriend(newFriend);
                setIsAddingFriend(false);
                setNewFriendEmail("");
            }
        } catch (error) {
            // console.error(error);
            showToast("Failed to add friend: " + error.message, "error");
        }
        setAddingLoading(false);
    }

    return (
        <div className="fixed inset-0 z-[70] flex justify-center items-end md:items-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal/Sheet Container */}
            <div className="bg-white dark:bg-gray-800 px-6 py-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] w-full md:w-[480px] md:rounded-2xl relative z-10 transform transition-transform duration-300 ease-out transition-colors">

                {/* Drag Handle (Mobile Visual) */}
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 md:hidden"></div>

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {isEditMode ? "Edit Transaction" : (isFriendLocked && selectedFriend ? "With " + selectedFriend.displayName : "New Transaction")}
                    </h3>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>

                    {/* Edit Mode: Locked Friend Display */
                        isEditMode && selectedFriend ? (
                            <div className="mb-8 flex flex-col items-center">
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Transaction with</span>
                                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-5 py-3 rounded-2xl shadow-sm transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold shadow-md">
                                        {selectedFriend.displayName?.[0]?.toUpperCase() || "?"}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-white text-lg leading-tight">{selectedFriend.displayName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-300">{selectedFriend.email}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            !isFriendLocked && (
                                <div className="mb-6">
                                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Who is this with?</label>

                                    {isAddingFriend ? (
                                        <div className="animate-slide-up bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
                                            <div className="bg-white rounded-xl p-3">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h4 className="font-bold text-gray-900 dark:text-gray-800 text-sm">
                                                        Add New Friend
                                                    </h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsAddingFriend(false)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-full p-1 border border-gray-100"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="flex gap-2 relative">
                                                    <div className="relative flex-1">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <input
                                                            type="email"
                                                            value={newFriendEmail}
                                                            onChange={e => setNewFriendEmail(e.target.value)}
                                                            placeholder="Enter email address"
                                                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleAddFriendSubmit}
                                                        disabled={addingLoading || !newFriendEmail}
                                                        className="bg-gray-900 dark:bg-black text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {addingLoading ? (
                                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            "Add"
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide snap-x">
                                            {/* ADD BUTTON */}
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingFriend(true)}
                                                className="relative flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-white hover:border-gray-400 transition-all min-w-[72px] snap-center group"
                                            >
                                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 group-hover:text-gray-600 bg-white border border-gray-200 shadow-sm">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-600 truncate max-w-[64px] leading-tight">
                                                    Add New
                                                </span>
                                            </button>

                                            {friends.map(f => {
                                                const isSelected = selectedFriend?.uid === f.uid;
                                                return (
                                                    <button
                                                        key={f.uid}
                                                        type="button"
                                                        onClick={() => setSelectedFriend(f)}
                                                        className={`relative flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all min-w-[72px] snap-center ${isSelected
                                                            ? 'border-gray-900 dark:border-white bg-gray-100 dark:bg-gray-700 transform scale-105'
                                                            : 'border-gray-100 bg-gray-50 hover:border-gray-200 opacity-80 hover:opacity-100'
                                                            }`}
                                                    >
                                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm relative ${isSelected
                                                            ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                                                            : 'bg-white text-gray-500 border border-gray-100'
                                                            }`}>
                                                            {f.displayName ? f.displayName[0].toUpperCase() : "?"}
                                                            {/* Pending Indicator */}
                                                            {f.isPending && (
                                                                <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] border border-white">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className={`text-[10px] font-bold truncate max-w-[64px] leading-tight ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600'
                                                            }`}>
                                                            {f.displayName.split(' ')[0]}
                                                        </span>
                                                        {isSelected && (
                                                            <div className="absolute top-1 right-1 text-white dark:text-black bg-gray-900 dark:bg-white rounded-full z-10">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        )}

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button
                            type="button"
                            onClick={() => setType('lend')}
                            className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center transition-all active:scale-95 ${type === 'lend'
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-md shadow-red-100 dark:shadow-none'
                                : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:border-gray-200 dark:hover:border-gray-600'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${type === 'lend' ? 'bg-red-200 dark:bg-red-900/40' : 'bg-gray-100 dark:bg-gray-700'
                                }`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </div>
                            <span className="font-bold">I Sent</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('borrow')}
                            className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center transition-all active:scale-95 ${type === 'borrow'
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 shadow-md shadow-green-100 dark:shadow-none'
                                : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:border-gray-200 dark:hover:border-gray-600'
                                }`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${type === 'borrow' ? 'bg-green-200 dark:bg-green-900/40' : 'bg-gray-100 dark:bg-gray-700'
                                }`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            </div>
                            <span className="font-bold">I Received</span>
                        </button>
                    </div>

                    <div className="mb-8 relative">
                        <label className="block text-center text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Amount</label>
                        <div className="relative max-w-[200px] mx-auto">
                            <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-3xl font-bold text-gray-300 dark:text-gray-600">{currency}</span>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full text-center text-5xl font-black text-gray-800 dark:text-white bg-transparent border-none focus:ring-0 placeholder-gray-200 dark:placeholder-gray-700 p-2"
                                placeholder="0"
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-8">
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full text-center text-lg bg-gray-50 dark:bg-gray-700 dark:text-white border-transparent rounded-xl py-3 focus:bg-white dark:focus:bg-gray-600 focus:border-gray-900 dark:focus:border-white focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-500 transition-all font-medium placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Add a note (e.g. Dinner)"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !selectedFriend}
                        className={`w-full py-4 text-white text-lg font-bold rounded-2xl shadow-xl transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${type === 'lend' ? 'bg-red-600 shadow-red-200 hover:bg-red-700' : 'bg-green-600 shadow-green-200 hover:bg-green-700'
                            }`}
                    >
                        {loading ? (
                            <span>{isEditMode ? "Updating..." : "Saving..."}</span>
                        ) : (
                            <>
                                <span>{isEditMode ? "Update Transaction" : "Save Transaction"}</span>
                                {isEditMode ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full mt-4 py-3 text-gray-400 font-bold hover:text-gray-600 transition"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}
