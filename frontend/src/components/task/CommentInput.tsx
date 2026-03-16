import { Send, AtSign } from "lucide-react";
import { User } from "@/types/kanban";

interface CommentInputProps {
    value: string;
    showMentions: boolean;
    mentionFilter: string;
    allUsers: User[];
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: () => void;
    onInsertMention: (user: User) => void;
}

export default function CommentInput({
    value,
    showMentions,
    mentionFilter,
    allUsers,
    textareaRef,
    onChange,
    onSubmit,
    onInsertMention
}: CommentInputProps) {
    const filteredUsers = allUsers.filter(u => u.name.toLowerCase().includes(mentionFilter));

    return (
        <div className="relative">
            {showMentions && filteredUsers.length > 0 && (
                <div className="absolute bottom-full left-0 mb-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                    {filteredUsers.map(user => (
                        <button
                            key={user.id}
                            onClick={() => onInsertMention(user)}
                            className="w-full px-2 py-1.5 text-left hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                        >
                            <div className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-black text-[8px]">
                                {user.name[0]}
                            </div>
                            <span className="text-[9px] font-bold text-gray-700">{user.name}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="relative bg-gray-50 p-0.5 rounded-lg border border-gray-200 focus-within:bg-white focus-within:border-blue-500 transition-all">
                <textarea
                    ref={textareaRef}
                    className="w-full bg-transparent border-none focus:ring-0 p-1.5 text-[9px] font-medium resize-none min-h-[32px] max-h-[80px] scrollbar-hide"
                    placeholder="Write a comment..."
                    value={value}
                    onChange={onChange}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            onSubmit();
                        }
                    }}
                />
                <div className="flex justify-between items-center px-1 pb-1">
                    <button className="p-0.5 text-gray-400 hover:text-blue-600 transition-colors">
                        <AtSign className="w-2.5 h-2.5" />
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={!value.trim()}
                        className="bg-blue-600 p-1 rounded-lg text-white hover:bg-blue-700 disabled:opacity-50 disabled:grayscale transition-all shadow-md active:scale-95"
                    >
                        <Send className="w-2.5 h-2.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
