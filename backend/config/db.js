import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "your_db_user",
  host: "localhost",
  database: "your_db_name",
  password: "your_db_password",
  port: 5432, // default PostgreSQL port
});

export default pool;
