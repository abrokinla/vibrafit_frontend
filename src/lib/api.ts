export interface UserData {
  id: number;
  email: string;
  role: "admin" | "trainer" | "client";
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
  updated_at: string;
  name: string;
  country: string;
  state: string;
  is_onboarded: boolean;
  profilePictureUrl: string | null;
  beforePhotoUrl: string | null;   
  currentPhotoUrl: string | null;
  trainerId: number | null;
  date_of_birth: string | null;
}

export interface TrainerProfileData {
  bio: string;
  certifications: string;
  specializations: string[];
  experience_years: number | null;
}

export type CombinedProfileData = UserData & TrainerProfileData;

export async function getUserData(): Promise<UserData> {
  const token = localStorage.getItem('accessToken');
  const userId = localStorage.getItem('userId');

  if (!token || !userId) {
    throw new Error('NO_CREDENTIALS');
  }

  const res = await fetch(
    `https://vibrafit.onrender.com/api/users/${userId}/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (res.status === 401 || res.status === 403) {
    throw new Error('UNAUTHORIZED');
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'FETCH_ERROR');
  }

  return res.json();
}

export async function fetchCombinedProfile(): Promise<CombinedProfileData> {
  const token = localStorage.getItem('accessToken');

  const userRes = await fetch('https://vibrafit.onrender.com/api/users/profile/', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!userRes.ok) {
    if (userRes.status === 401) throw new Error('UNAUTHORIZED');
    throw new Error('Failed to fetch user profile');
  }

  const userData = await userRes.json();

  // Only fetch trainer data if role is 'trainer'
  let trainerData = {};
  if (userData.role === 'trainer') {
    const trainerRes = await fetch('https://vibrafit.onrender.com/api/trainers/profile/', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (trainerRes.ok) {
      trainerData = await trainerRes.json();
    } else {
      console.warn("Trainer profile not found or error fetching it.");
    }
  }

  return {
    ...userData,
    ...trainerData,
  };
}


export async function saveTrainerProfile(
  data: Partial<TrainerProfileData>
): Promise<{ success: boolean }> {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('NO_CREDENTIALS');

  const res = await fetch(
    'https://vibrafit.onrender.com/api/trainer-profile/profile/',
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (res.status === 401 || res.status === 403) {
    throw new Error('UNAUTHORIZED');
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'UPDATE_FAILED');
  }

  return { success: true };
}

export async function saveUserProfile(
  data: Partial<UserData>
): Promise<{ success: boolean }> {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('NO_CREDENTIALS');

  const res = await fetch(
    'https://vibrafit.onrender.com/api/users/profile/',
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (res.status === 401 || res.status === 403) {
    throw new Error('UNAUTHORIZED');
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'UPDATE_FAILED');
  }

  return { success: true };
}