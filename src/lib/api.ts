const API_BASE_URL = 'https://vibrafit.onrender.com';
const token = localStorage.getItem('accessToken');
const userId = localStorage.getItem('userId');

export interface GoalPayload {
  user: number;
  description: string;
  target_value: string;
  target_date: string;
  status: 'pending' | 'active' | 'completed';
}

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
  trainingLevel: string | null;
  date_of_birth: string | null;
  goal: GoalPayload | null;

  metrics: {
    weight?: number | null;
    height?: number | null;
    body_fat?: number | null;
    bmi?: number | null;
    muscle_mass?: number | null;
    waist_circumference?: number | null;
    [key: string]: number | null | undefined; // future-proof
  };
}

export interface TrainerProfileData {
  bio: string;
  certifications: string;
  specializations: string [];
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
  start_date: string;
  end_date: string;
  meals: Meal[];
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
  const res = await fetch(`https://vibrafit.onrender.com/api/nutrition-plan/today/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to fetch today\'s nutrition plan');
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
export interface WorkoutLogEntry {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  unit?: 'reps' | 'seconds' | 'minutes';
  notes?: string;
  date: Date;
}

export interface AdHocWorkout {
  id: number;
  description: string;
  date: Date;
}
export interface Exercise {
  id: string;
  exercise_id?: number;
  name: string;
  sets: number;
  reps: number;
  unit: 'reps' | 'seconds' | 'minutes';
  notes?: string;
  date: Date;
  videoUrl?: string; 
}

export interface DailyUserRoutine {
  planId: number;
  date: Date; 
  routineName?: string; 
  exercises: Exercise[];
  trainerNotes?: string;
}
export interface DailyLog {
    id: number;
    plan: number;
    date: string;
    actual_exercise: { name: string }[] | string;
    actual_nutrition: string;
    completion_percentage: number;
    notes: string;
    user: number;
}

export type ActivityType = 'workout' | 'meal';

export interface Activity {
  id: number;
  type: ActivityType;
  description: string;
  calories?: number;
  date: Date;
}

export type CombinedProfileData = UserData & TrainerProfileData;

export async function getUserData(): Promise<UserData> {
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

  const rawUser = await res.json();

  const metricsObject: UserData['metrics'] = {};
  for (const metric of rawUser.metrics || []) {
    metricsObject[metric.type] = metric.value;
  }

  return {
    ...rawUser,
    metrics: metricsObject,
  };
}

export async function fetchCombinedProfile(): Promise<CombinedProfileData> {
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
  const metricsArray = userData.metrics ?? [];
  const metricsObject: UserData['metrics'] = {};

  for (const metric of metricsArray) {
    metricsObject[metric.type] = metric.value;
  }

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
    metrics: metricsObject,
    ...trainerData,
  };
}


export async function saveTrainerProfile(
  data: Partial<TrainerProfileData>
): Promise<{ success: boolean }> {
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
): Promise<{ success: boolean }> {;
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


type MetricInput = {
  type: string;
  value: number;
};

export const saveMetrics = async (
  metrics: MetricInput[]
): Promise<{ success: boolean; message?: string }> => {

  try {
    for (const { type, value } of metrics) {
      const res = await fetch(`${API_BASE_URL}/api/metrics/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ type, value }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Failed to save ${type}`);
      }
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Save failed.",
    };
  }
};