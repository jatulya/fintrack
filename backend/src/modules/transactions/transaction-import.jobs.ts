import { randomUUID } from 'node:crypto';
import type { ImportJob, ImportJobStatus, ImportRowError } from './transaction-import.types.js';

const JOB_TTL_MS = 60 * 60 * 1000;

const jobs = new Map<string, ImportJob>();

function pruneExpiredJobs(): void {
  const cutoff = Date.now() - JOB_TTL_MS;
  for (const [id, job] of jobs) {
    if (new Date(job.createdAt).getTime() < cutoff) {
      jobs.delete(id);
    }
  }
}

export function createImportJob(userId: string, totalRows: number): ImportJob {
  pruneExpiredJobs();

  const job: ImportJob = {
    id: randomUUID(),
    userId,
    status: 'pending',
    totalRows,
    processedRows: 0,
    succeededRows: 0,
    failedRows: 0,
    errors: [],
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  jobs.set(job.id, job);
  return job;
}

export function getImportJob(jobId: string, userId: string): ImportJob | null {
  const job = jobs.get(jobId);
  if (!job || job.userId !== userId) return null;
  return job;
}

export function updateImportJob(
  jobId: string,
  updates: Partial<Pick<ImportJob, 'status' | 'processedRows' | 'succeededRows' | 'failedRows' | 'errors' | 'completedAt'>>,
): void {
  const job = jobs.get(jobId);
  if (!job) return;
  Object.assign(job, updates);
}

export function appendImportError(jobId: string, error: ImportRowError): void {
  const job = jobs.get(jobId);
  if (!job) return;
  job.errors.push(error);
}

export function setImportStatus(jobId: string, status: ImportJobStatus): void {
  const job = jobs.get(jobId);
  if (!job) return;
  job.status = status;
}
