import { db } from "./firebase";
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    arrayUnion,
    getDoc,
    addDoc,
    onSnapshot,
    deleteDoc,
    writeBatch,
    setDoc
} from "firebase/firestore";

export async function searchUsers(searchTerm) {
    const q = query(collection(db, "users"), where("email", "==", searchTerm));
    const querySnapshot = await getDocs(q);

    const users = [];
    querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
    });

    return users;
}

export async function sendFriendRequest(currentUserId, currentUserProfile, friendId) {
    // Check if request already exists
    const q = query(
        collection(db, "friend_requests"),
        where("from", "==", currentUserId),
        where("to", "==", friendId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
        throw new Error("Request already sent");
    }

    await addDoc(collection(db, "friend_requests"), {
        from: currentUserId,
        to: friendId,
        senderName: currentUserProfile.displayName || currentUserProfile.email,
        senderEmail: currentUserProfile.email,
        status: "pending",
        timestamp: new Date().toISOString()
    });
}

export function subscribeToFriendRequests(userId, callback) {
    const q = query(
        collection(db, "friend_requests"),
        where("to", "==", userId),
        where("status", "==", "pending")
    );
    return onSnapshot(q, (snapshot) => {
        const requests = [];
        snapshot.forEach(doc => requests.push({ id: doc.id, ...doc.data() }));
        callback(requests);
    });
}

export function subscribeToSentRequests(userId, callback) {
    const q = query(
        collection(db, "friend_requests"),
        where("from", "==", userId),
        where("status", "==", "pending")
    );
    return onSnapshot(q, (snapshot) => {
        const requests = [];
        snapshot.forEach(doc => {
            // We need the TO user's info to display them as a "transaction target"
            // The request doc has senderName/senderEmail (me), but usually not receiver info?
            // Actually, we only stored "to" (uid). we need to fetch their profile?
            // For efficiency, the request doc SHOULD probably snapshot the receiver name if known, 
            // OR we fetch the user profile client side.
            // For now, return the request data, and the Dashboard can resolve the user profile.
            requests.push({ id: doc.id, ...doc.data() });
        });
        callback(requests);
    });
}

export async function acceptFriendRequest(requestId, fromId, toId) {
    try {
        const requestRef = doc(db, "friend_requests", requestId);
        const userRef = doc(db, "users", toId); // Me (Receiver)
        const friendRef = doc(db, "users", fromId); // Sender

        // Self-Healing: Ensure documents exist before updating
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            console.warn("Restoring missing user profile for receiver:", toId);
            await setDoc(userRef, {
                uid: toId,
                friends: [],
                email: "restored_user@example.com", // Placeholder
                displayName: "Restored User",
                createdAt: new Date().toISOString()
            });
        }

        const friendSnap = await getDoc(friendRef);
        if (!friendSnap.exists()) {
            console.warn("Restoring missing user profile for sender:", fromId);
            // Try to get info from the request doc
            const reqSnap = await getDoc(requestRef);
            const reqData = reqSnap.exists() ? reqSnap.data() : {};

            await setDoc(friendRef, {
                uid: fromId,
                friends: [],
                email: reqData.senderEmail || "restored_friend@example.com",
                displayName: reqData.senderName || "Restored Friend",
                createdAt: new Date().toISOString()
            });
        }

        const batch = writeBatch(db);

        // 1. Add sender to my friend list
        batch.update(userRef, { friends: arrayUnion(fromId) });

        // 2. Add me to sender's friend list
        batch.update(friendRef, { friends: arrayUnion(toId) });

        // 3. Delete the request
        batch.delete(requestRef);

        // Commit all changes atomicaly
        await batch.commit();

        return true;
    } catch (error) {
        // console.error("Error accepting friend:", error);
        throw error;
    }
}

export async function getFriends(userId) {
    // ... existing implementation ...
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const friendIds = userSnap.data().friends || [];
        if (friendIds.length === 0) return [];

        const friendsData = [];
        // Helper to batch requests if needed, for now simplistic parallel gets
        // or using 'in' query for small sets

        // Use Promise.all for simplicity as 'in' query limit is 10
        const promises = friendIds.map(fid => getDoc(doc(db, "users", fid)));
        const docs = await Promise.all(promises);

        docs.forEach(d => {
            if (d.exists()) friendsData.push({ uid: d.id, ...d.data() });
        });

        return friendsData;
    }
    return [];
}

export async function getUserProfile(userId) {
    const docRef = doc(db, "users", userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
        return { uid: snap.id, ...snap.data() };
    }
    return null;
}
