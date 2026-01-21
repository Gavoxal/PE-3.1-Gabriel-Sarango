import fp from "@fastify-plugin";
import jwt from "@fastify/jwt";
import dotenv from "dotenv";
dotenv.config();

async function authPlugin(fastify, options) {
    fastify.register(jwt, {
        secret: process.env.JWT_SECRET,
    });

    fastify.decorate('authenticate', async function (request, reply) {
        try {
            await request.jwtVerify();
        } catch (error) {
            reply.status(401).send({
                error: 'Unauthorized',
                message: 'Token invalido'
            });
        }
    })

    //verificar si el usuario es admin 
    fastify.decorate('requiereAdmin', async function (request, reply) {
        try {
            if (user.role !== 'admin') {
                reply.status(403).send({
                    error: 'Forbidden',
                    message: 'Admin role required'
                });
            }
        } catch (error) {
            reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Error al verificar el rol'
            });
        }
    })
}

export default fp(authPlugin);