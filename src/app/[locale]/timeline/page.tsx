// src/app/[locale]/timeline/page.tsx
'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Post, fetchTimelinePosts } from '@/lib/api';
import CreatePostForm from '@/components/timeline/CreatePostForm';
import PostCard from '@/components/timeline/PostCard';

export default function TimelinePage() {
  const t = useTranslations('TimelinePage');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        const fetchedPosts = await fetchTimelinePosts();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Failed to fetch timeline posts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, []);

  const handlePostCreated = (newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </header>

      <CreatePostForm onPostCreated={handlePostCreated} />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
         <div className="text-center py-12 text-muted-foreground">
            <p>{t('noPostsYet')}</p>
          </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}