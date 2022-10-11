var sql = require("mssql");
var config = {
  user:'male315_gbcdb',
  password: 'projectGBC',
  server: 'sql16ssd-013.localnet.kr',
  // server: '127.0.0.1',
  database: 'male315_gbcdb',
  port:1433,
  //stream: true,
  trustServerCertificate: true
}

const poolPromise = new sql.ConnectionPool(config)
.connect()
.then(pool => {
    console.log('MS-SQL 서버가 연결 되었습니다.');
    return pool
})
.catch(err => console.log('MS-SQL 서버 연결에 실패했습니다.', err))

module.exports = { sql, poolPromise }

