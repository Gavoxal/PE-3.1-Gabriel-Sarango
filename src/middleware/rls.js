/*
1. el usuario envia request con JWT
2. JWT contiene el id y el username "Gabo"
3. Middleware agregar un WHERE para userid = 1
4. Query: SELECT * FROM records WHERE userid = 1
5. Usuario solo ve sus registros
*/

export function builtRLSFilter(user) {
    if (user.role === 'admin') {
        return { clause: "1=1", param: [] };
    }
    return { clause: "user_id = ?", param: [user.id] };
}

//verificar si el usuario es dueño de un registro en especcifico
export async function verifyOwnership(pool, table, recordId, userId) {
    const [rows] = await pool.execute(`Select user_id from ${table} WHERE id = ?, ${recordId}`);
    if (rows.length === 0) { return false; } //registro no existe
    return rows[0].user_id === userId; //Es el dueño del registro?
}

export default { builtRLSFilter, verifyOwnership };
