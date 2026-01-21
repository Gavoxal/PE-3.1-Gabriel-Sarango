import bcrypt from "bcrypt";
import { pool } from "../config/database.js";

async function authRoutes(fastify, options) {
    fastify.post('/register', {
        schema: {
            body: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                    username: { type: 'string', minLength: 3 },
                    password: { type: 'string', minLength: 6 }
                }
            }
        }
    }, async (request, reply) => {
        const { username, password } = request.body;

        try {
            const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
            if (users.length == 0) {
                return reply.status(401).send({ error: 'Credenciales invalidas' });
            }
            const user = users[0];
            const validPassword = await bcrypt.compare(
                password,
                user.password_hash);

            if (!validPassword) {
                return reply.status(401).send({
                    error: 'Invalid password'
                });
            }
            const token = fastify.jwt.sign({
                username: user.username,
                role: user.role
            }, {
                expiresIn: '1h'
            });
            reply.status(200).send({
                message: 'Login exitoso',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            });


        } catch (error) {
            reply.status(500).send({
                error: 'Internal Server Error'
            });
        }
    });
}


