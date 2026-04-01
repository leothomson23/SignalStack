import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth';
import prisma from '../lib/prisma';
import { isValidUUID, isAllowedFileExtension, sanitizeFilename } from '../utils/validation';
import { config } from '../config';
import { logAudit } from '../utils/audit';

const router = Router();

router.use(authenticate);

/**
 * POST /api/v1/files/upload
 * Upload a file attachment to a finding
 *
 * Accepts: .pdf, .png, .jpg, .jpeg, .csv
 * Max size: 10MB
 */
router.post('/upload', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        error: 'No file provided',
        message: 'Please attach a file using the "file" field',
      });
    }

    const { findingId } = req.body;
    if (!findingId || !isValidUUID(findingId)) {
      return res.status(400).json({ error: 'Valid findingId is required' });
    }

    // Verify finding exists and user has access
    const finding = await prisma.finding.findUnique({
      where: { id: findingId },
      select: { id: true, orgId: true },
    });

    if (!finding) {
      return res.status(404).json({ error: 'Finding not found' });
    }

    // Check org access
    if (req.user!.role !== 'ADMIN') {
      const membership = await prisma.organisationMember.findUnique({
        where: { userId_orgId: { userId: req.user!.id, orgId: finding.orgId } },
      });
      if (!membership) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const uploadedFile = req.files.file as any;

    // Validate file size
    if (uploadedFile.size > config.upload.maxSize) {
      return res.status(400).json({
        error: 'File too large',
        message: `Maximum file size is ${config.upload.maxSize / (1024 * 1024)}MB`,
      });
    }

    // Validate file extension
    if (!isAllowedFileExtension(uploadedFile.name, config.upload.allowedExtensions)) {
      return res.status(400).json({
        error: 'Invalid file type',
        message: `Allowed file types: ${config.upload.allowedExtensions.join(', ')}`,
      });
    }

    // Save file with original filename
    const uploadDir = path.join(config.upload.uploadDir, 'attachments', findingId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = sanitizeFilename(uploadedFile.name);
    const filePath = path.join(uploadDir, filename);

    await uploadedFile.mv(filePath);

    // Create database record
    const attachment = await prisma.fileAttachment.create({
      data: {
        findingId,
        filename,
        originalName: uploadedFile.name,
        mimeType: uploadedFile.mimetype,
        size: uploadedFile.size,
        uploadedBy: req.user!.id,
      },
    });

    await logAudit(req, 'file.uploaded', {
      attachmentId: attachment.id,
      filename,
      size: uploadedFile.size,
      findingId,
    }, finding.orgId);

    res.status(201).json({
      message: 'File uploaded successfully',
      attachment,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/files/:id
 * Download a file attachment
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const attachment = await prisma.fileAttachment.findUnique({
      where: { id },
      include: {
        finding: { select: { orgId: true } },
      },
    });

    if (!attachment) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check org access
    if (req.user!.role !== 'ADMIN') {
      const membership = await prisma.organisationMember.findUnique({
        where: { userId_orgId: { userId: req.user!.id, orgId: attachment.finding.orgId } },
      });
      if (!membership) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const filePath = path.join(
      config.upload.uploadDir,
      'attachments',
      attachment.findingId,
      attachment.filename
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.download(filePath, attachment.originalName);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/v1/files/:id
 * Delete a file attachment
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const attachment = await prisma.fileAttachment.findUnique({
      where: { id },
      include: {
        finding: { select: { orgId: true } },
      },
    });

    if (!attachment) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check access — must be uploader, org admin, or platform admin
    if (req.user!.role !== 'ADMIN' && attachment.uploadedBy !== req.user!.id) {
      const membership = await prisma.organisationMember.findUnique({
        where: { userId_orgId: { userId: req.user!.id, orgId: attachment.finding.orgId } },
      });
      if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Remove file from disk
    const filePath = path.join(
      config.upload.uploadDir,
      'attachments',
      attachment.findingId,
      attachment.filename
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.fileAttachment.delete({ where: { id } });

    await logAudit(req, 'file.deleted', {
      attachmentId: id,
      filename: attachment.originalName,
    }, attachment.finding.orgId);

    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
