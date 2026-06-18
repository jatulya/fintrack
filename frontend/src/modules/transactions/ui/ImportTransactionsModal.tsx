import React, { useEffect, useState } from 'react';
import { X, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { GlassCard } from '../../../common/components/GlassCard';
import { ClayButton } from '../../../common/components/ClayButton';
import { useApp } from '../../../data/api/AppContext';
import { transactionsApi } from '../../../data/api/transactionsApi';
import { unwrapApiResult } from '../../../modules/auth/types/authTypes';
import type { ImportFormat, ImportJob } from '../../../data/models/transactions/types/importTypes';
import { strings } from '../../../common/texts/strings';

interface ImportTransactionsModalProps {
  onClose: () => void;
}

const POLL_INTERVAL_MS = 1500;

export const ImportTransactionsModal: React.FC<ImportTransactionsModalProps> = ({ onClose }) => {
  const { refreshFinancials } = useApp();
  const [format, setFormat] = useState<ImportFormat | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [job, setJob] = useState<ImportJob | null>(null);
  const [isLoadingFormat, setIsLoadingFormat] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFormat() {
      try {
        const result = await transactionsApi.getImportFormat();
        if (!cancelled) {
          setFormat(unwrapApiResult(result).format);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load import format');
        }
      } finally {
        if (!cancelled) setIsLoadingFormat(false);
      }
    }

    loadFormat();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!job || job.status === 'completed' || job.status === 'failed') return;

    const intervalId = window.setInterval(async () => {
      try {
        const result = await transactionsApi.getImportStatus(job.id);
        const nextJob = unwrapApiResult(result).job;
        setJob(nextJob);

        if (nextJob.status === 'completed') {
          await refreshFinancials();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check import status');
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [job, refreshFinancials]);

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    setError(null);
    try {
      await transactionsApi.downloadImportTemplate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download template');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    try {
      const result = await transactionsApi.startImport(selectedFile);
      setJob(unwrapApiResult(result).job);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start import');
    } finally {
      setIsUploading(false);
    }
  };

  const progressPercent = job && job.totalRows > 0
    ? Math.round((job.processedRows / job.totalRows) * 100)
    : 0;

  const isProcessing = job?.status === 'pending' || job?.status === 'processing';

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex-center p-4">
      <GlassCard className="w-full max-w-4xl p-0 overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto" dark>
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <FileSpreadsheet size={24} className="text-indigo-300" />
            <h2 className="text-xl font-bold text-white m-0">Import Transactions</h2>
          </div>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && <p className="text-rose-400 text-sm m-0">{error}</p>}

          <section>
            <h3 className="text-lg font-semibold text-white mb-2">Excel file format</h3>
            <p className="text-sm text-indigo-200 mb-4">
              Use the first sheet with these column headers. Account names and category labels must already exist in FinTrack.
            </p>

            {isLoadingFormat ? (
              <p className="text-indigo-200 text-sm">Loading format...</p>
            ) : format && (
              <>
                <div className="overflow-x-auto rounded-2xl border border-white/10 mb-4">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="p-3 text-left text-indigo-200">Column</th>
                        <th className="p-3 text-left text-indigo-200">Required</th>
                        <th className="p-3 text-left text-indigo-200">Description</th>
                        <th className="p-3 text-left text-indigo-200">Example</th>
                      </tr>
                    </thead>
                    <tbody>
                      {format.columns.map((column) => (
                        <tr key={column.name} className="border-t border-white/10">
                          <td className="p-3 text-white font-medium">{column.name}</td>
                          <td className="p-3 text-indigo-100">{column.required ? 'Yes' : 'No'}</td>
                          <td className="p-3 text-indigo-100">{column.description}</td>
                          <td className="p-3 text-indigo-100">{column.example}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-white/5">
                      <tr>
                        {format.columns.map((column) => (
                          <th key={column.name} className="p-3 text-left text-indigo-200 whitespace-nowrap">
                            {column.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {format.exampleRows.map((row, index) => (
                        <tr key={index} className="border-t border-white/10">
                          {format.columns.map((column) => (
                            <td key={column.name} className="p-3 text-indigo-100 whitespace-nowrap">
                              {row[column.name] ?? ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          <div className="flex flex-wrap gap-3">
            <ClayButton
              type="button"
              variant="secondary"
              onClick={handleDownloadTemplate}
              disabled={isDownloading}
              className="bg-white/10 text-white"
            >
              <Download size={18} className="mr-2" />
              {isDownloading ? 'Downloading...' : 'Download Template'}
            </ClayButton>
          </div>

          <section className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Upload file</h3>
            <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-indigo-400 transition-colors">
              <Upload size={32} className="text-indigo-300" />
              <span className="text-indigo-100 text-sm">
                {selectedFile ? selectedFile.name : 'Choose an .xlsx, .xls, or .csv file'}
              </span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                disabled={isProcessing}
              />
            </label>

            {job && (
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm text-indigo-100">
                  <span>
                    {job.status === 'completed' ? 'Import complete' : 'Importing transactions...'}
                  </span>
                  <span>{job.processedRows} / {job.totalRows}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 size={16} /> {job.succeededRows} succeeded
                  </span>
                  <span className="text-rose-300 flex items-center gap-1">
                    <AlertCircle size={16} /> {job.failedRows} failed
                  </span>
                </div>
                {job.errors.length > 0 && (
                  <div className="max-h-40 overflow-y-auto rounded-xl bg-white/5 p-3 space-y-2">
                    {job.errors.map((item) => (
                      <p key={`${item.row}-${item.message}`} className="text-rose-300 text-sm m-0">
                        Row {item.row}: {item.message}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          <div className="flex gap-4 pt-2">
            <ClayButton type="button" variant="secondary" onClick={onClose} className="flex-1 bg-white/10 text-white">
              {strings.cancel}
            </ClayButton>
            <ClayButton
              type="button"
              variant="primary"
              className="flex-1"
              onClick={handleImport}
              disabled={!selectedFile || isUploading || isProcessing}
            >
              {isUploading ? 'Starting...' : isProcessing ? 'Importing...' : 'Start Import'}
            </ClayButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
