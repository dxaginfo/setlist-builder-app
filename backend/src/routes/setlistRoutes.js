const express = require('express');
const { body, param } = require('express-validator');
const setlistController = require('../controllers/setlistController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * /api/setlists:
 *   get:
 *     summary: Get all setlists for the current user
 *     tags: [Setlists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of setlists
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, setlistController.getSetlists);

/**
 * @swagger
 * /api/setlists/{id}:
 *   get:
 *     summary: Get a specific setlist by ID
 *     tags: [Setlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Setlist ID
 *     responses:
 *       200:
 *         description: Setlist details
 *       404:
 *         description: Setlist not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/:id',
  authenticate,
  [param('id').isUUID().withMessage('Invalid setlist ID format')],
  validate,
  setlistController.getSetlistById
);

/**
 * @swagger
 * /api/setlists:
 *   post:
 *     summary: Create a new setlist
 *     tags: [Setlists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *               songs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     position:
 *                       type: integer
 *                     notes:
 *                       type: string
 *     responses:
 *       201:
 *         description: Created setlist
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
    body('songs').optional().isArray().withMessage('Songs must be an array'),
    body('songs.*.id').optional().isUUID().withMessage('Song ID must be a valid UUID'),
    body('songs.*.position').optional().isInt().withMessage('Position must be an integer'),
    body('songs.*.notes').optional().isString().withMessage('Notes must be a string')
  ],
  validate,
  setlistController.createSetlist
);

/**
 * @swagger
 * /api/setlists/{id}:
 *   put:
 *     summary: Update an existing setlist
 *     tags: [Setlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Setlist ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *               songs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     position:
 *                       type: integer
 *                     notes:
 *                       type: string
 *     responses:
 *       200:
 *         description: Updated setlist
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Setlist not found
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid setlist ID format'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
    body('songs').optional().isArray().withMessage('Songs must be an array'),
    body('songs.*.id').optional().isUUID().withMessage('Song ID must be a valid UUID'),
    body('songs.*.position').optional().isInt().withMessage('Position must be an integer'),
    body('songs.*.notes').optional().isString().withMessage('Notes must be a string')
  ],
  validate,
  setlistController.updateSetlist
);

/**
 * @swagger
 * /api/setlists/{id}:
 *   delete:
 *     summary: Delete a setlist
 *     tags: [Setlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Setlist ID
 *     responses:
 *       204:
 *         description: Setlist deleted
 *       404:
 *         description: Setlist not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  '/:id',
  authenticate,
  [param('id').isUUID().withMessage('Invalid setlist ID format')],
  validate,
  setlistController.deleteSetlist
);

/**
 * @swagger
 * /api/setlists/{id}/collaborators:
 *   post:
 *     summary: Add a collaborator to a setlist
 *     tags: [Setlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Setlist ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - permissionLevel
 *             properties:
 *               userId:
 *                 type: string
 *               permissionLevel:
 *                 type: string
 *                 enum: [view, edit, admin]
 *     responses:
 *       201:
 *         description: Collaborator added
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Setlist or user not found
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:id/collaborators',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid setlist ID format'),
    body('userId').isUUID().withMessage('User ID must be a valid UUID'),
    body('permissionLevel')
      .isIn(['view', 'edit', 'admin'])
      .withMessage('Permission level must be "view", "edit", or "admin"')
  ],
  validate,
  setlistController.addCollaborator
);

/**
 * @swagger
 * /api/setlists/{id}/collaborators/{userId}:
 *   delete:
 *     summary: Remove a collaborator from a setlist
 *     tags: [Setlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Setlist ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to remove as collaborator
 *     responses:
 *       204:
 *         description: Collaborator removed
 *       404:
 *         description: Setlist not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  '/:id/collaborators/:userId',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid setlist ID format'),
    param('userId').isUUID().withMessage('User ID must be a valid UUID')
  ],
  validate,
  setlistController.removeCollaborator
);

module.exports = router;