/**
 * Represents a user's measurements.
 */
export interface Measurement {
  /**
   * The user's height in centimeters.
   */
  heightCm: number;
}

/**
 * Asynchronously retrieves a user's measurements.
 *
 * @param userId The ID of the user whose measurements to retrieve.
 * @returns A promise that resolves to a Measurement object.
 */
export async function getMeasurements(userId: string): Promise<Measurement> {
  // TODO: Implement this by calling an API.
  return {
    heightCm: 175,
  };
}
