import { pool } from "../config/database.js";

import { builtRLSFilter, verifyOwnership } from "../middleware/rls.js";

export default async function recordsRoutes(fastify, options) {
    //vamos a pedir siempre autenticacion 
    fastify.addHook('onRequest', fastify.authenticate);

    //get
    fastify.get('/', async (request, reply) => {
        try {
            const { clause, params } = builtRLSFilter(request.user)
            const [records] = await pool.execute(`Select * from records 
                where ${clause} 
                Order by created_at desc`, params)
            return reply.send(200).send({
                message: 'Registros obtenidos con RLS',
                userId: request.user.id,
                rlsFilter: request.user.role === 'admin' ? 'ADMIN' : 'user_id = ${request.user.id}',
                count: records.length,
                records
            })

        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    });

    //post
    fastify.post('/', async (request, reply) => {
        try {
            const { amount, category, description } = request.body;
            const userId = request.user.id;
            try {
                const { result } = await pool.execute(`Insert into financial_records 
                    (amount, category, description, user_id) values (?, ?, ?, ?)`,
                    [amount, category, description, userId]);
                reply.status(201).send({
                    message: 'Registro creado exitosamente',
                    recordId: result.insertId
                })
            } catch (error) {
                reply.status(500).send({
                    error: 'Internal Server Error',
                    message: error.message
                });
            }
        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    });

    //put 
    fastify.put('/:id', async (request, reply) => {
        const { id } = request.params;
        const { amount, category, description } = request.body;
        const userId = request.user.id;

        // debemos saber cual es el rol del usuario 
        const isAdmin = request.user.role === 'admin';
        try {
            if (!isAdmin) {
                const isOwner = await verifyOwnership(pool, 'financial_records', id, userId);
                if (!isOwner) {
                    return reply.status(403).send({
                        error: 'Forbidden',
                        message: 'No tienes permiso para modificar este registro'
                    });
                }
                //si es dueño se registra
                await pool.execute(`Update financial_records 
                    set amount = ?, category = ?, description = ? 
                    where id = ?`,
                    [amount, category, description, id]);
                reply.status(200).send({
                    message: 'Registro actualizado exitosamente',
                    recordId: id
                });
            }

        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    })

    //delete
    fastify.delete('/:id', async (request, reply) => {
        const { id } = request.params;
        const userId = request.user.id;

        // debemos saber cual es el rol del usuario 
        const isAdmin = request.user.role === 'admin';
        try {
            if (!isAdmin) {
                const isOwner = await verifyOwnership(pool, 'financial_records', id, userId);
                if (!isOwner) {
                    return reply.status(403).send({
                        error: 'Forbidden',
                        message: 'No tienes permiso para eliminar este registro'
                    });
                }
                //si es dueño se registra
                await pool.execute(`Delete from financial_records 
                    where id = ?`,
                    [id]);
                reply.status(200).send({
                    message: 'Registro eliminado exitosamente',
                    recordId: id
                });
            }

        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    })

}
