import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ImageOff } from 'lucide-react';

interface AuthImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt?: string;
  fallbackText?: string;
}

export const AuthImage: React.FC<AuthImageProps> = ({
  src,
  alt = 'Document Image',
  className = '',
  style,
  fallbackText = 'Image Unavailable',
  onLoad,
  ...props
}) => {
  const { token } = useAuth();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    if (!src) {
      setIsLoading(false);
      setBlobUrl(null);
      return;
    }

    // Direct data URLs or external static assets
    if (src.startsWith('data:') || src.startsWith('blob:')) {
      setBlobUrl(src);
      setIsLoading(false);
      return;
    }

    // Convert legacy /uploads/ URLs to new secure /api/documents/ endpoints if present
    let fetchUrl = src;
    if (src.startsWith('/uploads/')) {
      // Map to appropriate api route if needed
      fetchUrl = src;
    }

    setIsLoading(true);
    setHasError(false);

    api.fetchMediaBlob(fetchUrl)
      .then((blob) => {
        if (isMounted) {
          objectUrl = URL.createObjectURL(blob);
          setBlobUrl(objectUrl);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('[AuthImage] Media stream failed:', fetchUrl, err);
          setHasError(true);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src, token]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-[#E2E4DC]/50 dark:bg-[#181F28]/50 min-h-[80px] text-[#526071] dark:text-[#9DA3A0] ${className}`} style={style}>
        <Loader2 className="w-5 h-5 animate-spin text-[#1B2430] dark:text-[#EAEBE3]" />
      </div>
    );
  }

  if (hasError || !blobUrl) {
    return (
      <div className={`flex flex-col items-center justify-center bg-[#E2E4DC]/60 dark:bg-[#181F28]/60 p-4 text-[#526071] dark:text-[#9DA3A0] text-xs font-mono text-center space-y-1 ${className}`} style={style}>
        <ImageOff className="w-5 h-5 text-[#526071] dark:text-[#9DA3A0]" />
        <span className="text-[10px]">{fallbackText}</span>
      </div>
    );
  }

  return (
    <img
      src={blobUrl}
      alt={alt}
      className={className}
      style={style}
      onLoad={onLoad}
      {...props}
    />
  );
};
