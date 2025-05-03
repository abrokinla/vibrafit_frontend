/**
 * Represents a meal.
 */
export interface Meal {
  /**
   * The meal description.
   */
  description: string;
}

/**
 * Asynchronously retrieves a user's meals.
 *
 * @param userId The ID of the user whose meals to retrieve.
 * @returns A promise that resolves to a Meal object.
 */
export async function getMeals(userId: string): Promise<Meal[]> {
  // TODO: Implement this by calling an API.
  return [
    {
      description: 'Sample Meal 1',
    },
  ];
}
