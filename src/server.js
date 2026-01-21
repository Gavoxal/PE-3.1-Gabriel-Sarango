import dotenv from "dotenv";
import fastify from "fastify";
dotenv.config();

//habilita los logs automaticamente
const app = fastify({
    logger: true
});

//plugins
import cors from "@fastify/cors";

//rutas


//configuracion a la base de datos 
import { testConnection } from "./config/database.js";


async function startServer() {
    try {
        await testConnection();
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error);
    }
}

startServer();


