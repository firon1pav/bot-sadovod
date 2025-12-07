
import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { CommunityPost, Comment, User } from '../types';
import { CloseIcon } from './icons';

interface CommentModalProps {
    post: CommunityPost;
    comments: Comment[];
    currentUser: User;
    onClose: () => void;
    onAddComment: (postId: string, text: string) => void;
    timeAgo: (date: Date) => string;
}

const CommentModal: React.FC<CommentModalProps> = ({ post, comments, currentUser, onClose, onAddComment, timeAgo }) => {
    const [newCommentText, setNewCommentText] = useState('');
    const commentsEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            commentsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [comments]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (newCommentText.trim()) {
            onAddComment(post.id, newCommentText.trim());
            setNewCommentText('');
        }
    };
    
    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end"
            onClick={onClose}
        >
            <div 
                className="bg-card rounded-t-2xl w-full max-w-lg mx-auto h-[80vh] flex flex-col animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-shrink-0 p-4 border-b border-accent flex items-center justify-between">
                    <h2 className="text-lg font-bold">Комментарии</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-accent">
                        <CloseIcon className="w-5 h-5"/>
                    </button>
                </div>
                
                {/* Comments List */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {/* Original Post Snippet */}
                    <div className="pb-4 border-b border-accent/50">
                        <div className="flex items-center gap-3 mb-2">
                             <img src={post.authorPhotoUrl} alt={post.authorName} className="w-8 h-8 rounded-full object-cover" />
                             <p className="font-bold text-sm">{post.authorName}</p>
                        </div>
                        <p className="text-sm">{post.text}</p>
                    </div>

                    {/* Comments */}
                    {comments.map(comment => (
                        <div key={comment.id} className="flex items-start gap-3">
                            <img src={comment.authorPhotoUrl} alt={comment.authorName} className="w-8 h-8 rounded-full object-cover" />
                            <div className="bg-accent/50 rounded-lg p-2 flex-grow">
                                <div className="flex items-baseline gap-2">
                                    <p className="font-bold text-sm">{comment.authorName}</p>
                                    <p className="text-xs text-foreground/60">{timeAgo(comment.createdAt)}</p>
                                </div>
                                <p className="text-sm">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                    {/* Extra padding for scroll */}
                    <div ref={commentsEndRef} className="h-4" />
                </div>
                
                {/* Comment Input Form */}
                <div className="flex-shrink-0 p-4 border-t border-accent bg-card">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <img src={currentUser.photoUrl} alt="Ваш аватар" className="w-8 h-8 rounded-full object-cover" />
                        <input
                            type="text"
                            value={newCommentText}
                            onChange={e => setNewCommentText(e.target.value)}
                            placeholder="Написать комментарий..."
                            className="flex-grow bg-accent border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-primary"
                            autoFocus
                            onFocus={scrollToBottom}
                        />
                        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 disabled:opacity-50" disabled={!newCommentText.trim()}>
                            Отпр.
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CommentModal;
