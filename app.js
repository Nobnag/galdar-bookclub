var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
// 쿠키
var {sql, poolPromise} = require('./server');
// var path = require('path');
// app ~~xxxxx ~~~ 이거 한 객채를 api로 칭하는거 같음
const session = require('express-session');
// 세션 사용하기위함
const cors = require("cors");
// cors 사용하기위함
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

app.use("/js", express.static(__dirname + "/js"));
app.use("/css", express.static(__dirname + "/css"));

app.use(session({
    secret: '12345',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(cors());

app.post('/member', async(req,res) => {
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_Email', req.body.Email)
            .input('vi_Pw', req.body.Pw)
            .input('vi_Nickname', req.body.Nickname)
            .input('vi_Contact', req.body.Contact)
            .input('vi_PremiumMemberYn', 0)
            .input('vi_AdminYn', 0)
            .execute('[sp_member_create]')
        res.json(result);
    } catch (err) {
        res.status(300);
        res.send(err);
    }
});

app.post('/login_process', async(req,res) => {
        try {
            const pool = await poolPromise;
            let result = await pool.request()
                .input('Email', sql.NVarChar, req.body.Email)
                .input('Pw', sql.NVarChar, req.body.Pw)
                .query('SELECT MemberIdx, Email FROM Member WHERE Email = @Email AND Pw = @Pw');
            
            if(result.recordset.length > 0){
                req.session.Email = result.recordset[0].Email;
                req.session.MemberIdx = result.recordset[0].MemberIdx;
                res.json({"result":"true"});
            }
            else{
                res.json({"result":"false"});
            }
        } catch (err) {
            res.status(300);
            res.send(err);
        }
    });
    

// app.post('/login_process',function(req,res) {
//     const Email = req.query.Email;
//     const Pw = req.query.Pw;
//     console.log("Email: "+Email+", Pw: "+Pw);

//     pool.postConnection()
//     .then(conn => {
    
//       conn.query("SELECT MemberIdx, Email FROM Member WHERE Email = '"+Email+"' AND Pw = '"+pw+"'")
//         .then((result) => {
//             if(result.length > 0){
//                 req.session.Email = Email;
//                 req.session.MemberIdx = result[0].MemberIdx;
//             }
//             else{
//             }

//           console.log(res); 
//           conn.end();
          
//           if(typeof(req.session.Email) == "undefined"){
//             res.json({"result":"false"});
//           }
//           else{
//             res.json({"result":"true"});
//           }
//         })
//         .catch(err => {
//           console.log(err); 
//           conn.end();
//         })
        
//     }).catch(err => {
//     });
// });

app.get('/', function(req,res) {
    res.sendFile(__dirname + "/join.html")
    //res.sendFile(path.resolve('../join.html'));
});

app.get('/',function(req,res) {
    res.sendFile(__dirname + "/join.html")
});
app.get('/login',function(req,res) {
    res.sendFile(__dirname + "/login.html")
});
app.get('/intro',function(req,res) {
    res.sendFile(__dirname + "/intro.html")
});
app.get('/galdarBook_list',function(req,res) {
    res.sendFile(__dirname + "/galdarBook_list.html")
});

BigInt.prototype.toJSON = function() { return this.toString(); };


app.listen(3000, function() {
    console.log('3000 실행');
});