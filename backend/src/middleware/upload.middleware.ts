import multer from 'multer';
import { AppError } from '../utils/errors.js';
import { ErrorCode } from '../common/texts/errorCodes.js';
import { errorMessages } from '../common/texts/strings.js';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv',
    ];

    const extension = file.originalname.toLowerCase();
    const hasAllowedExtension = ['.xlsx', '.xls', '.csv'].some((ext) => extension.endsWith(ext));

    if (allowed.includes(file.mimetype) || hasAllowedExtension) {
      cb(null, true);
      return;
    }

    cb(new AppError(400, errorMessages.financial.invalidImportFile, ErrorCode.VALIDATION_ERROR));
  },
});

export const uploadTransactionExcel = upload.single('file');
