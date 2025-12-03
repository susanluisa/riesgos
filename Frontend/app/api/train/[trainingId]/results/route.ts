import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { ok, fail } from "@/lib/api-response"
import { getJob } from "@/lib/jobs"

export async function GET(_req: NextRequest, { params }: { params: { trainingId: string } }) {
  const job = getJob(params.trainingId)
  if (!job || job.status !== "completed") {
    return fail("Results not available", 404)
  }
  return ok(job.results)
}
