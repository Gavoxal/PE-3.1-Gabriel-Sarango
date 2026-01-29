import { pool } from '../config/database.js';

export default async function auditRoutes(fastify, options) {
    //get
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const limit = Number(request.query.limit) || 50;
            const [records] = await pool.query('SELECT * FROM audit_log LIMIT ?', [limit]);
            return reply.status(200).send({
                message: 'Registros obtenidos exitosamente',
                count: records.length,
                records
            });
        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    });




}