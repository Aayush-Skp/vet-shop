/**
 * Firebase Authentication - Client-only
 * Separated from core firebase.ts to avoid importing browser-only
 * auth APIs in server-side code (API routes).
 */
import { getAuth } from "firebase/auth";
import app from "./firebase";

export const auth = getAuth(app);
