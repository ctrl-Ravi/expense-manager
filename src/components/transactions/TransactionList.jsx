import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";

export default function TransactionList({ transactions, onEdit }) {
    const { currentUser } = useAuth();
    const { currency } = useSettings();

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg h-full overflow-hidden flex flex-col transition-colors">
            <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Transactions</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {transactions.length === 0 ? (
                    <p className="text-gray-500 text-center mt-4">No transactions yet.</p>
                ) : (
                    <ul className="space-y-4">
                        {transactions.map(tx => {
                            const isFromMe = tx.from === currentUser.uid;

                            return (
                                <li key={tx.id} className="flex justify-between items-start border-b dark:border-gray-700 pb-2 last:border-0 group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{tx.description}</p>
                                            {tx.editedBy && (
                                                <span className="text-[10px] text-gray-400 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-1 rounded flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                    Edited by {tx.editedBy}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {isFromMe ? "You sent" : "You received"}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(tx.timestamp).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`font-bold ${isFromMe ? 'text-green-600' : 'text-red-600'}`}>
                                            {isFromMe ? "+" : "-"} {currency}{tx.amount}
                                        </span>
                                        <button
                                            onClick={() => onEdit && onEdit(tx)}
                                            className="text-gray-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                            title="Edit Transaction"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
