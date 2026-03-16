import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth";

interface PendingUser {
    email: string;
    name: string;
    role: string;
    avatar?: string;
    title?: string;
    bio?: string;
    twoFactorEnabled?: boolean;
}

export function useLogin() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [show2FA, setShow2FA] = useState(false);
    const [tfaCode, setTfaCode] = useState("");
    const [pendingUser, setPendingUser] = useState<PendingUser | null>(null);

    const { setAuth } = useAuthStore();
    const router = useRouter();

    const getBrowserInfo = () => {
        const ua = navigator.userAgent;
        let browser = "Unknown Browser";
        let os = "Unknown OS";
        
        if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
        else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
        else if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Edg")) browser = "Edge";
        
        if (ua.includes("Win")) os = "Windows";
        else if (ua.includes("Mac")) os = "macOS";
        else if (ua.includes("Linux")) os = "Linux";
        else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
        else if (ua.includes("Android")) os = "Android";
        
        return `${browser} on ${os}`;
    };

    const saveLoginHistory = (user: PendingUser) => {
        const history = localStorage.getItem(`login-history-${user.email}`);
        const loginHistory = history ? JSON.parse(history) : [];
        
        loginHistory.unshift({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            browser: getBrowserInfo(),
            location: "Current Location",
            ipAddress: "192.168.1.1",
            status: "success"
        });
        
        if (loginHistory.length > 10) {
            loginHistory.splice(10);
        }
        
        localStorage.setItem(`login-history-${user.email}`, JSON.stringify(loginHistory));
    };

    const saveSession = () => {
        const savedSessions = localStorage.getItem('user-sessions');
        const sessions = savedSessions ? JSON.parse(savedSessions) : [];
        
        const newSession = {
            id: Date.now(),
            browser: getBrowserInfo(),
            location: "Current Location",
            timestamp: new Date().toISOString(),
            current: true
        };
        
        sessions.forEach((s: { current: boolean }) => s.current = false);
        sessions.push(newSession);
        
        localStorage.setItem('user-sessions', JSON.stringify(sessions));
    };

    const completeLogin = (user: PendingUser) => {
        localStorage.setItem("currentUser", JSON.stringify({
            id: user.email,
            name: user.name,
            email: user.email,
            role: user.role
        }));
        
        saveLoginHistory(user);
        saveSession();
        
        setAuth(
            { 
                id: user.email, 
                name: user.name, 
                email: user.email,
                avatar: user.avatar,
                title: user.title,
                bio: user.bio
            },
            "mock-token-" + Date.now(),
            user.role
        );

        router.push("/");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const result = loginUser(formData.email, formData.password);

        if (!result.success) {
            setError(result.error || "Login failed.");
            return;
        }

        const user = result.user!;

        if (user.twoFactorEnabled) {
            setPendingUser(user);
            setShow2FA(true);
            return;
        }

        completeLogin(user);
    };

    const handle2FASubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!pendingUser) return;

        if (tfaCode.length === 6) {
            completeLogin(pendingUser);
        } else {
            setError("Invalid 2FA code. Please enter a 6-digit code.");
        }
    };

    const handleBack2FA = () => {
        setShow2FA(false);
        setTfaCode("");
        setPendingUser(null);
    };

    return {
        formData,
        setFormData,
        showPassword,
        setShowPassword,
        error,
        show2FA,
        tfaCode,
        setTfaCode,
        handleSubmit,
        handle2FASubmit,
        handleBack2FA
    };
}
