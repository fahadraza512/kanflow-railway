import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { exportAllDataToPDF } from "@/lib/pdfExportAll";

interface Session {
    id: number;
    browser: string;
    location: string;
    timestamp: string;
    current: boolean;
}

interface LoginHistoryEntry {
    id: number;
    timestamp: string;
    browser: string;
    location: string;
    ipAddress: string;
    status: string;
}

export function useSecurity() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    
    const [tfaEnabled, setTfaEnabled] = useState(false);
    const [lastPasswordChange, setLastPasswordChange] = useState<Date>(new Date());
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

    useEffect(() => {
        if (user) {
            load2FAStatus();
            loadLastPasswordChange();
            loadSessions();
            loadLoginHistory();
            loadRecoveryCodes();
        }
    }, [user]);

    const load2FAStatus = () => {
        if (!user) return;
        
        const saved2FA = localStorage.getItem(`tfa-enabled-${user.email}`);
        if (saved2FA) {
            setTfaEnabled(JSON.parse(saved2FA));
        } else {
            const usersRaw = localStorage.getItem('users');
            if (usersRaw) {
                const users = JSON.parse(usersRaw);
                const foundUser = users.find((u: any) => u.email.toLowerCase() === user.email.toLowerCase());
                if (foundUser?.twoFactorEnabled) {
                    setTfaEnabled(true);
                    localStorage.setItem(`tfa-enabled-${user.email}`, JSON.stringify(true));
                }
            }
        }
    };

    const loadLastPasswordChange = () => {
        const lastChange = localStorage.getItem('last-password-change');
        if (lastChange) {
            setLastPasswordChange(new Date(lastChange));
        }
    };

    const loadSessions = () => {
        if (!user) return;
        
        const savedSessions = localStorage.getItem(`user-sessions-${user.email}`);
        if (!savedSessions) {
            const currentSession: Session = {
                id: Date.now(),
                browser: getBrowserInfo(),
                location: "Current Location",
                timestamp: new Date().toISOString(),
                current: true
            };
            localStorage.setItem(`user-sessions-${user.email}`, JSON.stringify([currentSession]));
            setSessions([currentSession]);
        } else {
            try {
                const parsedSessions = JSON.parse(savedSessions);
                setSessions(parsedSessions);
            } catch (error) {
                console.error("Error parsing sessions:", error);
                const currentSession: Session = {
                    id: Date.now(),
                    browser: getBrowserInfo(),
                    location: "Current Location",
                    timestamp: new Date().toISOString(),
                    current: true
                };
                localStorage.setItem(`user-sessions-${user.email}`, JSON.stringify([currentSession]));
                setSessions([currentSession]);
            }
        }
    };

    const loadLoginHistory = () => {
        if (!user) return;
        
        const history = localStorage.getItem(`login-history-${user.email}`);
        if (history) {
            setLoginHistory(JSON.parse(history));
        } else {
            const initialHistory: LoginHistoryEntry[] = [{
                id: Date.now(),
                timestamp: new Date().toISOString(),
                browser: getBrowserInfo(),
                location: "Current Location",
                ipAddress: "192.168.1.1",
                status: "success"
            }];
            localStorage.setItem(`login-history-${user.email}`, JSON.stringify(initialHistory));
            setLoginHistory(initialHistory);
        }
    };

    const loadRecoveryCodes = () => {
        if (!user) return;
        
        const codes = localStorage.getItem(`recovery-codes-${user.email}`);
        if (codes) {
            setRecoveryCodes(JSON.parse(codes));
        }
    };

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

    const toggle2FA = () => {
        if (!user) return;

        const newStatus = !tfaEnabled;
        
        if (newStatus) {
            const secret = generateTOTPSecret();
            
            const usersRaw = localStorage.getItem('users');
            if (usersRaw) {
                const users = JSON.parse(usersRaw);
                const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === user.email.toLowerCase());
                if (userIndex !== -1) {
                    users[userIndex].twoFactorEnabled = true;
                    users[userIndex].twoFactorSecret = secret;
                    localStorage.setItem('users', JSON.stringify(users));
                }
            }
            
            alert(`2FA Enabled!\n\nYour backup code: ${secret}\n\nSave this code securely. You'll need it to login.\n\nFor this demo, a 6-digit code will be generated automatically during login.`);
        } else {
            const usersRaw = localStorage.getItem('users');
            if (usersRaw) {
                const users = JSON.parse(usersRaw);
                const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === user.email.toLowerCase());
                if (userIndex !== -1) {
                    users[userIndex].twoFactorEnabled = false;
                    delete users[userIndex].twoFactorSecret;
                    localStorage.setItem('users', JSON.stringify(users));
                }
            }
            
            alert('2FA has been disabled for your account.');
        }
        
        setTfaEnabled(newStatus);
        localStorage.setItem(`tfa-enabled-${user.email}`, JSON.stringify(newStatus));
    };

    const generateTOTPSecret = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const generateRecoveryCodes = () => {
        const codes = [];
        for (let i = 0; i < 8; i++) {
            codes.push(Math.floor(10000000 + Math.random() * 90000000).toString());
        }
        
        if (user) {
            localStorage.setItem(`recovery-codes-${user.email}`, JSON.stringify(codes));
            setRecoveryCodes(codes);
        }
        
        return codes;
    };

    const logoutAllSessions = () => {
        if (!user) return;
        
        if (confirm("Are you sure you want to logout from all devices? You will need to login again.")) {
            try {
                localStorage.removeItem(`user-sessions-${user.email}`);
                localStorage.removeItem(`login-history-${user.email}`);
                logout();
                router.push("/");
            } catch (error) {
                console.error("Error logging out:", error);
                alert("An error occurred while logging out. Please try again.");
            }
        }
    };

    const logoutAllExceptCurrent = () => {
        if (!user) return;
        
        if (confirm("Are you sure you want to logout from all other devices?")) {
            try {
                const currentSession = sessions.find(s => s.current);
                if (currentSession) {
                    localStorage.setItem(`user-sessions-${user.email}`, JSON.stringify([currentSession]));
                    setSessions([currentSession]);
                    alert("Logged out from all other devices successfully!");
                } else {
                    alert("Could not find current session.");
                }
            } catch (error) {
                console.error("Error logging out from other devices:", error);
                alert("An error occurred. Please try again.");
            }
        }
    };

    const logoutCurrentDevice = () => {
        if (!user) return;
        
        if (confirm("Are you sure you want to logout from this device?")) {
            try {
                // Remove current session from the list
                const otherSessions = sessions.filter(s => !s.current);
                if (otherSessions.length > 0) {
                    localStorage.setItem(`user-sessions-${user.email}`, JSON.stringify(otherSessions));
                } else {
                    localStorage.removeItem(`user-sessions-${user.email}`);
                }
                
                logout();
                router.push("/");
            } catch (error) {
                console.error("Error logging out:", error);
                alert("An error occurred while logging out. Please try again.");
            }
        }
    };

    const logoutSession = (sessionId: number) => {
        if (!user) return;
        
        const updatedSessions = sessions.filter(s => s.id !== sessionId);
        localStorage.setItem(`user-sessions-${user.email}`, JSON.stringify(updatedSessions));
        setSessions(updatedSessions);
    };

    const exportData = () => {
        if (!user) return;

        try {
            exportAllDataToPDF(user.name, user.email);
            alert('Your complete data has been exported successfully as PDF!');
        } catch (error) {
            console.error("PDF export failed:", error);
            alert("Failed to export data. Please try again.");
        }
    };

    const changePassword = (currentPassword: string, newPassword: string, confirmPassword: string) => {
        if (newPassword !== confirmPassword) {
            alert("New passwords don't match!");
            return false;
        }
        
        if (newPassword.length < 8) {
            alert("Password must be at least 8 characters!");
            return false;
        }

        if (!user) {
            alert("User not found!");
            return false;
        }

        const usersRaw = localStorage.getItem('users');
        if (!usersRaw) {
            alert("No users found!");
            return false;
        }

        const users = JSON.parse(usersRaw);
        const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === user.email.toLowerCase());
        
        if (userIndex === -1) {
            alert("User not found!");
            return false;
        }

        if (users[userIndex].password !== currentPassword) {
            alert("Current password is incorrect!");
            return false;
        }

        try {
            users[userIndex].password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));

            const now = new Date();
            localStorage.setItem('last-password-change', now.toISOString());
            
            localStorage.removeItem(`user-sessions-${user.email}`);
            localStorage.removeItem('auth-storage');
            localStorage.removeItem('currentUser');
            
            alert("Password changed successfully! You will now be logged out. Please login with your new password.");
            
            logout();
            router.push("/");
            
            return true;
        } catch (error) {
            console.error("Error changing password:", error);
            alert("An error occurred while changing password. Please try again.");
            return false;
        }
    };

    const deleteAccount = (confirmation: string) => {
        if (confirmation !== "DELETE") {
            alert('Please type DELETE to confirm');
            return false;
        }

        if (!user) {
            alert("User not found!");
            return false;
        }

        const usersRaw = localStorage.getItem('users');
        if (usersRaw) {
            const users = JSON.parse(usersRaw);
            const filteredUsers = users.filter((u: any) => u.email.toLowerCase() !== user.email.toLowerCase());
            localStorage.setItem('users', JSON.stringify(filteredUsers));
        }

        localStorage.clear();
        logout();
        
        alert("Your account has been permanently deleted. All your data has been removed.");
        router.push("/");
        
        return true;
    };

    return {
        tfaEnabled,
        lastPasswordChange,
        sessions,
        loginHistory,
        recoveryCodes,
        toggle2FA,
        generateRecoveryCodes,
        logoutAllSessions,
        logoutAllExceptCurrent,
        logoutCurrentDevice,
        logoutSession,
        exportData,
        changePassword,
        deleteAccount
    };
}
