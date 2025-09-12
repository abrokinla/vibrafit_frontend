import { parseISO, differenceInDays, addDays } from 'date-fns';
import axios from "axios";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vibrafit.onrender.com';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

export function apiUrl(path: string) {
  return `${API_BASE_URL}/api/${API_VERSION}${path.startsWith('/') ? path : '/' + path}`;
}

export interface GoalPayload {
  user: number;
  description?: string;
  target_value?: string;
  target_date?: string;
}

export interface Interest {
  id: number;
  name: string;
}

export interface UserData {
  id: number;
  email: string;
  role: "admin" | "trainer" | "client" | "gym";
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
  training_level: string | null;
  date_of_birth: string | null;
  goal: GoalPayload | null;
  interests?: number[];
  gym_name?: string;

  metrics: {
    weight?: number | null;
    height?: number | null;
    body_fat?: number | null;
    bmi?: number | null;
    muscle_mass?: number | null;
    waist_circumference?: number | null;
    [key: string]: number | null | undefined;
  };

  current_subscription?: {
    id: number;
    status: 'pending' | 'active' | 'declined' | 'expired';
    start_date?: string;
    end_date?: string;
    is_expired?: boolean;
    trainer?: {
      id: number;
      name: string;
      email: string;
    };
    requested_at: string;
    responded_at?: string;
  } | null;
}

export interface TrainerProfileData {
  bio: string;
  certifications: string;
  specializations: string [];
  experience_years: number | null;
  rating?: number;
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

// New Preset Routine Types
export interface PresetExercise {
    id: string; // client-side ID
    name: string;
    sets: string;
    reps: string;
    unit: 'reps' | 'seconds' | 'minutes';
    notes?: string;
    video_url?: string;
    order: number;
}

export interface PresetRoutine {
    id: number;
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    exercises: PresetExercise[];
    trainerId: number;
}

export interface ExerciseInput {
  id: string;
  name: string;
  sets: string;
  reps: string;
  unit: 'reps' | 'seconds' | 'minutes';
  notes?: string;
  video_url?: string; 
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
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'mid_morning' | 'mid_afternoon';
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
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'mid_morning' | 'mid_afternoon';
  time: string;
  description: string;
  calories?: number;
}

// Social Timeline Types
export interface PostAuthor {
  id: number;
  name: string;
  profilePictureUrl: string | null;
  role: 'client' | 'trainer' | 'admin' | 'gym';
}

export interface PostStats {
  likes: number;
  reposts: number;
  comments: number;
}

export interface Post {
  id: string;
  author: PostAuthor;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  createdAt: string; 
  stats: PostStats;
  isLiked: boolean; 
}

export interface PublicProfileData {
  id: number;
  email?: string;
  name: string;
  role: 'client' | 'trainer' | 'admin' | 'gym';
  profilePictureUrl: string | null;
  created_at: string;
  bio?: string;
  certifications?: string;
  specializations?: string[] | string;
  experience_years?: number | null;
}

export interface SubscriptionRequest {
  id: number;
  client: {
    id: number;
    name: string;
    profilePictureUrl: string | null;
  };
  trainer: {
    id: number;
    name: string;
  };
  status: 'pending' | 'active' | 'declined' | 'expired';
  requested_at: string;
  start_date?: string;
  end_date?: string;
}

export interface ClientDetailsForTrainer extends PublicProfileData {
  goal?: {
    description: string;
    target_value: string;
    target_date: string;
  } | null;
  beforePhotoUrl?: string | null;
  currentPhotoUrl?: string | null;
  metrics?: {
    weight?: number | null;
    height?: number | null;
  };
}

export async function fetchTodaysTrainerMeals(token: string): Promise<TrainerMeal[]> {
  const res = await fetch(apiUrl('/nutrition-plan/today/'), {
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
  id: number;
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
  user: {
    id: number;
    name: string;
    profilePictureUrl: string | null;
  };
}

export type ActivityType = 'workout' | 'meal';

export interface Activity {
  id: number;
  type: ActivityType;
  description: string;
  calories?: number;
  date: Date;
}

// Messaging interfaces
export interface Message {
  id: number;
  sender: number;
  recipient: number;
  content: string;
  timestamp: string;
}

export interface Conversation {
  user: {
    id: number;
    name: string;
    profile_picture_url: string | null;
  };
  last_message: string;
  timestamp: string;
  unread_count: number;
}

export type CombinedProfileData = UserData & TrainerProfileData;

async function getAuthHeaders() {
  // Only access localStorage on client-side, but don't create server/client branch
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('NO_CREDENTIALS');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getUserData(): Promise<UserData> {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const headers = await getAuthHeaders();

  const res = await fetch(
  apiUrl(`/users/${userId}/`),
    {
      method: 'GET',
      headers,
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
  const headers = await getAuthHeaders();
  const userRes = await fetch(apiUrl('/users/profile/'), { headers });

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
  const trainerRes = await fetch(apiUrl('/trainers/profile/'), { headers });
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
  const headers = await getAuthHeaders();
  const res = await fetch(
  apiUrl('/trainer-profile/profile/'),
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    }
  );

  if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'UPDATE_FAILED');
  }

  return { success: true };
}

export async function saveUserProfile(
  data: Partial<UserData>
): Promise<{ success: boolean }> {;
  const headers = await getAuthHeaders();
  const res = await fetch(
  apiUrl('/users/profile/'),
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    }
  );

  if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'UPDATE_FAILED');
  }
  return { success: true };
}

