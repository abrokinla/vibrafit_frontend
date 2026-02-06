import { parseISO, differenceInDays, addDays } from 'date-fns';
import axios from "axios";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

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
  plan_details?: {
    id: number;
    user?: {
      id: number;
      name: string;
    };
    trainer?: {
      id: number;
      name: string;
    };
  };
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

// Gym-related types
export interface GymData {
  id: number;
  name: string;
  description: string;
  website: string;
  phone: string;
  address: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  header_image_url: string;
  max_members: number;
  member_count: number;
  subscription_status: 'trial' | 'active' | 'expired' | 'suspended';
  subscription_start: string | null;
  subscription_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface GymMemberData {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  gym: number;
  gym_name: string;
  membership_status: 'pending' | 'active' | 'inactive' | 'suspended';
  joined_at: string;
  last_active: string;
}

export interface GymDetailsData extends GymData {
  owner_name: string;
  owner_email: string;
  stats?: {
    active_members: number;
    max_members: number;
  };
}

export interface GymOnboardingData {
  name: string;
  country: string;
  state: string;
  gymDetails: {
    description?: string;
    website?: string;
    phone?: string;
    address?: string;
    max_members?: number;
    primary_color?: string;
    secondary_color?: string;
  };
}

export async function fetchTodaysTrainerMeals(token: string): Promise<TrainerMeal[]> {
  const res = await fetch(apiUrl('/users/nutrition-plan/today/'), {
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

// Token management - Secure implementation
class TokenManager {
  private static instance: TokenManager;
  private refreshPromise: Promise<void> | null = null;
  private isRefreshing = false;
  private accessToken: string | null = null; // Store access token in memory only

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    // Refresh token is now stored in httpOnly cookie, not accessible via JavaScript
    // Return a placeholder to indicate cookie-based storage
    return 'cookie-based';
  }

  setTokens(accessToken: string, refreshToken?: string): void {
    this.accessToken = accessToken;
  }

  clearTokens(): void {
    this.accessToken = null;
    // Refresh token cookie will be cleared via logout endpoint
  }

  async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    // Prevent multiple simultaneous refresh requests
    if (this.isRefreshing) {
      await this.refreshPromise;
      return !!this.getAccessToken();
    }

    this.isRefreshing = true;

    try {
      this.refreshPromise = this.performRefresh();
      await this.refreshPromise;
      return !!this.getAccessToken();
    } catch (error) {
      this.clearTokens();
      return false;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performRefresh(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(apiUrl('/users/auth/token/refresh/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    const newAccessToken = data.access;
    const newRefreshToken = data.refresh || refreshToken; // Some systems return new refresh token

    this.setTokens(newAccessToken, newRefreshToken);
  }
}

const tokenManager = TokenManager.getInstance();

export { tokenManager };

export async function getAuthHeaders(): Promise<{ 'Content-Type': string; Authorization: string }> {
  let token = tokenManager.getAccessToken();
  if (!token) {
    // Try to refresh the token if we don't have one
    const refreshed = await tokenManager.refreshAccessToken();
    if (!refreshed) {
      throw new Error('NO_CREDENTIALS');
    }
    token = tokenManager.getAccessToken();
    if (!token) {
      throw new Error('NO_CREDENTIALS');
    }
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// Enhanced fetch wrapper with automatic token refresh
async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...(await getAuthHeaders()),
      ...options.headers,
    },
  });

  // If we get a 401, try to refresh token once
  if (response.status === 401) {
    const refreshed = await tokenManager.refreshAccessToken();
    if (refreshed) {
      // Retry with new token
      response = await fetch(url, {
        ...options,
        headers: {
          ...(await getAuthHeaders()),
          ...options.headers,
        },
      });
    }
  }

  return response;
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
  const profileUrl = apiUrl('/users/profile/');

  const headers = await getAuthHeaders();

  const userRes = await fetch(profileUrl, { headers });

  if (!userRes.ok) {
    const responseText = await userRes.text();
    console.error('Profile fetch error response:', responseText);
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
  const trainerRes = await fetch(apiUrl('/users/trainer-profile/profile/'), { headers });
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
    interests?: number[];
  }
): Promise<{ success: boolean; message?: string }> {
  const headers = await getAuthHeaders();
  const url = apiUrl('/trainer/onboard/');

  console.log('API CALL DEBUG: completeTrainerOnboarding (NEW ENDPOINT)', {
    userId,
    url,
    method: 'POST',
    headers: { ...headers, Authorization: headers.Authorization ? '[REDACTED]' : undefined },
    data
  });

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  console.log('API RESPONSE DEBUG:', {
    url,
    status: res.status,
    statusText: res.statusText,
    ok: res.ok
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.log('API ERROR DEBUG - Complete response:', {
      status: res.status,
      statusText: res.statusText,
      url,
      errorData,
      fullResponse: errorData
    });

    // Log detailed field validation errors if available
    if (errorData.errors) {
      console.error('VALIDATION ERRORS from backend:', errorData.errors);
    }
    if (errorData.errors && typeof errorData.errors === 'string' &&
        errorData.errors.includes('Missing required trainer fields')) {
      console.error('BACKEND FIELD VALIDATION ERROR:', {
        errorDetail: errorData.errors,
        expectedFields: ['bio', 'certifications', 'experience_years', 'specializations'],
        sentData: data
      });
    }
    return { success: false, message: errorData.message || errorData.errors || 'Onboarding failed' };
  }

  const responseData = await res.json().catch(() => ({}));
  console.log('API SUCCESS DEBUG:', responseData);
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
  await fetch(apiUrl('/users/metrics/'), {
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
  const res = await fetch(apiUrl('/users/messages/conversations/'), { headers });
  if (!res.ok) throw new Error('Failed to fetch conversations');
  return res.json();
}

export async function fetchMessages(otherUserId: number): Promise<Message[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(apiUrl(`/users/messages/?with_user=${otherUserId}`), { headers });
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function sendMessage(recipientId: number, content: string): Promise<Message> {
  const headers = await getAuthHeaders();
  const res = await fetch(apiUrl('/users/messages/'), {
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
  const res = await fetch(apiUrl('/users/messages/mark_conversation_read/'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ other_user_id: otherUserId }),
  });
  if (!res.ok) throw new Error('Failed to mark conversation as read');
}

export async function fetchActiveClientCount(): Promise<number> {
  const headers = await getAuthHeaders();
  const response = await fetch(apiUrl('/users/trainer-profile/clients/'), {
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
export async function fetchTimelinePosts(authorId?: string): Promise<Post[]> {
  const headers = await getAuthHeaders();
  const url = authorId
    ? apiUrl(`/users/posts/?author=${authorId}`)
    : apiUrl('/users/posts/');

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error('Failed to fetch timeline posts');
  }

  const posts = await response.json();
  return posts;
}

export async function likePost(postId: string): Promise<{ liked: boolean; likes_count: number }> {
  const headers = await getAuthHeaders();
  const response = await fetch(apiUrl(`/users/posts/${postId}/like/`), {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to like/unlike post');
  }

  return response.json();
}

export async function createPost(content: string, mediaUrl?: string, mediaType?: 'image' | 'video'): Promise<{ success: boolean; newPost?: Post }> {
  const headers = await getAuthHeaders();

  const postData: any = { content };
  if (mediaUrl) {
    if (mediaType === 'image') {
      postData.image_url = mediaUrl;
    } else if (mediaType === 'video') {
      postData.video_url = mediaUrl;
    }
  }

  const response = await fetch(apiUrl('/users/posts/'), {
    method: 'POST',
    headers,
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    throw new Error('Failed to create post');
  }

  const newPost = await response.json();
  return { success: true, newPost };
}

export async function uploadPostMedia(file: File, mediaType: 'image' | 'video' = 'image'): Promise<{ url: string; public_id?: string; type: string }> {
  const headers = await getAuthHeaders();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', mediaType);

  const response = await fetch(apiUrl('/users/posts/upload-media/'), {
    method: 'POST',
    headers: {
      Authorization: headers.Authorization, // Keep only Authorization header
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload media');
  }

  const data = await response.json();
  return {
    url: data.url,
    public_id: data.public_id,
    type: data.type || mediaType
  };
}

export async function fetchPublicUserProfile(userId: string): Promise<PublicProfileData | null> {
  if (!userId) return null;

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
  const response = await fetch(apiUrl('/users/subscriptions/pending-requests/'), {
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
    const response = await fetch(apiUrl(`/users/${clientId}/client-details/`), { headers });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch client details');
    }
    const data = await response.json();
    return data;
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
  const url = apiUrl(`/users/subscriptions/${id}/${endpoint}/`);
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
  const response = await fetch(apiUrl('/users/preset-routines/'), {
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
  const response = await fetch(apiUrl('/users/preset-routines/'), {
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
  const response = await fetch(apiUrl(`/users/preset-routines/${id}/`), {
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
  const res = await fetch(apiUrl('/users/interests/'), {
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

// --- Gym API Functions ---

/**
 * Get all gyms owned by the current user
 */
export async function fetchMyGyms(): Promise<GymData[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(apiUrl('/gyms/'), { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch gyms');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching gyms:', error);
    throw error;
  }
}

/**
 * Create a new gym
 */
export async function createGym(gymData: Partial<GymData>): Promise<GymData> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(apiUrl('/gyms/'), {
      method: 'POST',
      headers,
      body: JSON.stringify(gymData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to create gym');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating gym:', error);
    throw error;
  }
}

/**
 * Update an existing gym
 */
export async function updateGym(gymId: number, gymData: Partial<GymData>): Promise<GymData> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(apiUrl(`/gyms/${gymId}/`), {
      method: 'PATCH',
      headers,
      body: JSON.stringify(gymData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to update gym');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating gym:', error);
    throw error;
  }
}

/**
 * Get gym details for landing page (public access)
 */
export async function fetchGymDetails(gymId: number): Promise<GymDetailsData> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(apiUrl(`/gyms/${gymId}/details/`), { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch gym details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching gym details:', error);
    throw error;
  }
}

/**
 * Get public gym details by name (no auth required)
 */
export async function fetchPublicGymDetails(gymName: string): Promise<GymDetailsData> {
  try {
    const response = await fetch(apiUrl(`/gyms/gym/${gymName}/public-details/`));

    if (!response.ok) {
      throw new Error('Failed to fetch public gym details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching public gym details:', error);
    throw error;
  }
}

/**
 * Join a gym (request membership)
 */
export async function joinGym(gymId: number): Promise<{ detail: string }> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(apiUrl(`/gyms/${gymId}/join/`), {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to join gym');
    }

    return await response.json();
  } catch (error) {
    console.error('Error joining gym:', error);
    throw error;
  }
}

/**
 * Get gym members (gym owner only)
 */
export async function fetchGymMembers(gymId: number): Promise<GymMemberData[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(apiUrl(`/gyms/${gymId}/members/`), { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch gym members');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching gym members:', error);
    throw error;
  }
}

/**
 * Approve a gym member (gym owner only)
 */
export async function approveGymMember(gymId: number, userId: number): Promise<{ detail: string }> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(apiUrl(`/gyms/${gymId}/approve-member/`), {
      method: 'POST',
      headers,
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to approve member');
    }

    return await response.json();
  } catch (error) {
    console.error('Error approving gym member:', error);
    throw error;
  }
}

/**
 * Leave a gym (member action)
 */
export async function leaveGym(membershipId: number): Promise<{ detail: string }> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(apiUrl(`/members/${membershipId}/leave/`), {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to leave gym');
    }

    return await response.json();
  } catch (error) {
    console.error('Error leaving gym:', error);
    throw error;
  }
}

/**
 * Complete gym onboarding (update gym details after initial signup)
 */
export async function completeGymOnboarding(
  userId: string,
  gymId: string,
  data: GymOnboardingData
): Promise<{ success: boolean; message?: string }> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(apiUrl(`/gyms/${gymId}/onboard/`), {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, message: errorData.detail || 'Gym onboarding failed' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error completing gym onboarding:', error);
    return { success: false, message: error.message || 'Failed to complete gym onboarding' };
  }
}

// --- Password Reset ---
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(apiUrl('/users/password-reset/request/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: data.detail || "If an account with this email exists, a password reset link has been sent.",
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.detail || "Failed to send password reset email.",
      };
    }
  } catch (error) {
    console.error('Password reset request error:', error);
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
}

export async function validatePasswordResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
  try {
    const response = await fetch(apiUrl(`/users/password-reset/validate/?token=${encodeURIComponent(token)}`));

    if (response.ok) {
      const data = await response.json();
      return {
        valid: data.valid,
        email: data.email,
      };
    } else {
      return { valid: false };
    }
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false };
  }
}

export async function confirmPasswordReset(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(apiUrl('/users/password-reset/confirm/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        password: newPassword,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: data.detail || "Password reset successfully.",
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.detail || "Failed to reset password.",
      };
    }
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
}
