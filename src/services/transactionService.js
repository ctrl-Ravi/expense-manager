import { db } from "./firebase";
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    or,
    doc,
    updateDoc
} from "firebase/firestore";

export async function createTransaction(fromId, toId, amount, description, type = "lend") {
    // type: 'lend' (from lends to to), 'repay' (from pays back to)
    // For 'lend', 'from' is Lender, 'to' is Borrower
    // For 'repay', 'from' is Borrower (paying back), 'to' is Lender

    try {
        await addDoc(collection(db, "transactions"), {
            from: fromId,
            to: toId,
            amount: parseFloat(amount),
            description,
            type,
            timestamp: new Date().toISOString()
        });
        return true;
    } catch (error) {
        // console.error("Error creating transaction:", error);
        throw error;
    }
}

export async function updateTransaction(transactionId, data, editorId, editorName) {
    try {
        const txRef = doc(db, "transactions", transactionId);
        await updateDoc(txRef, {
            ...data,
            amount: parseFloat(data.amount),
            editedBy: editorName,
            editedById: editorId,
            editedAt: new Date().toISOString()
        });
        return true;
    } catch (error) {
        // console.error("Error updating transaction:", error);
        throw error;
    }
}

export function subscribeToTransactions(userId, callback) {
    // Listen for transactions where user is either sender or receiver
    // Note: Removed orderBy from query to avoid complex index creation for 'or' queries
    const q = query(
        collection(db, "transactions"),
        or(where("from", "==", userId), where("to", "==", userId))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const transactions = [];
        snapshot.forEach((doc) => {
            transactions.push({ id: doc.id, ...doc.data() });
        });

        // Sort client-side
        transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        callback(transactions);
    });

    return unsubscribe;
}
