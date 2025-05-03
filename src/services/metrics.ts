/**
 * Represents a user's key metrics.
 */
export interface Metrics {
  /**
   * The user's weight in kilograms.
   */
  weightKg: number;
}

/**
 * Asynchronously retrieves a user's metrics.
 *
 * @param userId The ID of the user whose metrics to retrieve.
 * @returns A promise that resolves to a Metrics object.
 */
export async function getMetrics(userId: string): Promise<Metrics> {
  // TODO: Implement this by calling an API.
  return {
    weightKg: 75,
  };
}
