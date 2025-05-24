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
  
  