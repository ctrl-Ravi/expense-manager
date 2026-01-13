import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext";
import {
    subscribeToFriendRequests,
    acceptFriendRequest,
} from "../../services/friendService";

export default function FriendList({ friends = [], onSelectFriend, balances = {}, onRefresh }) {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const { currency } = useSettings();
    // removed internal friends state
    const [requests, setRequests] = useState([]);
    // removed showAddForm, searchTerm, searchResults, loading

    useEffect(() => {
        if (currentUser) {
            // loadFriends internally removed, relies on parent
            const unsub = subscribeToFriendRequests(currentUser.uid, (data) => {
                setRequests(data);
            });
            return () => unsub();
        }
    }, [currentUser]);

    // removed loadFriends
    // removed handleSearch
    // removed handleSendRequest

    async function handleAccept(request) {
        try {
            // Debugging log
            // console.log("Accepting request:", request);
            const requestId = request.id;
            const fromId = request.from;
            await acceptFriendRequest(requestId, fromId, currentUser.uid);
            showToast("Friend Accepted!", "success");
            onRefresh(); // Refresh friend list in parent
        } catch (e) {
            // console.error(e);
            showToast("Failed to accept request. " + e.message, "error");
        }
    }

    // removed handleInvite

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg h-full flex flex-col transition-colors">
            <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Friends</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {/* Friend Requests Section */}
                {requests.length > 0 && (
                    <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
                        <h4 className="text-xs font-bold text-yellow-800 dark:text-yellow-500 uppercase tracking-wide mb-2">Friend Requests</h4>
                        <ul className="space-y-2">
                            {requests.map(req => (
                                <li key={req.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{req.senderName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{req.senderEmail}</p>
                                    </div>
                                    <button
                                        onClick={() => handleAccept(req)}
                                        className="text-xs bg-black dark:bg-white text-white dark:text-gray-900 px-2 py-1 rounded hover:bg-gray-800 dark:hover:bg-gray-200 font-bold"
                                    >
                                        Accept
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <ul className="space-y-3">
                    {friends.map(friend => {
                        const balance = balances[friend.uid] || 0;
                        return (
                            <li
                                key={friend.uid}
                                className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded cursor-pointer group transition-colors"
                                onClick={() => onSelectFriend && onSelectFriend(friend)}
                            >
                                <div className="flex items-center flex-1">
                                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-900 dark:text-white font-bold text-xs mr-3">
                                        {friend.displayName ? friend.displayName[0].toUpperCase() : "?"}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{friend.displayName}</p>
                                            {friend.isPending && (
                                                <span className="text-[10px] bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-800">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{friend.email}</p>
                                    </div>
                                </div>
                                <div className="text-right ml-2">
                                    {Math.abs(balance) > 0.01 && (
                                        <span className={`text-xs font-bold ${balance > 0 ? "text-green-600" : "text-red-500"}`}>
                                            {balance > 0 ? "+" : "-"}{currency}{Math.abs(balance).toFixed(0)}
                                        </span>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                    {friends.length === 0 && <p className="text-sm text-gray-500 text-center mt-4">No friends yet.</p>}
                </ul>
            </div>
        </div>
    );
}
