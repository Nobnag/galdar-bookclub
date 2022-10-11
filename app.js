var express = require('express')
var app = express()
const port = process.env.PORT || 3000;
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

//API - 회원Email중복확인을 한다.
app.post('/api/Duplicate', async (req,res) => {
    try {
        //post사용시 비동기 await를 넣어줘야하나봄 아직 이해못함 ㅠㅠ
        const pool = await poolPromise;
        let result = await pool.request()
            .input('Email', sql.NVarChar, req.body.Email)
            .query('SELECT Email FROM Member WHERE Email= '+'Email');
            
        if(result.recordset.length > 0){
            res.json({"result":"false"});
        }
        else{
            res.json({"result":"true"});
        }
    }catch (err) {
            res.status(500);
            res.send(err);
        }
});

app.post('/login_process', async(req,res) => {
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_Email', sql.NVarChar, req.body.Email)
            .input('vi_Pw', sql.NVarChar, req.body.Pw)
            .execute('[sp_login]');
            
        if(result.recordset.length > 0){
            req.session.Email = result.recordset[0].Email;
            req.session.Nickname = result.recordset[0].Nickname;
            req.session.PremiumMemberYn = result.recordset[0].PremiumMemberYn;
            req.session.AdminYn = result.recordset[0].AdminYn;
            res.json({"result":"true"});
        }
        else{
            res.json({"result":"false"});
        }
    } catch (err) {
        res.status(500);
        res.send(err);
    }
});

//API - 로그인 정보를 가져온다.
app.get('/api/getLoginInfo', function(req,res) {
    try {
        if(typeof(req.session.Email) == "undefined" ){
            res.status(401);
            res.json({"result":"false"});
        }
        else{
            res.json({
                Email: req.session.Email,
                Nickname: req.session.Nickname,
                PremiumMemberYn: req.session.PremiumMemberYn,
                AdminYn: req.session.AdminYn,
            });
        }
    } catch (err) {
        res.status(500);
        res.send(err);
    }
});


//API - 로그아웃 한다.
app.get('/api/logout', function(req,res) {
    try {
        req.session.destroy();  // 세션 삭제
        res.clearCookie('sid'); // 세션 쿠키 삭제
        
        res.send({result: "true"});
    } catch (err) {
        res.status(500);
        res.send(err);
    }
});

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


// 정민
app.get('/book_detail',function(req,res){
    res.sendFile(__dirname + '/book_detail.html');
});

app.post('/mr_create', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_MRTitle', req.body.mr_title)
            .input('vi_MRWriter', req.body.mr_writer)
            .input('vi_MRContent', req.body.mr_content)
            .execute('[sp_mr_create_byUser]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err)
    }
});

//API - 도서 상세 정보를 가져온다.
app.get('/api/getBookDetail', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_BookIdx', req.query.book_idx)
            .execute('[sp_book_detail_select_byUser]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err)
    }
});


// API - 작성한 한줄평을 DB에 보낸다.
app.post('/api/submitSR', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_BookIdx', req.body.book_idx)
            .input('vi_SRWriter', req.body.sr_writer)
            .input('vi_SRContent', req.body.sr_content)
            .execute('[sp_sr_create_byUser]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err)
    }
});

app.listen(port, function() {
    console.log('3000 실행');
});