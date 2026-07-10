import { describe, it, expect, beforeEach } from 'vitest'
import { fileService, type UploadInput } from '../file-service'

describe('File Service', () => {
  describe('upload validation', () => {
    it('rejects unknown category', async () => {
      const input: UploadInput = {
        filename: 'test.pdf',
        mimeType: 'application/pdf',
        size: 100,
        data: Buffer.from('test'),
        category: 'UNKNOWN' as never,
      }
      await expect(fileService.upload(input)).rejects.toThrow(/Unknown file category/)
    })

    it('rejects file exceeding size limit', async () => {
      const input: UploadInput = {
        filename: 'big.pdf',
        mimeType: 'application/pdf',
        size: 10 * 1024 * 1024 + 1, // 10MB + 1 byte (COA limit is 5MB)
        data: Buffer.alloc(10 * 1024 * 1024 + 1),
        category: 'COA',
      }
      await expect(fileService.upload(input)).rejects.toThrow(/exceeds max/)
    })

    it('rejects disallowed MIME type', async () => {
      const input: UploadInput = {
        filename: 'test.exe',
        mimeType: 'application/x-msdownload',
        size: 100,
        data: Buffer.from('test'),
        category: 'COA',
      }
      await expect(fileService.upload(input)).rejects.toThrow(/not allowed/)
    })

    it('accepts and uploads a valid PDF for COA', async () => {
      const input: UploadInput = {
        filename: 'coa-001.pdf',
        mimeType: 'application/pdf',
        size: 1000,
        data: Buffer.from('%PDF-1.4 test content'),
        category: 'COA',
      }
      const result = await fileService.upload(input)
      expect(result.id).toBeTruthy()
      expect(result.filename).toBe('coa-001.pdf')
      expect(result.mimeType).toBe('application/pdf')
      expect(result.size).toBe(1000)
      expect(result.storageKey).toContain('COA/')
      expect(result.checksum).toHaveLength(64) // SHA-256 hex
      expect(result.url).toBeTruthy()
    })

    it('accepts image for EVIDENCE category', async () => {
      const input: UploadInput = {
        filename: 'evidence.jpg',
        mimeType: 'image/jpeg',
        size: 5000,
        data: Buffer.from('fake jpeg data'),
        category: 'EVIDENCE',
      }
      const result = await fileService.upload(input)
      expect(result.category).toBe('EVIDENCE')
      expect(result.storageKey).toContain('EVIDENCE/')
    })
  })

  describe('download', () => {
    it('downloads a previously uploaded file', async () => {
      const input: UploadInput = {
        filename: 'download-test.pdf',
        mimeType: 'application/pdf',
        size: 100,
        data: Buffer.from('downloadable content'),
        category: 'DOCUMENT',
      }
      const uploaded = await fileService.upload(input)
      const downloaded = await fileService.download(uploaded.storageKey)
      expect(downloaded.toString()).toBe('downloadable content')
    })
  })

  describe('category limits', () => {
    it('EVIDENCE allows images and PDFs up to 10MB', async () => {
      const input: UploadInput = {
        filename: 'photo.png',
        mimeType: 'image/png',
        size: 5 * 1024 * 1024,
        data: Buffer.alloc(5 * 1024 * 1024),
        category: 'EVIDENCE',
      }
      const result = await fileService.upload(input)
      expect(result.size).toBe(5 * 1024 * 1024)
    })
  })
})