export async function completeUserOnboarding(
  userId: string,
  data: Partial<UserData> & { interests: number[]; goal?: Partial<GoalPayload> }
): Promise<{ success: boolean; message?: string }> {
  const headers = await getAuthHeaders();
  const res = await fetch(apiUrl(`/users/${userId}/onboard/`), {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    return { success: false, message: errorData.detail || 'Onboarding failed' };
  }
  return { success: true };
}

export async function completeTrainerOnboarding(
  userId: string,
  data: {
    name: string;
    country: string;
    state: string;
    profilePictureUrl?: string;
    professionalInfo: Partial<TrainerProfileData>;
  }
): Promise<{ success: boolean; message?: string }> {
  const headers = await getAuthHeaders();
  const res = await fetch(apiUrl(`/users/${userId}/onboard/`), {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    return { success: false, message: errorData.detail || 'Onboarding failed' };
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
  const headers = await getAuthHeaders();
  try {
    for (const { type, value } of metrics) {
  await fetch(apiUrl('/metrics/'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ type, value }),
      });
    }
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Save failed.",
    };
  }
};

export async function fetchDailyLogs(token: string): Promise<DailyLog[]> {
  const res = await fetch(apiUrl('/daily-logs/'), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error(await res.text());
    throw new Error('Failed to fetch daily logs');
  }

  return res.json();
}

export async function calculateLongestStreak(token: string): Promise<number> {
  try {
    const logs = await fetchDailyLogs(token);
    
    // Filter logs for days with completed workouts
    const workoutDates = new Set(
      logs
        .filter(log => Array.isArray(log.actual_exercise) && log.actual_exercise.length > 0 && log.completion_percentage > 0)
        .map(log => log.date)
    );

    // Convert to sorted Date objects
    const sortedDates = Array.from(workoutDates)
      .map(date => parseISO(date))
      .sort((a, b) => a.getTime() - b.getTime());

    if (sortedDates.length === 0) return 0;

    let longestStreak = 1;
    let currentStreak = 1;
    let currentDate = sortedDates[0];

    for (let i = 1; i < sortedDates.length; i++) {
      const nextDate = sortedDates[i];
      if (differenceInDays(nextDate, currentDate) === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else if (differenceInDays(nextDate, currentDate) > 1) {
        currentStreak = 1;
      }
      currentDate = nextDate;
    }

    return longestStreak;
  } catch (err) {
    console.error("Error calculating longest streak:", err);
    return 0;
  }
}

// --- Messaging API Functions ---

export async function fetchConversations(): Promise<Conversation[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(apiUrl('/messages/conversations/'), { headers });
  if (!res.ok) throw new Error('Failed to fetch conversations');
  return res.json();
}

export async function fetchMessages(otherUserId: number): Promise<Message[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(apiUrl(`/messages/?with_user=${otherUserId}`), { headers });
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function sendMessage(recipientId: number, content: string): Promise<Message> {
  const headers = await getAuthHeaders();
  const res = await fetch(apiUrl('/messages/'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ recipient: recipientId, content }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || 'Failed to send message');
  }
  return res.json();
}

export async function markConversationAsRead(otherUserId: number): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(apiUrl('/messages/mark_conversation_read/'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ other_user_id: otherUserId }),
  });
  if (!res.ok) throw new Error('Failed to mark conversation as read');
}

export async function getUnreadMessageCount(): Promise<number> {
  const headers = await getAuthHeaders();
  const res = await fetch(apiUrl('/messages/unread_count/'), { headers });
  if (!res.ok) throw new Error('Failed to fetch unread count');
  const data = await res.json();
  return data.count;
}

