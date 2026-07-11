/**
 * File Upload Security — Additional Tests
 *
 * Extended tests for MIME detection edge cases and validation presets.
 */

import { describe, it, expect } from 'vitest'
import {
  detectMimeType,
  validateFileUpload,
  FILE_VALIDATION_PRESETS,
} from '@/core/security/file-upload-security'

describe('File Upload — MIME Detection Edge Cases', () => {
  it('detects JPEG with different segment markers', () => {
    const buffers = [
      [0xFF, 0xD8, 0xFF, 0xE0], // JFIF
      [0xFF, 0xD8, 0xFF, 0xE1], // EXIF
      [0xFF, 0xD8, 0xFF, 0xE2], // ICC profile
      [0xFF, 0xD8, 0xFF, 0xE3], // Other
    ]
    for (const bytes of buffers) {
      expect(detectMimeType(new Uint8Array(bytes))).toBe('image/jpeg')
    }
  })

  it('detects PNG with full 8-byte signature', () => {
    const buffer = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
    expect(detectMimeType(buffer)).toBe('image/png')
  })

  it('detects GIF87a and GIF89a', () => {
    const gif87a = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x37, 0x61])
    const gif89a = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
    expect(detectMimeType(gif87a)).toBe('image/gif')
    expect(detectMimeType(gif89a)).toBe('image/gif')
  })

  it('detects WebP (RIFF header)', () => {
    const buffer = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00])
    expect(detectMimeType(buffer)).toBe('image/webp')
  })

  it('detects PDF with version variations', () => {
    const versions = ['%PDF-1.4', '%PDF-1.5', '%PDF-1.6', '%PDF-1.7', '%PDF-2.0']
    for (const v of versions) {
      const buffer = new Uint8Array(Buffer.from(v, 'latin1'))
      expect(detectMimeType(buffer)).toBe('application/pdf')
    }
  })

  it('detects ZIP-based formats (DOCX, XLSX)', () => {
    const buffer = new Uint8Array([0x50, 0x4B, 0x03, 0x04])
    expect(detectMimeType(buffer)).toBe('application/zip')
  })

  it('detects OLE2 (old DOC format)', () => {
    const buffer = new Uint8Array([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])
    expect(detectMimeType(buffer)).toBe('application/msword')
  })

  it('detects plain text with various content', () => {
    const texts = ['Hello', '12345', '!@#$%', 'a', 'Hello\nWorld']
    for (const text of texts) {
      const buffer = new Uint8Array(Buffer.from(text))
      expect(detectMimeType(buffer)).toBe('text/plain')
    }
  })

  it('returns null for binary garbage', () => {
    const buffer = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05])
    expect(detectMimeType(buffer)).toBeNull()
  })

  it('returns null for very short buffer', () => {
    expect(detectMimeType(new Uint8Array([0xFF]))).toBeNull()
  })

  it('handles buffer with trailing bytes after signature', () => {
    const buffer = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46])
    expect(detectMimeType(buffer)).toBe('image/jpeg')
  })

  it('preserves text detection with special chars', () => {
    const text = 'line1\n\tline2\rcol3'
    const buffer = new Uint8Array(Buffer.from(text))
    expect(detectMimeType(buffer)).toBe('text/plain')
  })
})

