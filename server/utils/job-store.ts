export type JobStatus = "pending" | "running" | "completed" | "failed";

export interface MoveJob {
  id: string;
  status: JobStatus;
  messageIds: number[];
  sourceFolderId: string | undefined;
  targetFolderId: string | undefined;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

const jobs = new Map<string, MoveJob>();

export const createJob = (
  data: Omit<MoveJob, "id" | "status" | "createdAt" | "updatedAt">,
): MoveJob => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const job: MoveJob = {
    id,
    status: "pending",
    createdAt: now,
    updatedAt: now,
    ...data,
  };
  jobs.set(id, job);
  return job;
};

export const getJob = (id: string): MoveJob | undefined => jobs.get(id);

export const updateJob = (id: string, patch: Partial<MoveJob>): void => {
  const job = jobs.get(id);
  if (!job) return;
  jobs.set(id, { ...job, ...patch, updatedAt: new Date().toISOString() });
};
