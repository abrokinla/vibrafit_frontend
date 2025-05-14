// src/lib/api.ts

export interface UserData {
  id: string;
  name: string;
  goal: string;
  currentProgress: string;
  is_onboarded: boolean;
  trainerId: string | null;
  profilePictureUrl: string | null;
}


export async function getUserData(): Promise<UserData> {
  const token = localStorage.getItem('accessToken');
  const userId = localStorage.getItem('userId');

  if (!token || !userId) {
    throw new Error('NO_CREDENTIALS');
  }

  const res = await fetch(`https://vibrafit.onrender.com/api/users/${userId}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  // 👇 Handle expired/invalid tokens explicitly
  if (res.status === 401 || res.status === 403) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'FETCH_ERROR');
  }

  return await res.json();
}

  