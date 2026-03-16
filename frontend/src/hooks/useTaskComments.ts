import { useState, useEffect, useRef } from "react";
import { Comment as KanbanComment, User } from "@/types/kanban";
import { getComments, addComment, getTask } from "@/lib/tasks";
import { getUsers, getCurrentUser, updateComment, deleteComment } from "@/lib/storage";
import { sendCommentEmail, sendMentionEmail } from "@/lib/emailNotifications";
import { createNotification } from "@/lib/notifications";

export function useTaskComments(taskId: string | number) {
    const [comments, setComments] = useState<KanbanComment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<string | number | null>(null);
    const [editingText, setEditingText] = useState("");
    const [showMentions, setShowMentions] = useState(false);
    const [mentionFilter, setMentionFilter] = useState("");
    const [currentUser, setCurrentUser] = useState<{ id: string | number } | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setComments(getComments(taskId));
        setCurrentUser(getCurrentUser());
        setAllUsers(getUsers());
    }, [taskId]);

    const processMentions = (commentText: string) => {
        const task = getTask(taskId);
        if (!task) return;

        const commenterName = currentUser ? 
            (allUsers.find(u => u.id === currentUser.id)?.name || "Someone") : 
            "Someone";

        const mentionRegex = /@([A-Za-z]+(?:\s+[A-Za-z]+)*?)(?=\s|[,.:;!?]|$)/g;
        const mentions = Array.from(commentText.matchAll(mentionRegex));
        const mentionedUserIds = new Set<string | number>();

        if (mentions.length > 0) {
            mentions.forEach(match => {
                const mentionedName = match[1].trim();
                const mentionedUser = allUsers.find(u => 
                    u.name.toLowerCase() === mentionedName.toLowerCase()
                );

                if (mentionedUser && mentionedUser.id !== currentUser?.id) {
                    const mentionedEmail = `${mentionedUser.name.toLowerCase().replace(/\s+/g, '.')}@example.com`;

                    sendMentionEmail(
                        mentionedEmail,
                        mentionedUser.name,
                        task.title,
                        taskId,
                        commenterName,
                        commentText
                    );

                    createNotification({
                        userId: mentionedUser.id,
                        type: "mention",
                        message: `${commenterName} mentioned you in a comment`,
                        taskId: taskId,
                        taskTitle: task.title,
                        senderName: commenterName,
                        commentText: commentText
                    });

                    mentionedUserIds.add(mentionedUser.id);
                    console.log(`📧 Mention email sent to ${mentionedUser.name}`);
                    console.log(`🔔 In-app notification created for ${mentionedUser.name}`);
                }
            });
        }

        if (task.assignedTo && 
            task.assignedTo !== currentUser?.id && 
            !mentionedUserIds.has(task.assignedTo) && 
            task.assignedToName) {
            const assigneeEmail = `${task.assignedToName.toLowerCase().replace(/\s+/g, '.')}@example.com`;

            sendCommentEmail(
                assigneeEmail,
                task.assignedToName,
                task.title,
                taskId,
                commenterName,
                commentText
            );

            createNotification({
                userId: task.assignedTo,
                type: "comment",
                message: `${commenterName} commented on: ${task.title}`,
                taskId: taskId,
                taskTitle: task.title,
                senderName: commenterName,
                commentText: commentText
            });

            console.log(`📧 Comment email sent to ${task.assignedToName}`);
            console.log(`🔔 In-app notification created for ${task.assignedToName}`);
        }
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;

        addComment(taskId, newComment);
        const updatedComments = getComments(taskId);
        setComments(updatedComments);

        processMentions(newComment);
        setNewComment("");
    };

    const handleDelete = (id: string | number) => {
        if (confirm("Delete this comment?")) {
            deleteComment(id);
            setComments(getComments(taskId));
        }
    };

    const handleEdit = (comment: KanbanComment) => {
        setEditingCommentId(comment.id);
        setEditingText(comment.text);
    };

    const handleSaveEdit = (commentId: string | number) => {
        if (editingText.trim()) {
            updateComment(commentId, { text: editingText.trim() });
            setComments(getComments(taskId));
            setEditingCommentId(null);
            setEditingText("");
        }
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditingText("");
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setNewComment(val);

        const cursorPosition = e.target.selectionStart;
        const textBeforeCursor = val.slice(0, cursorPosition);
        const lastAtChar = textBeforeCursor.lastIndexOf("@");

        // Check if we're in a mention context
        if (lastAtChar !== -1) {
            const textAfterAt = textBeforeCursor.slice(lastAtChar + 1);
            // Only show mentions if there's no space after @ and we're still typing
            if (!textAfterAt.includes(" ") && textAfterAt.length >= 0) {
                setShowMentions(true);
                setMentionFilter(textAfterAt.toLowerCase());
            } else {
                setShowMentions(false);
            }
        } else {
            setShowMentions(false);
        }
    };

    const insertMention = (user: User) => {
        if (!textareaRef.current) return;
        
        const textarea = textareaRef.current;
        const cursorPosition = textarea.selectionStart;
        const textBeforeCursor = newComment.slice(0, cursorPosition);
        const textAfterCursor = newComment.slice(cursorPosition);
        
        // Find the last @ before cursor that doesn't have a space after it (incomplete mention)
        let lastAtIndex = -1;
        for (let i = textBeforeCursor.length - 1; i >= 0; i--) {
            if (textBeforeCursor[i] === '@') {
                // Check if this @ is part of an incomplete mention
                const textAfterAt = textBeforeCursor.slice(i + 1);
                if (!textAfterAt.includes(' ')) {
                    lastAtIndex = i;
                    break;
                }
            }
        }
        
        if (lastAtIndex === -1) return;

        // Get text before the @ symbol
        const textBeforeAt = newComment.slice(0, lastAtIndex);
        
        // Build new text: everything before @, then @Name with space, then everything after cursor
        const mention = `@${user.name} `;
        const newText = textBeforeAt + mention + textAfterCursor;
        
        setNewComment(newText);
        setShowMentions(false);
        
        // Calculate new cursor position (after the mention)
        const newCursorPos = textBeforeAt.length + mention.length;
        
        // Set cursor position after state update
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 10);
    };

    return {
        comments,
        newComment,
        editingCommentId,
        editingText,
        showMentions,
        mentionFilter,
        currentUser,
        allUsers,
        textareaRef,
        setEditingText,
        handleAddComment,
        handleDelete,
        handleEdit,
        handleSaveEdit,
        handleCancelEdit,
        handleInputChange,
        insertMention
    };
}
