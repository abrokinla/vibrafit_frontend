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
  goal: string | null;
}

export interface TrainerProfileData {
  bio: string;
  certifications: string;
  specializations: string[];
  experience_years: number | null;
}

// Routine-related types
export type RoutinePlan = {
  planId: number;
  routineName: string;
  startDate: string;
  frequency: string;
  exercises: {
    name: string;
    sets: string;
    reps: string;
    unit: string;
    notes?: string;
  }[];
  client: number;
  trainer: number;
  nutrition: any;
};
export interface ExerciseInput {
  id: string;
  name: string;
  sets: string;
  reps: string;
  unit: 'reps' | 'seconds' | 'minutes';
  notes?: string;
}
export interface RoutineAssignment {
  clientId: string;
  routineName: string;
  startDate: string; // YYYY-MM-DD
  frequency: 'daily' | 'weekly' | 'custom';
  exercises: ExerciseInput[];
}

// Nutrition-related types
export interface Meal {
  id?: number;
  nutrition_plan?: number; 
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  time: string;
  description: string;
  calories: string;
}

export interface NutritionPlan {
  id?: number; 
  plan: number;
  notes?: string;
  meals: Meal[];
}

export interface GoalPayload {
  user: number;
  description: string;
  target_value: string;
  target_date: string;
  status: 'pending' | 'active' | 'completed';
}

export interface GoalResponse {
  success: boolean;
  goal?: GoalPayload & { id: number; created_at: string };
}

export interface TrainerMeal {
  id: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  time: string;
  description: string;
  calories?: number;
}

export async function fetchTodaysTrainerMeals(token: string): Promise<TrainerMeal[]> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const res = await fetch(`https://vibrafit.onrender.com/api/nutrition-plan/?date=${today}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch trainer meals');
  }

  const data = await res.json();

  return data.meals || [];
}

export interface LoggedMeal {
  id: number;
  description: string;
  calories?: number;
  date: string;
  time?: string;
}

export async function fetchLoggedMeals(token: string): Promise<LoggedMeal[]> {
  const res = await fetch(`${API_URL}/logged-meals/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch logged meals");
  return res.json();
}

export async function createLoggedMeal(token: string, meal: Partial<LoggedMeal>) {
  const res = await fetch(`${API_URL}/logged-meals/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(meal)
  });
  if (!res.ok) throw new Error("Failed to log meal");
  return res.json();
}

export async function deleteLoggedMeal(token: string, id: number) {
  const res = await fetch(`${API_URL}/logged-meals/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error("Failed to delete meal");
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