/**
 * Represents a workout session.
 */
export interface Workout {
  /**
   * The workout description.
   */
  description: string;
}

/**
 * Asynchronously retrieves a user's workouts.
 *
 * @param userId The ID of the user whose workouts to retrieve.
 * @returns A promise that resolves to a Workout object.
 */
export async function getWorkouts(userId: string): Promise<Workout[]> {
  // TODO: Implement this by calling an API.
  return [
    {
      description: 'Sample Workout 1',
    },
  ];
}
