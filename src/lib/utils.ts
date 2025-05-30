import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const uploadProfilePicture = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'vibrafit_unsigned');

  try {
    const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/dru9skos8/image/upload', {
      method: 'POST',
      body: formData,
    });

    const cloudinaryData = await cloudinaryRes.json();

    if (!cloudinaryRes.ok) {
      console.error('Cloudinary error:', cloudinaryData);
      return { success: false, newUrl: null };
    }

    const newUrl = cloudinaryData.secure_url;

    const backendRes = await fetch('https://vibrafit.onrender.com/api/users/upload-profile-picture/', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ profilePictureUrl: newUrl }),
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json();
      console.error('Backend error:', errorData);
      return { success: false, newUrl: null };
    }

    return { success: true, newUrl };
  } catch (err) {
    console.error('Upload error:', err);
    return { success: false, newUrl: null };
  }
};

// Upload before and after progress image
export async function uploadProgressPhoto(
  userId: string,
  photoType: 'before' | 'current',
  file: File
): Promise<{ success: boolean; newUrl?: string }> {

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'vibrafit_unsigned');

  let secureUrl: string;
  try {
    const cloudRes = await fetch(
      'https://api.cloudinary.com/v1_1/dru9skos8/image/upload',
      { method: 'POST', body: formData }
    );
    const cloudData = await cloudRes.json();
    if (!cloudRes.ok) {
      console.error('Cloudinary upload error', cloudData);
      return { success: false };
    }
    secureUrl = cloudData.secure_url;
  } catch (err) {
    console.error('Cloudinary exception', err);
    return { success: false };
  }

  const fieldName = photoType === 'before' ? 'beforePhotoUrl' : 'currentPhotoUrl';
  const actionPath =
    photoType === 'before'
      ? 'upload-before-photo'
      : 'upload-current-photo';

  try {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(
      `https://vibrafit.onrender.com/api/users/${actionPath}/`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [fieldName]: secureUrl }),
      }
    );
    if (!res.ok) {
      const errData = await res.json();
      console.error('Backend photo patch error', errData);
      return { success: false };
    }
    return { success: true, newUrl: secureUrl };
  } catch (err) {
    console.error('Backend photo patch exception', err);
    return { success: false };
  }
}