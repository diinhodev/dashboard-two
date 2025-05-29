const sql = require("mssql");

const config = {
  user: "SEU_USUARIO",
  password: "SUA_SENHA",
  server: "SEU_SERVIDOR",
  database: "SEU_BANCO",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

module.exports = { sql, config };
