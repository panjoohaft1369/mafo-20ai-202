/**
 * Credit management utilities for tracking and deducting user credits
 */

import { supabaseAdmin } from "./supabase-client.js";

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
 * Deduct user credits and record transaction
 */
export async function deductUserCredits(
  userId: string,
  credits: number,
  type: CreditType,
  taskId?: string,
): Promise<boolean> {
  try {
    console.log(
      `[Credits] Deducting ${credits} credits from user ${userId} for ${type}`,
    );

    // Get current user credits
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      console.error(`[Credits] User not found: ${userId}`);
      return false;
    }

    const currentCredits = userData.credits;

    if (currentCredits < credits) {
      console.error(
        `[Credits] User ${userId} does not have enough credits (has ${currentCredits}, needs ${credits})`,
      );
      return false;
    }

    // Deduct credits from user
    const { error: updateError } = await supabase
      .from("users")
      .update({
        credits: currentCredits - credits,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error(
        `[Credits] Error updating user credits:`,
        updateError.message,
      );
      return false;
    }

    // Record transaction in usage_history
    const { error: txnError } = await supabase.from("usage_history").insert([
      {
        user_id: userId,
        type,
        credit_amount: credits,
        task_id: taskId,
        status: "completed",
        metadata: {},
      },
    ]);

    if (txnError) {
      console.error(`[Credits] Error recording transaction:`, txnError.message);
      // Still return true since credits were deducted
      return true;
    }

    console.log(
      `[Credits] Successfully deducted ${credits} credits from user ${userId}`,
    );

    return true;
  } catch (error: any) {
    console.error(`[Credits] Error deducting credits:`, error.message);
    return false;
  }
}

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error(`[Credits] Error fetching user credits:`, error?.message);
      return 0;
    }

    return data.credits || 0;
  } catch (error: any) {
    console.error(`[Credits] Error:`, error.message);
    return 0;
  }
}

/**
 * Record a usage transaction
 */
export async function recordUsageTransaction(
  transaction: CreditTransaction,
): Promise<void> {
  try {
    console.log(
      `[Credits] Recording transaction:`,
      transaction.type,
      transaction.creditAmount,
    );

    const { error } = await supabase.from("usage_history").insert([
      {
        user_id: transaction.userId,
        type: transaction.type,
        credit_amount: transaction.creditAmount,
        task_id: transaction.taskId,
        status: transaction.status,
        metadata: transaction.metadata || {},
      },
    ]);

    if (error) {
      console.error(`[Credits] Error recording transaction:`, error.message);
      return;
    }

    console.log(`[Credits] Transaction recorded successfully`);
  } catch (error: any) {
    console.error(`[Credits] Error:`, error.message);
  }
}

/**
 * Get user's usage history
 */
export async function getUserUsageHistory(
  userId: string,
  limit: number = 100,
): Promise<CreditTransaction[]> {
  try {
    const { data, error } = await supabase
      .from("usage_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) {
      console.error(`[Credits] Error fetching usage history:`, error?.message);
      return [];
    }

    return data.map((record: any) => ({
      id: record.id,
      userId: record.user_id,
      type: record.type,
      creditAmount: record.credit_amount,
      taskId: record.task_id,
      status: record.status,
      createdAt: record.created_at,
      completedAt: record.completed_at,
      metadata: record.metadata,
    }));
  } catch (error: any) {
    console.error(`[Credits] Error:`, error.message);
    return [];
  }
}

/**
 * Format credit type for display
 */
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
