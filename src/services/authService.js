import { auth, db } from "./firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    sendEmailVerification
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function signup(email, password, name) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });

        // Send Email Verification
        // console.log("Sending verification email to:", email);
        await sendEmailVerification(user);

        // Create user document in Firestore
        // console.log("Attempting to create Firestore document for user:", user.uid);
        try {
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: email,
                displayName: name,
                friends: [],
                createdAt: new Date().toISOString()
            });
            // console.log("Firestore document created successfully");
        } catch (dbError) {
            // console.error("Firestore Error:", dbError);
            // We don't throw here to allow auth to succeed even if DB fails temporarily,
            // but typically this means Firestore isn't enabled.
            throw new Error("Account created, but failed to set up profile. Please ensure Firestore is enabled in Firebase Console.");
        }

        return user;
    } catch (error) {
        // console.error("Signup Error:", error);
        throw error;
    }
}

export function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user exists in Firestore, if not create them
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                friends: [],
                createdAt: new Date().toISOString()
            });
        }

        return user;
    } catch (error) {
        // console.error("Google Login Error:", error);
        throw error;
    }
}

export function logout() {
    return signOut(auth);
}
