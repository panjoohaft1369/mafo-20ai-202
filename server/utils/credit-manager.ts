/**
 * Credit management utilities for tracking and deducting user credits
 */

export enum CreditType {
  IMAGE_1K = "image_1k",
  IMAGE_2K = "image_2k",
  VIDEO = "video",
}

export const CREDIT_COSTS = {
  [CreditType.IMAGE_1K]: 5,
  [CreditType.IMAGE_2K]: 7,
  [CreditType.VIDEO]: 20,
};

export interface CreditTransaction {
  id?: string;
  userId?: string;
  apiKey?: string;
  type: CreditType;
  creditAmount: number;
  taskId?: string;
  status: "pending" | "completed" | "failed";
  createdAt?: string;
  completedAt?: string;
  metadata?: {
    resolution?: string;
    prompt?: string;
    imageUrl?: string;
  };
}

/**
 * Get credit cost for a specific operation
 */
export function getCreditCost(type: CreditType): number {
  return CREDIT_COSTS[type] || 0;
}

/**
 * Determine credit type based on resolution
 */
export function getImageCreditType(resolution: string): CreditType {
  switch (resolution.toUpperCase()) {
    case "1K":
      return CreditType.IMAGE_1K;
    case "2K":
      return CreditType.IMAGE_2K;
    default:
      return CreditType.IMAGE_1K;
  }
}

/**
 * Validate if user has enough credits
 */
export function hasEnoughCredits(
  currentCredits: number,
  requiredCredits: number,
): boolean {
  return currentCredits >= requiredCredits;
}

/**
 * TODO: Implement database functions:
 * 
 * export async function deductUserCredits(
 *   userId: string,
 *   credits: number,
 *   type: CreditType,
 *   metadata?: any
 * ): Promise<boolean> {
 *   // 1. Check if user has enough credits
 *   // 2. Deduct credits from users table
 *   // 3. Log transaction in usage_history table
 *   // 4. Return success/failure
 * }
 *
 * export async function getUserCredits(userId: string): Promise<number> {
 *   // Fetch current credit balance from database
 * }
 *
 * export async function recordUsageTransaction(
 *   transaction: CreditTransaction
 * ): Promise<void> {
 *   // Record usage in database for tracking and billing
 * }
 *
 * export async function getUserUsageHistory(
 *   userId: string,
 *   limit: number = 100
 * ): Promise<CreditTransaction[]> {
 *   // Fetch usage history for user
 * }
 */

// Mock implementations for now
const mockUserCredits: Map<string, number> = new Map();
const mockUsageHistory: CreditTransaction[] = [];

export async function deductUserCredits(
  userId: string,
  credits: number,
  type: CreditType,
  taskId?: string,
): Promise<boolean> {
  console.log(
    `[Credits] Deducting ${credits} credits from user ${userId} for ${type}`,
  );

  // TODO: Replace with database call
  // const currentCredits = await db.query('SELECT credits FROM users WHERE id = ?', [userId]);
  // if (!currentCredits || currentCredits.credits < credits) return false;
  // await db.query('UPDATE users SET credits = credits - ? WHERE id = ?', [credits, userId]);

  // Mock implementation
  const current = mockUserCredits.get(userId) || 0;
  if (current < credits) {
    console.error(
      `[Credits] User ${userId} does not have enough credits (has ${current}, needs ${credits})`,
    );
    return false;
  }

  mockUserCredits.set(userId, current - credits);

  // Log transaction
  const transaction: CreditTransaction = {
    id: `txn_${Date.now()}`,
    userId,
    type,
    creditAmount: credits,
    taskId,
    status: "completed",
    createdAt: new Date().toISOString(),
  };

  mockUsageHistory.push(transaction);
  console.log(`[Credits] Successfully deducted ${credits} credits from user ${userId}`);

  return true;
}

export async function getUserCredits(userId: string): Promise<number> {
  // TODO: Replace with database call
  // const result = await db.query('SELECT credits FROM users WHERE id = ?', [userId]);
  // return result?.credits || 0;

  return mockUserCredits.get(userId) || 0;
}

export async function recordUsageTransaction(
  transaction: CreditTransaction,
): Promise<void> {
  console.log(
    `[Credits] Recording transaction:`,
    transaction.type,
    transaction.creditAmount,
  );

  // TODO: Save to database usage_history table
  mockUsageHistory.push({
    ...transaction,
    id: transaction.id || `txn_${Date.now()}`,
    createdAt: transaction.createdAt || new Date().toISOString(),
  });
}

export async function getUserUsageHistory(
  userId: string,
  limit: number = 100,
): Promise<CreditTransaction[]> {
  // TODO: Replace with database call
  return mockUsageHistory
    .filter((t) => t.userId === userId)
    .sort((a, b) => (new Date(b.createdAt!) as any) - (new Date(a.createdAt!) as any))
    .slice(0, limit);
}

export function formatCreditType(type: CreditType): string {
  switch (type) {
    case CreditType.IMAGE_1K:
      return "تصویر 1K";
    case CreditType.IMAGE_2K:
      return "تصویر 2K";
    case CreditType.VIDEO:
      return "ویدیو";
    default:
      return type;
  }
}
