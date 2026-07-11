/**
 * File Upload Security Tests
 *
 * Tests for MIME type detection, extension validation, size limits,
 * PDF validation, image validation, and quarantine.
 */

import { describe, it, expect } from 'vitest'
import {
  detectMimeType,
  validateFileUpload,
  FILE_VALIDATION_PRESETS,
  scanForViruses,
  quarantineFile,
} from '@/core/security/file-upload-security'

describe('File Upload — MIME Type Detection (Magic Bytes)', () => {
  it('detects JPEG', () => {
    const buffer = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10])
    expect(detectMimeType(buffer)).toBe('image/jpeg')
  })

  it('detects PNG', () => {
    const buffer = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
    expect(detectMimeType(buffer)).toBe('image/png')
  })

  it('detects GIF', () => {
    const buffer = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
    expect(detectMimeType(buffer)).toBe('image/gif')
  })

  it('detects PDF', () => {
    const buffer = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x35])
    expect(detectMimeType(buffer)).toBe('application/pdf')
  })

  it('detects ZIP (and DOCX/XLSX which are ZIP)', () => {
    const buffer = new Uint8Array([0x50, 0x4B, 0x03, 0x04])
    expect(detectMimeType(buffer)).toBe('application/zip')
  })

  it('detects text/plain (printable ASCII)', () => {
    const text = 'Hello, World!'
    const buffer = new Uint8Array(Buffer.from(text))
    expect(detectMimeType(buffer)).toBe('text/plain')
  })

  it('returns null for unrecognized binary', () => {
    const buffer = new Uint8Array([0x00, 0x01, 0x02, 0x03])
    expect(detectMimeType(buffer)).toBeNull()
  })

  it('returns null for empty buffer', () => {
    expect(detectMimeType(new Uint8Array(0))).toBeNull()
  })
})

describe('File Upload — Validation', () => {
  it('validates a JPEG image against images preset', async () => {
    // JPEG: starts with FFD8FF, ends with FFD9 (EOI marker)
    const buffer = new Uint8Array([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, // JPEG header
      ...new Array(100).fill(0), // body
      0xFF, 0xD9, // EOI marker
    ])
    const result = await validateFileUpload(buffer, 'photo.jpg', FILE_VALIDATION_PRESETS.images)
    expect(result.detectedMimeType).toBe('image/jpeg')
    expect(result.errors).toHaveLength(0)
    expect(result.sha256).toHaveLength(64)
  })

  it('rejects file over size limit', async () => {
    const buffer = new Uint8Array(10 * 1024 * 1024) // 10 MB (limit is 5 MB)
    const result = await validateFileUpload(buffer, 'big.jpg', FILE_VALIDATION_PRESETS.images)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.code === 'FILE_TOO_LARGE')).toBe(true)
  })

  it('rejects file with disallowed extension', async () => {
    const buffer = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0])
    const result = await validateFileUpload(buffer, 'file.exe', FILE_VALIDATION_PRESETS.images)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.code === 'INVALID_EXTENSION')).toBe(true)
  })

  it('rejects file with MIME type mismatch (extension says .jpg, content is PDF)', async () => {
    const pdfBuffer = new Uint8Array([0x25, 0x50, 0x44, 0x46, ...new Array(100).fill(0)])
    const result = await validateFileUpload(pdfBuffer, 'fake.jpg', FILE_VALIDATION_PRESETS.images)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.code === 'INVALID_MIME_TYPE')).toBe(true)
  })

  it('accepts a PDF against pdf preset', async () => {
    const pdfBuffer = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x35, ...new Array(100).fill(0)])
    const result = await validateFileUpload(pdfBuffer, 'doc.pdf', FILE_VALIDATION_PRESETS.pdf)
    expect(result.valid).toBe(true)
  })

  it('computes SHA-256 hash of file content', async () => {
    const buffer = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0])
    const result = await validateFileUpload(buffer, 'test.jpg', FILE_VALIDATION_PRESETS.images)
    expect(result.sha256).toHaveLength(64)
  })
})

describe('File Upload — PDF Validation', () => {
  it('rejects encrypted PDFs', async () => {
    const pdfContent = `%PDF-1.5
1 0 obj
<< /Encrypt 10 0 R >>
endobj
`
    const buffer = new Uint8Array(Buffer.from(pdfContent, 'latin1'))
    const result = await validateFileUpload(buffer, 'encrypted.pdf', FILE_VALIDATION_PRESETS.pdf)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.code === 'PDF_ENCRYPTED')).toBe(true)
  })

  it('rejects PDFs with embedded JavaScript', async () => {
    const pdfContent = `%PDF-1.5
1 0 obj
<< /JavaScript /JS (alert(1)) >>
endobj
`
    const buffer = new Uint8Array(Buffer.from(pdfContent, 'latin1'))
    const result = await validateFileUpload(buffer, 'script.pdf', FILE_VALIDATION_PRESETS.pdf)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.code === 'PDF_CONTAINS_JAVASCRIPT')).toBe(true)
  })

  it('rejects PDFs with embedded files', async () => {
    const pdfContent = `%PDF-1.5
1 0 obj
<< /EmbeddedFile 5 0 R >>
endobj
`
    const buffer = new Uint8Array(Buffer.from(pdfContent, 'latin1'))
    const result = await validateFileUpload(buffer, 'embedded.pdf', FILE_VALIDATION_PRESETS.pdf)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.code === 'PDF_CONTAINS_EMBEDDED_FILE')).toBe(true)
  })
})

describe('File Upload — Validation Presets', () => {
  it('images preset allows common image types', () => {
    expect(FILE_VALIDATION_PRESETS.images.allowedMimeTypes).toContain('image/jpeg')
    expect(FILE_VALIDATION_PRESETS.images.allowedMimeTypes).toContain('image/png')
    expect(FILE_VALIDATION_PRESETS.images.allowedMimeTypes).toContain('image/webp')
    expect(FILE_VALIDATION_PRESETS.images.allowedMimeTypes).toContain('image/gif')
  })

  it('images preset has 5MB size limit', () => {
    expect(FILE_VALIDATION_PRESETS.images.maxBytes).toBe(5 * 1024 * 1024)
  })

  it('documents preset allows PDF and Office formats', () => {
    expect(FILE_VALIDATION_PRESETS.documents.allowedMimeTypes).toContain('application/pdf')
    expect(FILE_VALIDATION_PRESETS.documents.allowedMimeTypes).toContain(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
  })

  it('attachments preset has 25MB size limit', () => {
    expect(FILE_VALIDATION_PRESETS.attachments.maxBytes).toBe(25 * 1024 * 1024)
  })

  it('all presets enable content validation', () => {
    for (const preset of Object.values(FILE_VALIDATION_PRESETS)) {
      expect(preset.validateContent).toBe(true)
    }
  })
})

describe('File Upload — Virus Scan', () => {
  it('returns not-scanned when CLAMAV_HOST is not set', async () => {
    delete process.env.CLAMAV_HOST
    const result = await scanForViruses(new Uint8Array([1, 2, 3]))
    expect(result.scanned).toBe(false)
    expect(result.infected).toBe(false)
  })
})

describe('File Upload — Quarantine', () => {
  it('returns a quarantine ID', async () => {
    const result = await quarantineFile({
      buffer: new Uint8Array([1, 2, 3]),
      filename: 'suspicious.exe',
      reason: 'Failed virus scan',
      uploadedBy: 'user-1',
    })
    expect(result.quarantineId).toBeTruthy()
    expect(result.quarantineId).toContain('quarantine-')
  })
})
