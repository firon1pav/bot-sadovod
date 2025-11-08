import React, { useState, useMemo } from 'react';
import { Community, CommunityPost, Comment as CommentType, User, Notification } from '../types';
import { BackIcon, MoreHorizontalIcon, PlusIcon, CloseIcon, FlagIcon } from './icons';
import CreatePostModal from './CreatePostModal';
import EditPostModal from './EditPostModal';
import CommentModal from './CommentModal';

// --- Report Post Modal Component ---
interface ReportPostModalProps {
  post: CommunityPost;
  onClose: () => void;
  onReport: (postId: string, reason: string) => void;
}

const REPORT_REASONS = [
    'Спам',
    'Оскорбление',
    'Неприемлемый контент',
    'Нарушение правил сообщества',
    'Введение в заблуждение',
    'Другое',
];

const ReportPostModal: React.FC<ReportPostModalProps> = ({ post, onClose, onReport }) => {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherReason, setOtherReason] = useState('');

  const handleReasonClick = (reason: string) => {
    if (reason === 'Другое') {
      setShowOtherInput(true);
    } else {
      onReport(post.id, reason);
    }
  };

  const handleSendOtherReason = () => {
    if (otherReason.trim()) {
      onReport(post.id, otherReason.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-sm p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            {showOtherInput && (
              <button onClick={() => setShowOtherInput(false)} className="p-1 rounded-full hover:bg-accent -ml-2">
                <BackIcon className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-bold">{showOtherInput ? 'Укажите причину' : 'Пожаловаться на пост'}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-accent -mr-2 -mt-2">
            <CloseIcon className="w-5 h-5"/>
          </button>
        </div>
        
        {!showOtherInput ? (
          <>
            <p className="text-sm text-foreground/80 mb-4">Выберите причину жалобы. Это поможет нам быстрее рассмотреть вашу заявку.</p>
            <div className="space-y-2">
                {REPORT_REASONS.map(reason => (
                    <button
                        key={reason}
                        onClick={() => handleReasonClick(reason)}
                        className="w-full text-left px-4 py-3 bg-accent rounded-lg hover:bg-accent/70 transition-colors text-sm font-medium"
                    >
                        {reason}
                    </button>
                ))}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <textarea
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              placeholder="Опишите вашу жалобу..."
              rows={4}
              className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary no-scrollbar"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 rounded-full text-sm font-semibold hover:bg-accent transition-colors"
              >
                Отмена
              </button>
              <button 
                type="button" 
                onClick={handleSendOtherReason} 
                disabled={!otherReason.trim()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Отправить
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// --- Main Component ---
interface CommunityDetailScreenProps {
  community: Community;
  posts: CommunityPost[];
  comments: CommentType[];
  currentUser: User;
  onBack: () => void;
  onLeaveCommunity: (communityId: string) => void;
  onJoinCommunity: (communityId: string) => void;
  onAddPost: (communityId: string, data: { text: string; photoUrl?: string }) => void;
  onUpdatePost: (postId: string, data: { text: string; photoUrl?: string }) => void;
  onDeletePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  timeAgo: (date: Date) => string;
  likedPostIds: Set<string>;
  toggleLikePost: (postId: string) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
}

const CommunityDetailScreen: React.FC<CommunityDetailScreenProps> = ({
  community, posts, comments, currentUser, onBack, onLeaveCommunity, onJoinCommunity,
  onAddPost, onUpdatePost, onDeletePost, onAddComment, timeAgo, likedPostIds, toggleLikePost, addNotification
}) => {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [commentingOnPost, setCommentingOnPost] = useState<CommunityPost | null>(null);
  const [activePostMenu, setActivePostMenu] = useState<string | null>(null);
  const [isConfirmingLeave, setIsConfirmingLeave] = useState(false);
  const [reportingPost, setReportingPost] = useState<CommunityPost | null>(null);

  const handleCreatePost = (data: { text: string; photoUrl?: string }) => {
    onAddPost(community.id, data);
    setIsCreatePostModalOpen(false);
  };
  
  const handleSavePost = (postId: string, data: { text: string; photoUrl?: string }) => {
    onUpdatePost(postId, data);
    setEditingPost(null);
  };
  
  const handleConfirmDelete = (postId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот пост?')) {
      onDeletePost(postId);
    }
    setActivePostMenu(null);
  };

  const handleShare = async (post: CommunityPost) => {
    const shareData = {
      title: `Пост в сообществе "${community.name}"`,
      text: post.text,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Ссылка на пост скопирована!');
      }
    } catch (error) {
      console.error("Share failed:", error);
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert('Ссылка на пост скопирована!');
      } catch (copyError) {
        console.error("Clipboard copy failed:", copyError);
        alert("Не удалось поделиться или скопировать ссылку.");
      }
    }
  };
  
  const handleConfirmLeave = () => {
    onLeaveCommunity(community.id);
    setIsConfirmingLeave(false);
  };

  const handleReportPost = (postId: string, reason: string) => {
    // In a real app, this would send a request to a server.
    addNotification({
        message: `Жалоба на пост отправлена. Спасибо!`,
        icon: <FlagIcon className="w-5 h-5 text-yellow-500" />
    });
    setReportingPost(null);
  };

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts]);

  return (
    <div className="animate-fade-in pb-16">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-lg border-b border-accent p-4 flex items-center gap-2">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-accent -ml-2">
          <BackIcon className="w-6 h-6" />
        </button>
        <img src={community.photoUrl.replace('&w=800&h=400', '&w=100&h=100')} alt={community.name} className="w-10 h-10 rounded-lg object-cover" />
        <div className="flex-1 overflow-hidden">
            <h1 className="text-lg font-bold truncate">{community.name}</h1>
            <p className="text-xs text-foreground/60">👥 {community.memberCount.toLocaleString('ru-RU')} участников</p>
        </div>
      </div>

      <div>
        {/* Community Info & Actions */}
        <div className="p-4">
             <p className="text-sm text-foreground/80 mb-4">{community.description}</p>
             {community.isMember ? (
                <button 
                    onClick={() => setIsConfirmingLeave(true)}
                    className="w-full text-center py-2 bg-red-500/10 text-red-500 rounded-lg font-semibold hover:bg-red-500/20 transition-colors"
                >
                    Выйти из сообщества
                </button>
            ) : (
                <button 
                    onClick={() => onJoinCommunity(community.id)}
                    className="w-full text-center py-2 bg-primary/10 text-primary rounded-lg font-semibold hover:bg-primary/20 transition-colors"
                >
                    Вступить в сообщество
                </button>
            )}
        </div>
        
        {/* Posts */}
        <div className="space-y-4 px-4 pb-4">
          {sortedPosts.map(post => (
            <div key={post.id} className="bg-card border border-accent rounded-lg p-4">
              {/* Post Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img src={post.authorPhotoUrl} alt={post.authorName} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-bold">{post.authorName}</p>
                    <p className="text-xs text-foreground/60">{timeAgo(post.createdAt)}</p>
                  </div>
                </div>
                <div className="relative">
                    <button onClick={() => setActivePostMenu(activePostMenu === post.id ? null : post.id)} className="p-2 rounded-full hover:bg-accent -mr-2">
                        <MoreHorizontalIcon className="w-5 h-5" />
                    </button>
                    {activePostMenu === post.id && (
                        <div className="absolute right-0 top-full mt-2 w-40 bg-card border border-accent rounded-lg shadow-lg z-10 animate-fade-in-up">
                            {post.authorId === currentUser.id ? (
                                <>
                                    <button onClick={() => { setEditingPost(post); setActivePostMenu(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-t-lg">Редактировать</button>
                                    <button onClick={() => handleConfirmDelete(post.id)} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-accent">Удалить</button>
                                </>
                            ) : (
                                <>
                                     <button onClick={() => { setReportingPost(post); setActivePostMenu(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-t-lg">Пожаловаться</button>
                                </>
                            )}
                             <button onClick={() => { handleShare(post); setActivePostMenu(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-b-lg">Копировать ссылку</button>
                        </div>
                    )}
                </div>
              </div>
              {/* Post Body */}
              <p className="mb-3 text-sm whitespace-pre-wrap">{post.text}</p>
              {post.photoUrl && <img src={post.photoUrl} alt="Фото к посту" className="rounded-lg w-full object-cover max-h-80" />}
              {/* Post Actions */}
              <div className="flex items-center mt-3 pt-3 border-t border-accent/50 text-foreground/70">
                <div className="flex-1 flex items-center gap-4">
                    <button
                        onClick={() => toggleLikePost(post.id)}
                        className={`flex items-center gap-2 text-sm transition-colors ${
                            likedPostIds.has(post.id) ? 'text-red-500 hover:text-red-400' : 'hover:text-primary'
                        }`}
                    >
                        <span className="text-xl">{likedPostIds.has(post.id) ? '❤️' : '🤍'}</span>
                        <span className="font-medium">{post.likes}</span>
                    </button>
                    <button
                        onClick={() => setCommentingOnPost(post)}
                        className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                    >
                        <span className="text-xl">💬</span>
                        <span className="font-medium">{post.comments}</span>
                    </button>
                </div>
                <button
                    onClick={() => handleShare(post)}
                    className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
                >
                    <span className="text-xl">🔗</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* FAB to create post */}
      <button 
        onClick={() => setIsCreatePostModalOpen(true)}
        className="fixed bottom-20 right-5 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-transform hover:scale-110"
        title="Создать пост"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {/* Modals */}
      {isCreatePostModalOpen && (
        <CreatePostModal
          isOpen={isCreatePostModalOpen}
          onClose={() => setIsCreatePostModalOpen(false)}
          onCreate={handleCreatePost}
          currentUser={currentUser}
        />
      )}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={handleSavePost}
        />
      )}
      {commentingOnPost && (
        <CommentModal
          post={commentingOnPost}
          comments={comments.filter(c => c.postId === commentingOnPost.id)}
          currentUser={currentUser}
          onClose={() => setCommentingOnPost(null)}
          onAddComment={onAddComment}
          timeAgo={timeAgo}
        />
      )}
      {isConfirmingLeave && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsConfirmingLeave(false)}>
             <div className="bg-card rounded-2xl w-full max-w-sm p-6 animate-fade-in-up text-center" onClick={e => e.stopPropagation()}>
                 <h2 className="text-xl font-bold mb-2">Покинуть сообщество?</h2>
                 <p className="text-foreground/80 mb-6">
                     Вы уверены, что хотите покинуть "{community.name}"?
                 </p>
                 <div className="flex justify-center gap-4">
                     <button 
                         onClick={() => setIsConfirmingLeave(false)} 
                         className="px-6 py-2 rounded-full text-sm font-semibold hover:bg-accent transition-colors"
                     >
                         Отмена
                     </button>
                     <button 
                         onClick={handleConfirmLeave} 
                         className="px-6 py-2 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 transition-colors"
                     >
                         Покинуть
                     </button>
                 </div>
             </div>
         </div>
      )}
      {reportingPost && (
        <ReportPostModal
          post={reportingPost}
          onClose={() => setReportingPost(null)}
          onReport={handleReportPost}
        />
      )}
    </div>
  );
};

export default CommunityDetailScreen;