describe('File Upload — Validation Presets (extended)', () => {
  it('images preset rejects .exe extension', async () => {
    const buffer = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0xFF, 0xD9])
    const result = await validateFileUpload(buffer, 'malicious.exe', FILE_VALIDATION_PRESETS.images)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.code === 'INVALID_EXTENSION')).toBe(true)
  })

  it('images preset rejects .html extension', async () => {
    const buffer = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0xFF, 0xD9])
    const result = await validateFileUpload(buffer, 'page.html', FILE_VALIDATION_PRESETS.images)
    expect(result.valid).toBe(false)
  })

  it('images preset rejects .js extension', async () => {
    const buffer = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0xFF, 0xD9])
    const result = await validateFileUpload(buffer, 'script.js', FILE_VALIDATION_PRESETS.images)
    expect(result.valid).toBe(false)
  })

  it('documents preset accepts .pdf', async () => {
    const buffer = new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x35,
      ...new Array(100).fill(0),
    ])
    const result = await validateFileUpload(buffer, 'doc.pdf', FILE_VALIDATION_PRESETS.documents)
    expect(result.errors.find((e) => e.code === 'INVALID_EXTENSION')).toBeUndefined()
  })

  it('documents preset rejects .jpg', async () => {
    const buffer = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0xFF, 0xD9])
    const result = await validateFileUpload(buffer, 'photo.jpg', FILE_VALIDATION_PRESETS.documents)
    expect(result.valid).toBe(false)
  })

  it('pdf preset has 20MB size limit', () => {
    expect(FILE_VALIDATION_PRESETS.pdf.maxBytes).toBe(20 * 1024 * 1024)
  })

  it('attachments preset accepts .txt', async () => {
    const buffer = new Uint8Array(Buffer.from('Hello, World!'))
    const result = await validateFileUpload(buffer, 'notes.txt', FILE_VALIDATION_PRESETS.attachments)
    expect(result.errors.find((e) => e.code === 'INVALID_EXTENSION')).toBeUndefined()
  })

  it('attachments preset accepts .csv', async () => {
    const buffer = new Uint8Array(Buffer.from('a,b,c\n1,2,3'))
    const result = await validateFileUpload(buffer, 'data.csv', FILE_VALIDATION_PRESETS.attachments)
    expect(result.errors.find((e) => e.code === 'INVALID_EXTENSION')).toBeUndefined()
  })

  it('attachments preset rejects .exe', async () => {
    const buffer = new Uint8Array([0x4D, 0x5A]) // MZ header (EXE)
    const result = await validateFileUpload(buffer, 'program.exe', FILE_VALIDATION_PRESETS.attachments)
    expect(result.valid).toBe(false)
  })

  it('attachments preset rejects .bat', async () => {
    const buffer = new Uint8Array(Buffer.from('@echo off'))
    const result = await validateFileUpload(buffer, 'script.bat', FILE_VALIDATION_PRESETS.attachments)
    expect(result.valid).toBe(false)
  })

  it('attachments preset rejects .sh', async () => {
    const buffer = new Uint8Array(Buffer.from('#!/bin/bash'))
    const result = await validateFileUpload(buffer, 'script.sh', FILE_VALIDATION_PRESETS.attachments)
    expect(result.valid).toBe(false)
  })

  it('all presets enable virus scan', () => {
    for (const preset of Object.values(FILE_VALIDATION_PRESETS)) {
      expect(preset.scanForViruses).toBe(true)
    }
  })
})

describe('File Upload — SHA-256 Hash', () => {
  it('computes consistent hash for same content', async () => {
    const buffer = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0xFF, 0xD9])
    const r1 = await validateFileUpload(buffer, 'a.jpg', FILE_VALIDATION_PRESETS.images)
    const r2 = await validateFileUpload(buffer, 'b.jpg', FILE_VALIDATION_PRESETS.images)
    expect(r1.sha256).toBe(r2.sha256)
  })

  it('computes different hash for different content', async () => {
    const b1 = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0xFF, 0xD9])
    const b2 = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE1, 0xFF, 0xD9])
    const r1 = await validateFileUpload(b1, 'a.jpg', FILE_VALIDATION_PRESETS.images)
    const r2 = await validateFileUpload(b2, 'b.jpg', FILE_VALIDATION_PRESETS.images)
    expect(r1.sha256).not.toBe(r2.sha256)
  })

  it('hash is 64 characters (SHA-256 hex)', async () => {
    const buffer = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0xFF, 0xD9])
    const result = await validateFileUpload(buffer, 'test.jpg', FILE_VALIDATION_PRESETS.images)
    expect(result.sha256).toHaveLength(64)
  })

  it('hash contains only hex characters', async () => {
    const buffer = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0xFF, 0xD9])
    const result = await validateFileUpload(buffer, 'test.jpg', FILE_VALIDATION_PRESETS.images)
    expect(result.sha256).toMatch(/^[0-9a-f]{64}$/)
  })
})
