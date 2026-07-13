import React, { useEffect, useState } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { CustomModal } from '../../../common/components/CustomModal';
import { ClayButton } from '../../../common/components/ClayButton';
import { useApp } from '../../../data/api/AppContext';
import { transactionsApi } from '../../../data/api/transactionsApi';
import { unwrapApiResult } from '../../../modules/auth/types/authTypes';
import type { ImportFormat, ImportJob } from '../../../data/models/transactions/types/importTypes';
import { strings } from '../../../common/texts/strings';

interface ImportTransactionsModalProps {
  onClose: () => void;
  onImportComplete?: () => void;
}

const POLL_INTERVAL_MS = 1500;

export const ImportTransactionsModal: React.FC<ImportTransactionsModalProps> = ({ onClose, onImportComplete }) => {
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
          onImportComplete?.();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check import status');
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [job, refreshFinancials, onImportComplete]);

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
    <CustomModal
      title="Import Transactions"
      titleAddon={<FileSpreadsheet size={24} className="text-accent" />}
      onClose={onClose}
      onPrimary={handleImport}
      primaryText={isUploading ? 'Starting...' : isProcessing ? 'Importing...' : 'Start Import'}
      secondaryText={strings.cancel}
      primaryDisabled={!selectedFile || isUploading || isProcessing}
      className="max-w-4xl max-h-[90vh] overflow-y-auto"
      stickyHeader
    >
      {error && <p className="modal-error text-sm m-0">{error}</p>}

      <section>
        <h3 className="text-lg font-semibold text-white mb-2">Excel file format</h3>
        <p className="text-sm modal-label mb-4">
          Use the first sheet with these column headers. Stash names and theme labels must already exist in Rose Wallet.
        </p>

        {isLoadingFormat ? (
          <p className="modal-label text-sm">Loading format...</p>
        ) : format && (
          <>
            <div className="overflow-x-auto rounded-2xl border border-white/10 mb-4">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="p-3 text-left modal-label">Column</th>
                    <th className="p-3 text-left modal-label">Required</th>
                    <th className="p-3 text-left modal-label">Description</th>
                    <th className="p-3 text-left modal-label">Example</th>
                  </tr>
                </thead>
                <tbody>
                  {format.columns.map((column) => (
                    <tr key={column.name} className="border-t border-white/10">
                      <td className="p-3 text-white font-medium">{column.name}</td>
                      <td className="p-3 modal-body">{column.required ? 'Yes' : 'No'}</td>
                      <td className="p-3 modal-body">{column.description}</td>
                      <td className="p-3 modal-body">{column.example}</td>
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
                      <th key={column.name} className="p-3 text-left modal-label whitespace-nowrap">
                        {column.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {format.exampleRows.map((row, index) => (
                    <tr key={index} className="border-t border-white/10">
                      {format.columns.map((column) => (
                        <td key={column.name} className="p-3 modal-body whitespace-nowrap">
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
        <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-accent transition-colors">
          <Upload size={32} className="text-accent" />
          <span className="modal-body text-sm">
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
            <div className="flex justify-between text-sm modal-body">
              <span>
                {job.status === 'completed' ? 'Import complete' : 'Importing transactions...'}
              </span>
              <span>{job.processedRows} / {job.totalRows}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-increase flex items-center gap-1">
                <CheckCircle2 size={16} /> {job.succeededRows} succeeded
              </span>
              <span className="text-decrease flex items-center gap-1">
                <AlertCircle size={16} /> {job.failedRows} failed
              </span>
            </div>
            {job.errors.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-xl bg-white/5 p-3 space-y-2">
                {job.errors.map((item) => (
                  <p key={`${item.row}-${item.message}`} className="text-decrease text-sm m-0">
                    Row {item.row}: {item.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </CustomModal>
  );
};
