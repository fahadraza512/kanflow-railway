/**
 * Email Notification Service
 * Simulates sending email notifications for various events
 * In production, this would integrate with an email service like SendGrid, AWS SES, etc.
 */

import { dispatchStorageEvent } from "./storage";

export interface EmailNotification {
    to: string;
    subject: string;
    body: string;
    type: "assignment" | "mention" | "deadline" | "comment";
    taskId: string | number;
    timestamp: string;
}

interface NotificationPreferences {
    taskAssignment: boolean;
    mentions: boolean;
    comments: boolean;
    dueDateReminders: boolean;
    paymentFailed: boolean;
}

// Store sent emails in localStorage for demo purposes
const SENT_EMAILS_KEY = "sentEmails";

function getSentEmails(): EmailNotification[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(SENT_EMAILS_KEY);
    return raw ? JSON.parse(raw) : [];
}

function saveSentEmail(email: EmailNotification): void {
    if (typeof window === "undefined") return;
    const emails = getSentEmails();
    emails.push(email);
    // Keep only last 100 emails
    if (emails.length > 100) emails.shift();
    localStorage.setItem(SENT_EMAILS_KEY, JSON.stringify(emails));
    // Dispatch event so email page updates in real-time
    dispatchStorageEvent(SENT_EMAILS_KEY);
}

function getNotificationPreferences(): NotificationPreferences {
    if (typeof window === "undefined") return {
        taskAssignment: true,
        mentions: true,
        comments: true,
        dueDateReminders: true,
        paymentFailed: true
    };
    
    const saved = localStorage.getItem("notificationPreferences");
    if (saved) {
        return JSON.parse(saved);
    }
    
    return {
        taskAssignment: true,
        mentions: true,
        comments: true,
        dueDateReminders: true,
        paymentFailed: true
    };
}

/**
 * Send email notification for task assignment
 */
export function sendTaskAssignmentEmail(
    assigneeEmail: string,
    assigneeName: string,
    taskTitle: string,
    taskId: string | number,
    assignedBy: string
): void {
    const prefs = getNotificationPreferences();
    if (!prefs.taskAssignment) {
        console.log("📧 Task assignment email skipped (disabled in preferences)");
        return;
    }

    const email: EmailNotification = {
        to: assigneeEmail,
        subject: `You've been assigned to: ${taskTitle}`,
        body: `Hi ${assigneeName},\n\n${assignedBy} has assigned you to the task "${taskTitle}".\n\nClick here to view the task and get started.\n\nBest regards,\nKanban Team`,
        type: "assignment",
        taskId,
        timestamp: new Date().toISOString()
    };

    saveSentEmail(email);
    console.log("📧 Email sent:", email);
}

/**
 * Send email notification for @mention in comment
 */
export function sendMentionEmail(
    mentionedEmail: string,
    mentionedName: string,
    taskTitle: string,
    taskId: string | number,
    mentionedBy: string,
    commentText: string
): void {
    const prefs = getNotificationPreferences();
    if (!prefs.mentions) {
        console.log("📧 Mention email skipped (disabled in preferences)");
        return;
    }

    const email: EmailNotification = {
        to: mentionedEmail,
        subject: `${mentionedBy} mentioned you in a comment`,
        body: `Hi ${mentionedName},\n\n${mentionedBy} mentioned you in a comment on "${taskTitle}":\n\n"${commentText}"\n\nClick here to view the task and respond.\n\nBest regards,\nKanban Team`,
        type: "mention",
        taskId,
        timestamp: new Date().toISOString()
    };

    saveSentEmail(email);
    console.log("📧 Email sent:", email);
}

/**
 * Send email notification for due date reminder (24 hours before)
 */
export function sendDueDateReminderEmail(
    assigneeEmail: string,
    assigneeName: string,
    taskTitle: string,
    taskId: string | number,
    dueDate: string
): void {
    const prefs = getNotificationPreferences();
    if (!prefs.dueDateReminders) {
        console.log("📧 Due date reminder email skipped (disabled in preferences)");
        return;
    }

    const email: EmailNotification = {
        to: assigneeEmail,
        subject: `Reminder: "${taskTitle}" is due tomorrow`,
        body: `Hi ${assigneeName},\n\nThis is a friendly reminder that the task "${taskTitle}" is due on ${new Date(dueDate).toLocaleDateString()}.\n\nClick here to view the task and complete it before the deadline.\n\nBest regards,\nKanban Team`,
        type: "deadline",
        taskId,
        timestamp: new Date().toISOString()
    };

    saveSentEmail(email);
    console.log("📧 Email sent:", email);
}

/**
 * Send email notification for new comment
 */
export function sendCommentEmail(
    recipientEmail: string,
    recipientName: string,
    taskTitle: string,
    taskId: string | number,
    commenterName: string,
    commentText: string
): void {
    const prefs = getNotificationPreferences();
    if (!prefs.comments) {
        console.log("📧 Comment email skipped (disabled in preferences)");
        return;
    }

    const email: EmailNotification = {
        to: recipientEmail,
        subject: `New comment on: ${taskTitle}`,
        body: `Hi ${recipientName},\n\n${commenterName} commented on "${taskTitle}":\n\n"${commentText}"\n\nClick here to view the task and respond.\n\nBest regards,\nKanban Team`,
        type: "comment",
        taskId,
        timestamp: new Date().toISOString()
    };

    saveSentEmail(email);
    console.log("📧 Email sent:", email);
}

/**
 * Get all sent emails (for admin/debug purposes)
 */
export function getAllSentEmails(): EmailNotification[] {
    return getSentEmails();
}

/**
 * Clear sent emails history
 */
export function clearSentEmails(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(SENT_EMAILS_KEY);
}

/**
 * Check for upcoming due dates and send reminders
 * This should be called periodically (e.g., daily cron job)
 */
export function checkAndSendDueDateReminders(): void {
    // This would be implemented in a backend service
    // For demo purposes, we'll just log it
    console.log("🔔 Checking for due date reminders...");
}
