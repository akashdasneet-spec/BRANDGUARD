/**
 * Document Processing Engine for BrandGuard
 * Extracts and normalizes text and metadata from PDF, DOCX, TXT, and images.
 */

// @ts-expect-error - Support both default (v1) and named (v2) exports of pdf-parse
import pdfParse, { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

export interface ProcessedDocument {
  text: string;
  html?: string;
  metadata: {
    fileType: string;
    fileName: string;
    pageCount?: number;
    wordCount: number;
    charCount: number;
  };
  error?: string;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_EXTENSIONS = new Set([
  'pdf',
  'docx',
  'txt',
  'png',
  'jpg',
  'jpeg',
  'webp',
]);

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

/**
 * Extracts plain text and metadata from a PDF buffer using pdf-parse.
 */
export async function extractTextFromPDF(
  buffer: Buffer,
  fileName: string
): Promise<ProcessedDocument> {
  try {
    let text = '';
    let pageCount: number | undefined;

    // Check for PDFParse class (v2 API)
    if (typeof PDFParse === 'function') {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      text = result.text || '';
      pageCount = result.total;
      if (typeof parser.destroy === 'function') {
        await parser.destroy();
      }
    } else if (typeof (pdfParse as unknown) === 'function') {
      // Fallback for v1 function API
      const fn = pdfParse as unknown as (
        buf: Buffer
      ) => Promise<{ text: string; numpages: number }>;
      const result = await fn(buffer);
      text = result.text || '';
      pageCount = result.numpages;
    } else {
      throw new Error('PDF parsing library is unavailable.');
    }

    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];

    return {
      text,
      metadata: {
        fileType: 'pdf',
        fileName,
        pageCount,
        wordCount: words.length,
        charCount: text.length,
      },
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      text: '',
      metadata: {
        fileType: 'pdf',
        fileName,
        wordCount: 0,
        charCount: 0,
      },
      error: `PDF extraction failed: ${errorMessage}`,
    };
  }
}

/**
 * Extracts raw text and HTML from a DOCX buffer using mammoth.
 */
export async function extractTextFromDOCX(
  buffer: Buffer,
  fileName: string
): Promise<ProcessedDocument> {
  try {
    const [rawTextResult, htmlResult] = await Promise.all([
      mammoth.extractRawText({ buffer }),
      mammoth.convertToHtml({ buffer }),
    ]);

    const text = rawTextResult?.value ?? '';
    const html = htmlResult?.value ?? '';
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];

    return {
      text,
      html,
      metadata: {
        fileType: 'docx',
        fileName,
        wordCount: words.length,
        charCount: text.length,
      },
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      text: '',
      metadata: {
        fileType: 'docx',
        fileName,
        wordCount: 0,
        charCount: 0,
      },
      error: `DOCX extraction failed: ${errorMessage}`,
    };
  }
}

/**
 * Validates an uploaded file for size limits, allowed extensions/MIME types,
 * and security concerns like path traversal.
 */
export function validateFileUpload(
  fileName: string,
  mimeType: string,
  sizeBytes: number
): { valid: boolean; error?: string } {
  if (!fileName || typeof fileName !== 'string' || fileName.trim().length === 0) {
    return { valid: false, error: 'File name is required' };
  }

  // Check for path traversal vulnerabilities
  const normalizedName = fileName.replace(/\\/g, '/');
  if (
    fileName.includes('..') ||
    fileName.includes('/') ||
    fileName.includes('\\') ||
    fileName.includes('\0') ||
    fileName.toLowerCase().includes('%2e%2e') ||
    fileName.toLowerCase().includes('%2f') ||
    fileName.toLowerCase().includes('%5c') ||
    /^[.~/\\]/.test(fileName) ||
    normalizedName.split('/').length > 1
  ) {
    return {
      valid: false,
      error: 'Invalid file name: Path traversal sequences are not allowed',
    };
  }

  // Validate file size
  if (sizeBytes <= 0) {
    return { valid: false, error: 'Uploaded file is empty' };
  }

  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${sizeMB}MB) exceeds the maximum allowed limit of 10MB`,
    };
  }

  // Validate file extension
  const parts = fileName.split('.');
  if (parts.length < 2) {
    return { valid: false, error: 'File must have a valid extension' };
  }
  const extension = parts.pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
    return {
      valid: false,
      error: `Unsupported file extension: .${
        extension || 'unknown'
      }. Allowed types: pdf, docx, txt, png, jpg, jpeg, webp`,
    };
  }

  // Validate MIME type if provided
  if (mimeType && mimeType.trim().length > 0) {
    const normalizedMime = mimeType.toLowerCase().trim();
    if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
      return {
        valid: false,
        error: `Unsupported MIME type: ${mimeType}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Processes an uploaded file buffer based on its MIME type and returns the processed document.
 * - application/pdf: extracts text via pdf-parse
 * - application/vnd.openxmlformats-officedocument.wordprocessingml.document: extracts text and HTML via mammoth
 * - text/plain: directly converts buffer to string
 * - image/png, image/jpeg, image/webp: returns metadata only with placeholder text
 * - Throws error for unsupported types.
 */
export async function processUploadedFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ProcessedDocument> {
  const normalizedMime = mimeType?.toLowerCase().trim() || '';
  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  // 1. PDF
  if (normalizedMime === 'application/pdf' || extension === 'pdf') {
    return extractTextFromPDF(buffer, fileName);
  }

  // 2. DOCX
  if (
    normalizedMime ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    normalizedMime === 'application/msword' ||
    extension === 'docx'
  ) {
    return extractTextFromDOCX(buffer, fileName);
  }

  // 3. Plain Text
  if (normalizedMime === 'text/plain' || extension === 'txt') {
    const text = buffer.toString('utf-8');
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
    return {
      text,
      metadata: {
        fileType: 'txt',
        fileName,
        wordCount: words.length,
        charCount: text.length,
      },
    };
  }

  // 4. Image Types
  const isImage =
    normalizedMime === 'image/png' ||
    normalizedMime === 'image/jpeg' ||
    normalizedMime === 'image/jpg' ||
    normalizedMime === 'image/webp' ||
    ['png', 'jpg', 'jpeg', 'webp'].includes(extension);

  if (isImage) {
    return {
      text: '[Image content - use AI visual analysis]',
      metadata: {
        fileType: extension || 'image',
        fileName,
        wordCount: 0,
        charCount: 0,
      },
    };
  }

  // 5. Unsupported file type
  throw new Error(`Unsupported file type: ${mimeType || fileName}`);
}
