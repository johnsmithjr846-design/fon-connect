import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ReportSchema = z.object({
  category: z.enum(["bug", "malfunction", "user", "other"]),
  reportedUserId: z.string().uuid().nullable(),
  reportedPseudo: z.string().trim().max(60).nullable(),
  problem: z.string().trim().min(3).max(2000),
  message: z.string().trim().max(2000).default(""),
  page: z.string().max(300).default(""),
});

export const submitReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => ReportSchema.parse(i))
  .handler(async ({ data, context }) => {
    if (data.category === "user" && !data.reportedUserId) {
      throw new Error("Choisissez l'utilisateur à signaler.");
    }
    const { error } = await context.supabase.from("reports").insert({
      reporter_id: context.userId,
      category: data.category,
      reported_user_id: data.category === "user" ? data.reportedUserId : null,
      reported_pseudo: data.category === "user" ? data.reportedPseudo : null,
      problem: data.problem,
      message: data.message,
      page: data.page,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type ReportRow = {
  id: string;
  category: string;
  reported_pseudo: string | null;
  problem: string;
  message: string;
  page: string;
  status: string;
  created_at: string;
};

export const listReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ReportRow[]> => {
    const { data, error } = await context.supabase
      .from("reports")
      .select("id, category, reported_pseudo, problem, message, page, status, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const setReportStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["open", "resolved"]) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("reports")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