export async function fetchActiveClientCount(): Promise<number> {
  const headers = await getAuthHeaders();
  const response = await fetch(apiUrl('/trainer-profile/clients/'), {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch active clients');
  }

  const clients = await response.json();
  return clients.length;
}

export async function fetchTrainerClientDailyLogs(limit: number = 10): Promise<DailyLog[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(apiUrl(`/daily-logs/trainer-clients/?limit=${limit}`), {
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch trainer client daily logs');
  }

  return response.json();
}

// --- Timeline API Functions ---
const allPosts: Post[] = [
    {
      id: 'post-1',
      author: { id: 101, name: 'Jane Doe', profilePictureUrl: 'https://placehold.co/100x100.png', role: 'client' },
      content: 'Just crushed my morning workout! Feeling energized and ready to take on the day. #FitnessJourney #Vibrafit',
      imageUrl: 'https://placehold.co/600x400.png',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      stats: { likes: 15, reposts: 3, comments: 2 },
      isLiked: false,
    },
    {
      id: 'post-2',
      author: { id: 2, name: 'John Thorn', profilePictureUrl: 'https://placehold.co/100x100.png', role: 'trainer' },
      content: 'New video on proper squat form is up! Check it out to avoid common mistakes and maximize your gains. Let me know if you have questions!',
      videoUrl: 'https://www.youtube.com/watch?v=bEv6CCg2BC8', // A real squat video
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      stats: { likes: 42, reposts: 12, comments: 8 },
      isLiked: true,
    },
    {
      id: 'post-3',
      author: { id: 102, name: 'Carlos Estevez', profilePictureUrl: 'https://placehold.co/100x100.png', role: 'client' },
      content: 'Meal prep for the week is done! Eating healthy is so much easier when you plan ahead.',
      imageUrl: 'https://placehold.co/600x300.png',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      stats: { likes: 28, reposts: 5, comments: 4 },
      isLiked: false,
    },
     {
      id: 'post-4',
      author: { id: 2, name: 'John Thorn', profilePictureUrl: 'https://placehold.co/100x100.png', role: 'trainer' },
      content: 'Client progress highlight! So proud of the dedication shown here.',
      imageUrl: 'https://placehold.co/400x600.png',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      stats: { likes: 55, reposts: 20, comments: 15 },
      isLiked: true,
    },
  ];

export async function fetchTimelinePosts(authorId?: string): Promise<Post[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  
  let posts = allPosts;
  if (authorId) {
    posts = allPosts.filter(p => p.author.id.toString() === authorId);
  }
  
  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function likePost(postId: string, like: boolean): Promise<{ success: boolean; newLikeCount: number }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Post ${postId} like status set to ${like}`);
    // In a real app, you would get the new like count from the server response.
    // For now, we'll just simulate it.
    const currentLikes = Math.floor(Math.random() * 50);
    return { success: true, newLikeCount: like ? currentLikes + 1 : currentLikes };
}

export async function createPost(content: string, mediaUrl?: string, mediaType?: 'image' | 'video'): Promise<{ success: boolean; newPost?: Post }> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  try {
    const currentUser = await getUserData();
    const newPost: Post = {
        id: `post-${Date.now()}`,
        author: {
            id: currentUser.id,
            name: currentUser.name || 'New User',
            profilePictureUrl: currentUser.profilePictureUrl,
            role: currentUser.role
        },
        content: content,
        imageUrl: mediaType === 'image' ? mediaUrl : undefined,
        videoUrl: mediaType === 'video' ? mediaUrl : undefined,
        createdAt: new Date().toISOString(),
        stats: { likes: 0, reposts: 0, comments: 0 },
        isLiked: false,
    };
    allPosts.unshift(newPost); // Add to our mock database
    return { success: true, newPost: newPost };
  } catch (error) {
    console.error("Cannot create post without user data", error);
    return { success: false };
  }
}

export async function fetchPublicUserProfile(userId: string): Promise<PublicProfileData | null> {
  const token = localStorage.getItem('accessToken');
  if (!userId || !token) return null;

  try {
    const headers = await getAuthHeaders();
  const userRes = await fetch(apiUrl(`/users/${userId}/`), { headers });
    if (!userRes.ok) {
      if (userRes.status === 404) return null;
      throw new Error('Failed to fetch user data');
    }
    const userData: PublicProfileData = await userRes.json();

    if (userData.role === 'trainer') {
  const profileRes = await fetch(apiUrl(`/trainer-profile/by-user/${userId}/`), { headers });
      if (profileRes.ok) {
        const trainerProfileData = await profileRes.json();
        return { ...userData, ...trainerProfileData };
      }
    }

    return userData;
  } catch (err) {
    console.error(`Error fetching public profile for user ${userId}:`, err);
    throw err;
  }
}

export async function fetchPendingSubscriptions(): Promise<SubscriptionRequest[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(apiUrl('/subscriptions/pending-requests/'), {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch pending subscriptions');
  }

  return response.json();
}

export async function fetchClientDetailsForTrainer(clientId: number): Promise<ClientDetailsForTrainer | null> {
  try {
    const headers = await getAuthHeaders();
  const userRes = await fetch(apiUrl(`/users/${clientId}/`), { headers });
    if (!userRes.ok) {
      if (userRes.status === 404) return null;
      throw new Error('Failed to fetch client data');
    }
    const userData: ClientDetailsForTrainer = await userRes.json();

    // Fetch client goals
  const goalsRes = await fetch(apiUrl(`/goals/?user=${clientId}`), { headers });
    let goal = null;
    if (goalsRes.ok) {
      const goalsData = await goalsRes.json();
      // Assume the latest goal is the most relevant
      goal = goalsData.length > 0 ? goalsData[0] : null;
    }

    // Fetch client metrics
  const metricsRes = await fetch(apiUrl(`/metrics/?user=${clientId}`), { headers });
    let metrics = {};
    if (metricsRes.ok) {
      const metricsData = await metricsRes.json();
      metrics = metricsData.reduce((acc: any, metric: any) => ({
        ...acc,
        [metric.type]: metric.value,
      }), {});
    }

    return {
      ...userData,
      goal,
      metrics,
      beforePhotoUrl: userData.beforePhotoUrl || null,
      currentPhotoUrl: userData.currentPhotoUrl || null,
    };
  } catch (err) {
    console.error(`Error fetching client details for user ${clientId}:`, err);
    throw err;
  }
}

export async function respondToSubscriptionRequest(
  id: number,
  status: 'active' | 'declined'
) {
  const endpoint = status === 'active' ? 'accept' : 'decline';
  const url = apiUrl(`/subscriptions/${id}/${endpoint}/`);
  const headers = await getAuthHeaders();
  
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('API Error Response:', errorData);
      return { success: false, error: errorData };
    }

    const responseData = await res.json();
    console.log('Success response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Network error:', error);
    return { success: false, error: 'Network error' };
  }
}

// Helper function to handle API responses
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      const text = await response.text().catch(() => '');
      if (text) errorMessage = text;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return { success: true, message: 'Deleted successfully' };
  }

  try {
    return await response.json();
  } catch {
    return { success: true, message: 'Operation completed successfully' };
  }
};


/**
 * Create a new preset routine
 */
export async function createPresetRoutine(
  routineData: Omit<PresetRoutine, 'id' | 'trainerId'>
): Promise<{ success: true; newPreset: PresetRoutine } | { success: false; error: string }> {
  try {
    const headers = await getAuthHeaders();
  const response = await fetch(apiUrl('/preset-routines/'), {
      method: 'POST',
      headers,
      body: JSON.stringify(routineData),
    });

    const data = await handleApiResponse(response);
    return data; // Should return { success: true, newPreset: PresetRoutine }
  } catch (error) {
    console.error('Error creating preset routine:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create preset routine'
    };
  }
}

/**
 * Fetch all preset routines for the authenticated trainer
 */
export async function fetchPresetRoutines(): Promise<PresetRoutine[]> {
  try {
    const headers = await getAuthHeaders();
  const response = await fetch(apiUrl('/preset-routines/'), {
      method: 'GET',
      headers,
    });

    const data = await handleApiResponse(response);
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    console.error('Error fetching preset routines:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch preset routines');
  }
}

/**
 * Fetch preset routines by difficulty level
 */
export async function fetchPresetRoutinesByLevel(
  level: 'beginner' | 'intermediate' | 'advanced'
): Promise<PresetRoutine[]> {
  try {
    const headers = await getAuthHeaders();
  const response = await fetch(apiUrl(`/preset-routines/level/${level}/`), {
      method: 'GET',
      headers,
    });

    const data = await handleApiResponse(response);
    return data.presets || [];
  } catch (error) {
    console.error(`Error fetching ${level} preset routines:`, error);
    throw new Error(error instanceof Error ? error.message : `Failed to fetch ${level} preset routines`);
  }
}

/**
 * Get a specific preset routine by ID
 */
export async function getPresetRoutine(id: number): Promise<PresetRoutine> {
  try {
    const headers = await getAuthHeaders();
  const response = await fetch(apiUrl(`/preset-routines/${id}/`), {
      method: 'GET',
      headers,
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching preset routine:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch preset routine');
  }
}

/**
 * Update an existing preset routine
 */
export async function updatePresetRoutine(
  id: number,
  routineData: Omit<PresetRoutine, 'id' | 'trainerId'>
): Promise<{ success: true; preset: PresetRoutine } | { success: false; error: string }> {
  try {
    const headers = await getAuthHeaders();
  const response = await fetch(apiUrl(`/preset-routines/${id}/`), {
      method: 'PUT',
      headers,
      body: JSON.stringify(routineData),
    });

    const data = await handleApiResponse(response);
    return data; // Should return { success: true, preset: PresetRoutine }
  } catch (error) {
    console.error('Error updating preset routine:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update preset routine'
    };
  }
}

/**
 * Delete a preset routine
 */
export async function deletePresetRoutine(
  id: number
): Promise<{ success: true; message?: string } | { success: false; error: string }> {
  try {
    const headers = await getAuthHeaders();
  const response = await fetch(apiUrl(`/preset-routines/${id}/`), {
      method: 'DELETE',
      headers,
    });

    const data = await handleApiResponse(response);
    return data; // Will safely return { success: true, message: 'Deleted successfully' }
  } catch (error) {
    console.error('Error deleting preset routine:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete preset routine',
    };
  }
}

/**
 * Duplicate an existing preset routine
 */
export async function duplicatePresetRoutine(
  id: number
): Promise<{ success: true; newPreset: PresetRoutine } | { success: false; error: string }> {
  try {
    const headers = await getAuthHeaders();
  const response = await fetch(apiUrl(`/preset-routines/${id}/duplicate/`), {
      method: 'POST',
      headers,
    });

    const data = await handleApiResponse(response);
    return data; // Should return { success: true, newPreset: PresetRoutine }
  } catch (error) {
    console.error('Error duplicating preset routine:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to duplicate preset routine'
    };
  }
}

/**
 * Get preset routine statistics
 */
export async function getPresetRoutineStats(): Promise<{
  success: true;
  stats: {
    total_presets: number;
    by_level: {
      beginner: number;
      intermediate: number;
      advanced: number;
    };
    total_exercises: number;
  };
} | { success: false; error: string }> {
  try {
    const headers = await getAuthHeaders();
  const response = await fetch(apiUrl('/preset-routines/stats/'), {
      method: 'GET',
      headers,
    });

    const data = await handleApiResponse(response);
    return data;
  } catch (error) {
    console.error('Error fetching preset routine stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats'
    };
  }
}

/**
 * Bulk delete preset routines
 */
export async function bulkDeletePresetRoutines(
  ids: number[]
): Promise<{ success: true; message: string } | { success: false; error: string }> {
  try {
    const headers = await getAuthHeaders();
  const response = await fetch(apiUrl('/preset-routines/bulk-delete/'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ ids }),
    });

    const data = await handleApiResponse(response);
    return data;
  } catch (error) {
    console.error('Error bulk deleting preset routines:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete presets'
    };
  }
}

type ApiSuccess<T> = { success: true; data: T };
type ApiFailure    = { success: false; message?: string };

export async function getInterests(): Promise<ApiSuccess<Interest[]> | ApiFailure> {
  const headers = await getAuthHeaders();
  const res = await fetch(apiUrl('/interests/'), { headers });
  if (!res.ok) return { success: false, message: 'Failed to fetch interests' };
  const data: Interest[] = await res.json();
  return { success: true, data };
}

export async function createInterest(payload: { name: string }): Promise<ApiSuccess<Interest> | ApiFailure> {
  const headers = await getAuthHeaders();
  const res = await fetch(apiUrl('/interests/'), {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { success: false, message: err.detail || 'Failed to create interest' };
  }
  const data: Interest = await res.json();
  return { success: true, data };
}

// --- Forgot Password ---
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  // MOCK: In a real app, this would call your backend endpoint.
  // The backend would handle token generation and sending the email.
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`Password reset requested for email: ${email}`);

  // Simulate success regardless of whether the email exists to prevent email enumeration.
  return {
    success: true,
    message: "If an account with this email exists, a password reset link has been sent.",
  };
}
