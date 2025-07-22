/**
 * Health check routes
 */
const express = require('express');
const router = express.Router();
const { basicHealthCheck, detailedHealthCheck } = require('../controllers/healthController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     description: Returns basic health information about the API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *       500:
 *         description: API is not healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: DOWN
 *                 error:
 *                   type: string
 *                   example: Database connection failed
 */
router.get('/', basicHealthCheck);

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check
 *     description: Returns detailed health information about the API and system
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detailed health information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [UP, DOWN, DEGRADED]
 *                   example: UP
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 system:
 *                   type: object
 *                   properties:
 *                     platform:
 *                       type: string
 *                       example: linux
 *                     memory:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: string
 *                           example: 16 GB
 *                         free:
 *                           type: string
 *                           example: 8 GB
 *                         usage:
 *                           type: string
 *                           example: 50%
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: Connected
 *                     name:
 *                       type: string
 *                       example: airdrops-geo
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User is not an admin
 */
router.get('/detailed', protect, admin, detailedHealthCheck);

module.exports = router;
