// src/components/timeline/PostCard.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Post, likePost } from '@/lib/api';
import { Heart, MessageCircle, Repeat, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@/navigation';

interface PostCardProps {
  post: Post;
}

const getYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

export default function PostCard({ post }: PostCardProps) {
  const t = useTranslations('TimelinePage');
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.stats.likes);

  const handleLike = async () => {
    const originalLiked = isLiked;
    const originalLikeCount = likeCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      const result = await likePost(post.id, !isLiked);
      if (!result.success) {
        // Revert on failure
        setIsLiked(originalLiked);
        setLikeCount(originalLikeCount);
      } else {
        // Optionally update with the real count from server
        setLikeCount(result.newLikeCount);
      }
    } catch (error) {
      console.error("Failed to like post:", error);
      setIsLiked(originalLiked);
      setLikeCount(originalLikeCount);
    }
  };
  
  const videoId = post.videoUrl ? getYouTubeId(post.videoUrl) : null;

  const userProfileLink = `/profile/${post.author.id}`;

  return (
    <Card className="shadow-md">
      <CardHeader className="p-4">
        <div className="flex items-center gap-3">
          <Link href={userProfileLink as any}>
            <Avatar>
              <AvatarImage src={post.author.profilePictureUrl || ''} alt={post.author.name} />
              <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link href={userProfileLink as any} className="font-semibold hover:underline">{post.author.name}</Link>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: es })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-2 space-y-4">
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.imageUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
            <Image src={post.imageUrl} alt={t('postImageAlt')} fill style={{ objectFit: 'cover' }} unoptimized />
          </div>
        )}
        {videoId && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        )}
      </CardContent>
      <CardFooter className="p-2 border-t">
        <div className="flex justify-around w-full">
          <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={handleLike}>
            <Heart className={cn("h-5 w-5", isLiked && "fill-red-500 text-red-500")} />
            <span className="text-sm">{likeCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">{post.stats.comments}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            <span className="text-sm">{post.stats.reposts}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
