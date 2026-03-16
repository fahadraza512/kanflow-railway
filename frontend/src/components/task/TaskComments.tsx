import { useState, useRef } from "react";
import { useComments, useCreateComment, useUpdateComment, useDeleteComment } from "@/hooks/api/useComments";
import { useAuthStore } from "@/store/useAuthStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useWorkspaceMembers } from "@/hooks/api/useWorkspaceMembers";
import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";

interface TaskCommentsProps {
    taskId: string | number;
    readOnly?: boolean;
}

export default function TaskComments({ taskId, readOnly }: TaskCommentsProps) {
    const [newComment, setNewComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<string | number | null>(null);
    const [editingText, setEditingText] = useState("");
    const [showMentions, setShowMentions] = useState(false);
    const [mentionFilter, setMentionFilter] = useState("");
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { user } = useAuthStore();
    const { activeWorkspace } = useWorkspaceStore();
    const { data: comments = [], isLoading } = useComments(taskId as string);
    const { data: members = [] } = useWorkspaceMembers(activeWorkspace?.id || null);
    const createCommentMutation = useCreateComment();
    const updateCommentMutation = useUpdateComment();
    const deleteCommentMutation = useDeleteComment();

    // Transform workspace members to user format for mentions
    const allUsers = members.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        avatar: member.avatar,
    }));

    const extractMentions = (text: string): string[] => {
        // Extract @mentions from text (format: @username)
        const mentionRegex = /@(\w+)/g;
        const matches = text.match(mentionRegex);
        if (!matches) return [];
        
        // Find user IDs for mentioned usernames
        const mentionedUserIds: string[] = [];
        matches.forEach(match => {
            const username = match.slice(1); // Remove @ symbol
            const user = allUsers.find(u => 
                u.name.toLowerCase().replace(/\s+/g, '') === username.toLowerCase()
            );
            if (user) {
                mentionedUserIds.push(user.id.toString());
            }
        });
        
        return mentionedUserIds;
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;

        const mentions = extractMentions(newComment);

        createCommentMutation.mutate({
            taskId: taskId as string,
            text: newComment.trim(),
            mentions,
        });

        setNewComment("");
    };

    const handleDelete = (id: string | number) => {
        if (confirm("Delete this comment?")) {
            deleteCommentMutation.mutate({
                id: id as string,
                taskId: taskId as string,
            });
        }
    };

    const handleEdit = (comment: any) => {
        setEditingCommentId(comment.id);
        setEditingText(comment.text);
    };

    const handleSaveEdit = (commentId: string | number) => {
        if (editingText.trim()) {
            const mentions = extractMentions(editingText);
            
            updateCommentMutation.mutate({
                id: commentId as string,
                data: {
                    text: editingText.trim(),
                    mentions,
                },
            });
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

        const currentCursorPosition = e.target.selectionStart;
        setCursorPosition(currentCursorPosition);
        
        const textBeforeCursor = val.slice(0, currentCursorPosition);
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

    const insertMention = (user: any) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const textBeforeCursor = newComment.slice(0, cursorPosition);
        const textAfterCursor = newComment.slice(cursorPosition);
        const lastAtChar = textBeforeCursor.lastIndexOf("@");

        if (lastAtChar !== -1) {
            // Replace from @ to cursor with @username
            const username = user.name.replace(/\s+/g, ''); // Remove spaces from name
            const beforeAt = textBeforeCursor.slice(0, lastAtChar);
            const newText = beforeAt + `@${username} ` + textAfterCursor;
            
            setNewComment(newText);
            setShowMentions(false);
            
            // Set cursor position after the mention
            setTimeout(() => {
                const newCursorPos = beforeAt.length + username.length + 2; // +2 for @ and space
                textarea.setSelectionRange(newCursorPos, newCursorPos);
                textarea.focus();
            }, 0);
        }
    };

    // Transform API comments to match component expectations
    const transformedComments = comments.map(comment => ({
        id: comment.id,
        taskId: comment.taskId,
        userId: comment.userId,
        userName: comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Unknown User',
        userAvatar: comment.user?.picture,
        text: comment.text,
        mentions: comment.mentions,
        createdAt: comment.createdAt,
    }));

    if (isLoading) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[8px] font-black text-gray-400 uppercase tracking-wider">Comments</h4>
                </div>
                <p className="text-[9px] text-gray-400 italic text-center py-2">Loading comments...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-[8px] font-black text-gray-400 uppercase tracking-wider">Comments</h4>
                <span className="text-[8px] font-bold text-gray-400">{transformedComments.length} comments</span>
            </div>

            <div className="space-y-2 mb-3">
                {transformedComments.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        isEditing={editingCommentId === comment.id}
                        editingText={editingText}
                        canEdit={user?.id === comment.userId}
                        readOnly={readOnly}
                        onEdit={() => handleEdit(comment)}
                        onDelete={() => handleDelete(comment.id)}
                        onSaveEdit={() => handleSaveEdit(comment.id)}
                        onCancelEdit={handleCancelEdit}
                        onEditingTextChange={setEditingText}
                    />
                ))}
            </div>

            {!readOnly && (
                <CommentInput
                    value={newComment}
                    showMentions={showMentions}
                    mentionFilter={mentionFilter}
                    allUsers={allUsers}
                    textareaRef={textareaRef}
                    onChange={handleInputChange}
                    onSubmit={handleAddComment}
                    onInsertMention={insertMention}
                />
            )}
        </div>
    );
}
