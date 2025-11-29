// src/components/timeline/CreatePostForm.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Loader2, User, X, Video } from 'lucide-react';
import { createPost, getUserData, UserData, Post, uploadPostMedia } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface CreatePostFormProps {
  onPostCreated: (newPost: Post) => void;
}

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const t = useTranslations('TimelinePage');
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getUserData().then(setUser).catch(console.error);
  }, []);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: t('toastFileSizeErrorTitle'),
          description: t('toastFileSizeErrorDesc'),
          variant: 'destructive',
        });
        return;
      }
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !mediaFile) {
      toast({ title: t('toastErrorTitle'), description: t('toastEmptyPost'), variant: 'destructive' });
      return;
    }

    setIsPosting(true);
    let mediaUrl: string | undefined = undefined;
    let mediaType: 'image' | 'video' | undefined = undefined;

    try {
      if (mediaFile) {
        mediaType = mediaFile.type.startsWith('image/') ? 'image' : 'video';
        const uploadResult = await uploadPostMedia(mediaFile, mediaType);
        mediaUrl = uploadResult.url;
      }

      const result = await createPost(content, mediaUrl, mediaType);
      if (result.success && result.newPost) {
        onPostCreated(result.newPost);
        setContent('');
        removeMedia();
        toast({ title: t('toastSuccessTitle'), description: t('toastPostCreated') });
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error: any) {
      console.error(error);
      toast({ title: t('toastErrorTitle'), description: error.message || t('toastPostFailed'), variant: 'destructive' });
    } finally {
      setIsPosting(false);
    }
  };

  useEffect(() => {
    // Cleanup object URL on unmount
    return () => {
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview);
      }
    };
  }, [mediaPreview]);


  return (
    <Card className="shadow-md">
      <CardContent className="p-4 space-y-4">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={user?.profilePictureUrl || ''} alt={user?.name} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <Textarea
            placeholder={t('postPlaceholder')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            disabled={isPosting}
          />
        </div>

        {mediaPreview && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden border">
            {mediaFile?.type.startsWith('image') ? (
              <Image src={mediaPreview} alt="Media preview" fill style={{ objectFit: 'cover' }} />
            ) : (
              <video src={mediaPreview} controls className="w-full h-full object-cover" />
            )}
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 z-10"
              onClick={removeMedia}
              disabled={isPosting}
              aria-label={t('removeMediaLabel')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex justify-between items-center">
           <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/gif, video/mp4, video/quicktime, video/webm"
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPosting || !!mediaFile}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {t('addMediaButton')}
            </Button>
          </div>
          
          <Button onClick={handlePost} disabled={isPosting || (!content.trim() && !mediaFile)}>
            {isPosting ? <Loader2 className="animate-spin" /> : t('postButton')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
