import { useState, useEffect } from "react";
import { getAllSentEmails, clearSentEmails, EmailNotification } from "@/lib/emailNotifications";
import { useStorageListener } from "./useLocalStorage";

interface NotificationPreferences {
    taskAssignment: boolean;
    mentions: boolean;
    comments: boolean;
    dueDateReminders: boolean;
    paymentFailed: boolean;
}

export function useEmailSettings() {
    const [emails, setEmails] = useState<EmailNotification[]>([]);
    const [filter, setFilter] = useState<"all" | "assignment" | "mention" | "deadline" | "comment">("all");
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        taskAssignment: true,
        mentions: true,
        comments: true,
        dueDateReminders: true,
        paymentFailed: true
    });

    const loadEmails = () => {
        setEmails(getAllSentEmails());
    };

    useEffect(() => {
        const existingEmails = getAllSentEmails();
        if (existingEmails.length === 0) {
            initializeSampleEmails();
        }
        
        loadEmails();
        loadPreferences();
    }, []);

    // Listen for changes to sentEmails in localStorage
    useStorageListener(() => {
        loadEmails();
    }, ['sentEmails']);

    const initializeSampleEmails = () => {
        const sampleEmails: EmailNotification[] = [
            {
                to: "dianne.russell@kanbanflow.com",
                subject: "You've been assigned to: Implement user authentication",
                body: "Hi Dianne Russell,\n\nGuy Hawkins has assigned you to the task \"Implement user authentication\".\n\nClick here to view the task and get started.\n\nBest regards,\nKanban Team",
                type: "assignment",
                taskId: "TASK-1234",
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                to: "guy.hawkins@kanbanflow.com",
                subject: "Dianne Russell mentioned you in a comment",
                body: "Hi Guy Hawkins,\n\nDianne Russell mentioned you in a comment on \"Implement user authentication\":\n\n\"@Guy Hawkins can you review the authentication flow I implemented?\"\n\nClick here to view the task and respond.\n\nBest regards,\nKanban Team",
                type: "mention",
                taskId: "TASK-1234",
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
            },
            {
                to: "esther.howard@kanbanflow.com",
                subject: "Reminder: \"Design landing page\" is due tomorrow",
                body: "Hi Esther Howard,\n\nThis is a friendly reminder that the task \"Design landing page\" is due on " + new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString() + ".\n\nClick here to view the task and complete it before the deadline.\n\nBest regards,\nKanban Team",
                type: "deadline",
                taskId: "TASK-5678",
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            },
            {
                to: "robert.fox@kanbanflow.com",
                subject: "New comment on: Fix navigation bug",
                body: "Hi Robert Fox,\n\nJane Cooper commented on \"Fix navigation bug\":\n\n\"I tested this on mobile and it works great! Ready to merge.\"\n\nClick here to view the task and respond.\n\nBest regards,\nKanban Team",
                type: "comment",
                taskId: "TASK-9012",
                timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
            },
            {
                to: "jane.cooper@kanbanflow.com",
                subject: "You've been assigned to: Update documentation",
                body: "Hi Jane Cooper,\n\nRobert Fox has assigned you to the task \"Update documentation\".\n\nClick here to view the task and get started.\n\nBest regards,\nKanban Team",
                type: "assignment",
                taskId: "TASK-3456",
                timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
            },
            {
                to: "dianne.russell@kanbanflow.com",
                subject: "Esther Howard mentioned you in a comment",
                body: "Hi Dianne Russell,\n\nEsther Howard mentioned you in a comment on \"Design landing page\":\n\n\"@Dianne Russell I've finished the mockups, can you start implementing?\"\n\nClick here to view the task and respond.\n\nBest regards,\nKanban Team",
                type: "mention",
                taskId: "TASK-5678",
                timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString()
            }
        ];

        if (typeof window !== "undefined") {
            localStorage.setItem("sentEmails", JSON.stringify(sampleEmails));
        }
    };

    const loadPreferences = () => {
        const saved = localStorage.getItem("notificationPreferences");
        if (saved) {
            setPreferences(JSON.parse(saved));
        }
    };

    const handlePreferenceChange = (key: keyof NotificationPreferences) => {
        const updated = { ...preferences, [key]: !preferences[key] };
        setPreferences(updated);
        localStorage.setItem("notificationPreferences", JSON.stringify(updated));
    };

    const handleClear = () => {
        if (confirm("Clear all sent emails? This cannot be undone.")) {
            clearSentEmails();
            loadEmails();
        }
    };

    const filteredEmails = filter === "all"
        ? emails
        : emails.filter(e => e.type === filter);

    return {
        emails: filteredEmails,
        filter,
        setFilter,
        preferences,
        handlePreferenceChange,
        loadEmails,
        handleClear
    };
}
