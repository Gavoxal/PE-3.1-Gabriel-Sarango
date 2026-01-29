import dotenv from "dotenv";
import fastify from "fastify";
dotenv.config();




//plugins
import cors from "@fastify/cors";
import authPlugin from "./plugin/auth.js";

//rutas
import authRoutes from "./routes/auth.routes.js";
import recordsRoutes from "./routes/records.routes.js";
import auditRoutes from "./routes/audit.routes.js";


//habilita los logs automaticamente
const app = fastify({
    logger: true
});



//configuracion a la base de datos 
import { testConnection } from "./config/database.js";


async function startServer() {
    try {
        await testConnection();

        //registrar plugins
        await app.register(cors, {
            origin: '*'
        });
        await app.register(authPlugin);
        //registrar rutas
        await app.register(authRoutes, { prefix: '/auth' });
        await app.register(recordsRoutes, { prefix: '/records' });
        await app.register(auditRoutes, { prefix: '/audit' });

        app.get('/', async (request, reply) => {

            reply.send({ message: 'API funcionando correctamente' });
        });

        await app.listen({
            port: process.env.PORT || 3000,
            host: "0.0.0.0"
        });
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error);
    }
}

startServer();


