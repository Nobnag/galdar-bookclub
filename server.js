var express = require('express')
var app = express()
const port = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
// 쿠키
var {sql, poolPromise} = require('./db');
// var path = require('path');
// app ~~xxxxx ~~~ 이거 한 객채를 api로 칭하는거 같음
const session = require('express-session');
// 세션 사용하기위함
const cors = require("cors");
// cors 사용하기위함
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

/**
 * Multer 미들웨어는 파일 업로드를 위해 사용되는 multipart/form-data에서 사용된다.
 * 다른 폼으로 데이터를 전송하면 적용이 안된다.
 * Header의 명시해서 보내주는게 좋다.
 */
 const path = require('path');
 const multer  = require('multer');
 const upload = multer({ 
    /*
    dest: __dirname+'/uploads/', // 이미지 업로드 경로
    */
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, 'uploads/');
        },
        filename: function (req, file, cb) {
          cb(null, new Date().valueOf() + path.extname(file.originalname));
        }
    }),
});

app.use("/uploads", express.static(__dirname + "/uploads"));
app.use("/js", express.static(__dirname + "/js"));
app.use("/css", express.static(__dirname + "/css"));
app.use("/img", express.static(__dirname + "/img"));


app.use(session({
    secret: '12345',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(cors());
//회원가입한다.
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
            .query('SELECT Email FROM Member WHERE Email=@Email');
            
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

//로그인 한다.
app.post('/login_process', async(req,res) => {
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_Email', sql.NVarChar, req.body.Email)
            .input('vi_Pw', sql.NVarChar, req.body.Pw)
            .execute('[sp_login]');
            
        if(result.recordset.length > 0){
            req.session.MemberIdx = result.recordset[0].MemberIdx;
            req.session.Email = result.recordset[0].Email;
            req.session.Nickname = result.recordset[0].Nickname;
            req.session.PremiumMemberYn = result.recordset[0].PremiumMemberYn;
            req.session.AdminYn = result.recordset[0].AdminYn;
            req.session.Pw = result.recordset[0].Pw;
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
                MemberIdx: req.session.MemberIdx,
                Email: req.session.Email,
                Nickname: req.session.Nickname,
                PremiumMemberYn: req.session.PremiumMemberYn,
                AdminYn: req.session.AdminYn,
                // Pw: req.session.Pw
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

//회원관리페이지 회원정보 불러오기+페이징
app.get('/api/getmember_info', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            // .input('vi_MemberIdx', req.query.MemberIdx)
            .input('v_search', req.query.search)
            .input('vi_pageNo', req.query.page_no)
            .input('vi_pageSize', req.query.page_size)
            // .query('SELECT MemberIdx,Email,Pw,Nickname,Contact,Convert(nvarchar(16),JoinDatetime,121) as JoinDatetime,PremiumMemberYn,AdminYn FROM Member WHERE MemberIdx = MemberIdx')
            .execute('[sp_getmember_info]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err)
    }
});
//fo비밀번호 변경페이지에서 회원의 비밀번호를 변경한다.
app.post('/api/Pw_change', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_Email', req.body.Email)
            .input('vi_Pw', req.body.Pw)
            .execute('[sp_pw_update]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err)
    }
});
//bo회원관리페이지에서 선택된 회원의 비밀번호를 초기화한다.
app.post('/api/MemberPwReset', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_MemberIdx', req.body.MemberIdx)
            .input('vi_pw', 0)
            .execute('[sp_pw_Reset]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err)
    }
});

//회원관리 페이지에서 해당 라인을 클릭시 불러온다.
app.get('/api/getNickname', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_MemberIdx', req.query.MemberIdx)
            // .query('SELECT MemberIdx,Nickname FROM Member WHERE MemberIdx = @MemberIdx')
            .execute('[sp_select_member_RP]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err)
    }
});


//회원관리 페이지에서 회원의 정보를 인풋박스에 있는걸로 업데이트 한다.
app.post('/api/MemberUpdate', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_MemberIdx', req.body.MemberIdx)
            .input('vi_Email', req.body.Email)
            // .input('vi_Pw', req.body.Pw)
            .input('vi_Nickname', req.body.Nickname)
            .input('vi_Contact', req.body.Contact)
            .input('vi_PremiumMemberYn', req.body.PremiumMemberYn)
            .input('vi_AdminYn', req.body.AdminYn)
            // .query('SELECT MemberIdx,Nickname FROM Member WHERE MemberIdx = @MemberIdx')
            .execute('[sp_member_update]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err)
    }
});

//회원관리 페이지에서 회원의 정보를 삭제 한다.
app.post('/api/Memberdelete', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_MemberIdx', req.body.MemberIdx)
            .execute('[sp_member_delete]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err)
    }
});

app.get('/Pw_change',function(req,res) {
    res.sendFile(__dirname + "/Pw_change.html")
});

app.get('/', function(req,res) {
    res.sendFile(__dirname + "/galdar_list.html")
});

app.get('/join',function(req,res) {
    res.sendFile(__dirname + "/join.html")
});

app.get('/login',function(req,res) {
    res.sendFile(__dirname + "/login.html")
});

app.get('/intro',function(req,res) {
    res.sendFile(__dirname + "/intro.html")
});
// app.get('/galdarBook_list',function(req,res) {
//     res.sendFile(__dirname + "/galdarBook_list.html")
// });
//회원관리페이지
app.get('/mbmng',function(req,res) {
    res.sendFile(__dirname + "/MBMng.html")
});

BigInt.prototype.toJSON = function() { return this.toString(); };






// 정민

// 내 정보로 이동
app.get('/myInfo',function(req,res){
    res.sendFile(__dirname + '/myInfo.html');
});

// DB의 내정보 화면에 불러오기
app.post('/api/getMyInfo', async function(req, res){
    try {
        const pool = await poolPromise
        let result = await pool.request()
            .input('vi_MemberIdx',req.body.member_idx)
            .execute('[sp_myInfo_select_byUser]');
        res.json(result);
    } catch(err){
        res.status(500);
        res.send(err);
    }
});

// API - 닉네임 중복확인
app.post('/api/NicknameDup', async (req,res) => {
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('Nickname', req.body.Nickname)
            .query('SELECT Nickname FROM Member WHERE Nickname=@Nickname');
            
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

// API(회원정보 U) - 수정한 회원정보를 DB로 보낸다.
app.post('/api/updateMyInfo', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_MemberIdx', req.body.member_idx)
            .input('vi_Nickname', req.body.updated_nickname)
            .input('vi_Contact', req.body.updated_contact)
            .execute('[sp_myInfo_update_byUser]')
            if(result.recordset.length > 0){
                req.session.Nickname = req.body.updated_nickname;
            }
        res.json(result)
    } catch(err) {
        res.status(500);
        res.send(err);
    }
});

// 도서 상세 페이지로 이동
app.get('/book_detail',function(req,res){
    res.sendFile(__dirname + '/book_detail.html');
});

// API - 도서 상세 정보를 가져온다. 
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

// API(한줄평 C) - 작성한 한줄평을 DB에 보낸다.
app.post('/api/submitSR', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_MemberIdx', req.body.member_idx)
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

// API(한줄평 수정시 내용 R)
app.get('/api/getSRContent', async function(req, res){
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('vi_BookIdx', req.query.book_idx)
            .input('vi_SRWriter', req.query.sr_writer)
            .query('select SRContent from SR where SRWriter = @vi_SRWriter and BookIdx = @vi_BookIdx')
        res.json(result);           
    } catch(err) {
        res.status(500);
        res.send(err);
    }
});

// API(한줄평 R) - DB에서 한줄평을 불러온다.
app.get('/api/getSR', async function(req,res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_BookIdx', req.query.book_idx)
            .execute('[sp_sr_select_byAdmin]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err);
    }
});

// API(한줄평 U) - 수정한 한줄평을 DB로 보낸다.
app.post('/api/updateSR', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            // .input('vi_SRIdx', req.query.sr_idx)
            .input('vi_SRContent', req.body.sr_updated)
            .input('vi_SRWriter', req.body.sr_writer)
            .execute('[sp_sr_update_byUser]')
        res.json(result)
    } catch(err) {
        res.status(500);
        res.send(err);
    }
});

// API(한줄평 D) - 한줄평을 DB에서 삭제한다.
app.post('/api/deleteSR', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_SRContent', req.body.sr_content)
            .input('vi_SRWriter', req.body.sr_writer)
            .execute('[sp_sr_delete_byUser]')
        res.json(result)
    } catch(err) {
        res.status(500);
        res.send(err);
    }
});

// API(줄글 서평 C) - 작성한 서평을 DB에 보낸다.
app.post('/api/submitMR', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_MemberIdx', req.body.member_idx)
            .input('vi_BookIdx', req.body.book_idx)
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

// API(줄글 서평 R) - DB에서 서평을 불러온다.
app.get('/api/getMR', async function(req,res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_BookIdx', req.query.book_idx)
            .input('vi_pageNo', req.query.page_no)
            .input('vi_pageSize', req.query.page_size)
            .execute('[sp_mr_select_byAdmin]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err);
    }
});

// API(줄글서평 상세) - DB에서 서평 데이터를 불러온다.
app.get('/api/getMRdetail', async function(req,res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_MRIdx', req.query.mr_idx)
            .execute('[sp_mr_detail_byAdmin]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err);
    }
});

// API(줄글서평 수정) - DB의 서평 데이터를 수정한다.
app.post('/api/updateMR', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_MRIdx', req.body.mr_idx)
            .input('vi_MRWriter', req.body.mr_writer)
            .input('vi_MRTitle', req.body.mr_title)
            .input('vi_MRContent', req.body.mr_content)
            .execute('[sp_mr_update_byUser]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err);
    }
});

// API(줄글서평 삭제) - DB의 서평 데이터를 삭제한다.
app.post('/api/deleteMR', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_MRIdx', req.body.mr_idx)
            .input('vi_MRWriter', req.body.mr_writer)
            .execute('[sp_mr_delete_byUser]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err);
    }
});

// API(북토크 대화록 C) - 작성한 대화록을 DB에 보낸다.
app.post('/api/submitBT', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_BookIdx', req.body.book_idx)
            .input('vi_BtRecordContent', req.body.bt_content)
            .input('vi_BtRecordWriter', req.body.bt_writer)
            .execute('[sp_btr_create_byAdmin]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err)
    }
});

// API(북토크 대화록 R) - DB에서 대화록을 불러온다.
app.get('/api/getBT', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_BookIdx', req.query.book_idx)
            .execute('[sp_btr_select_byAdmin]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err);
    }
});

// API(북토크 대화록 U) - DB의 데이터를 수정한다.
app.post('/api/updateBT', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_BookIdx', req.body.book_idx)
            .input('vi_BtRecordWriter', req.body.bt_writer)
            .input('vi_BtRecordContent', req.body.bt_updated)
            .execute('[sp_btr_update_byAdmin]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err);
    }
});

// API(북토크 대화록 D) - DB에서 대화록을 삭제한다.
app.post('/api/deleteBT', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_BookIdx', req.body.book_idx)
            .input('vi_BtRecordWriter', req.body.bt_writer)
            .execute('[sp_btr_delete_byAdmin]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err);
    }
});

// API(댓글 C) - 작성 댓글을 DB에 보낸다.
app.post('/api/submitReply', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_MemberIdx', req.body.member_idx)
            .input('vi_BookIdx', req.body.book_idx)
            .input('vi_ReplyWriter', req.body.reply_name)
            .input('vi_ReplyContent', req.body.reply_content)
            // .input('vi_ReplyNonMemberPw', req.body.reply_pw)
            .execute('[sp_reply_create_byUser]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err)
    }
});

// API(댓글 R) - DB에서 댓글을 불러온다.
app.get('/api/getReply', async function(req,res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_BookIdx', req.query.book_idx)
            .input('vi_pageNo', req.query.page_no)
            .input('vi_pageSize', req.query.page_size)
            .execute('[sp_reply_select_byAdmin]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err);
    }
});

// API(댓글 D) - 댓글을 DB에서 삭제한다.
app.post('/api/deleteReply', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_MemberIdx', req.body.member_idx)
            .input('vi_ReplyIdx', req.body.reply_idx)
            .input('vi_ReplyWriter', req.body.reply_writer)
            // .input('vi_ReplyNonMemberPw', req.body.reply_pw)
            .execute('[sp_reply_delete_byUser]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err);
    }
});


// 두환
// 1. 도서 리스트(홈) 이동
app.get('/galdar_list', function(req, res){
    res.sendFile(__dirname + '/galdar_list.html');
});

//도서글 업데이트(관리자) 이동
app.get('/galdar_manage',function(req, res){
    res.sendFile(__dirname + '/galdar_manage.html');
});

// 2. 도서 등록 페이지 이동
app.get('/galdar_reg', function(req, res){
    res.sendFile(__dirname + '/galdar_reg.html');
});

//더보기
// API(도서목록 R) - DB에서 도서목록 조회를 불러온다.
// req.body.StartBookIdx - 시작할 책 IDX
// req.body.ListCnt - 1회당 조회할 갯수
app.post('/galdar_list', async function(req,res){
    try {
        let query = "";
        if(typeof(req.body.StartBookIdx) == "undefined"){
            query = 'SELECT TOP '+req.body.ListCnt+' BookIdx, BookTitle, BookImg_url, CONVERT(CHAR(10), BookBtDate, 23) as BookBtDate FROM BOOK ORDER BY BookIdx DESC';
        }
        else{
            query = 'SELECT TOP '+req.body.ListCnt+' BookIdx, BookTitle, BookImg_url, CONVERT(CHAR(10), BookBtDate, 23) as BookBtDate FROM BOOK WHERE BookIdx <= '+req.body.StartBookIdx+' ORDER BY BookIdx DESC';
        }

        const pool = await poolPromise;
        let result = await pool.request()            
            .query(query);
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err)
    }
});


// API - 등록 페이지에서 입력한 정보들을 DB로 전송한다.
app.post('/api/createBook', upload.single('bookImg'), async function(req, res){
    try {
        const { fieldname, originalname, encoding, mimetype, destination, filename, path, size } = req.file
        const { name } = req.body;

        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_BookTitle', req.body.BookTitle)
            .input('vi_BookAuthor', req.body.BookAuthor)
            .input('vi_BookPublisher', req.body.BookPublisher)
            .input('vi_BookTranslator', req.body.BookTranslator)
            .input('vi_BookPubDate', req.body.BookPubDate)
            .input('vi_BookBtDate', req.body.BookBtDate)
            .input('vi_BookCategory', req.body.BookCategory)
            .input('vi_BookRegWriter', req.body.BookRegWriter)
            .input('vi_BookDesc', req.body.BookDesc)
            .input('vi_BookImg', filename)
            .input('vi_BookImg_url', req.body.image_url)
            .execute('[sp_book_register_byAdmin]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err)
    }
});

//관리자 글쓰기버튼
//DB에서 관리자정보 로그인 API를 가져온다.
app.get('/api/getLoginAdmin', function(req,res) {
    try {
        if(typeof(req.session.Email) == "undefined" ){
            res.status(401);
            res.json({"result":"false"});
        }
        else{
            res.json({
                Email: req.session.Email,
                AdminYn: req.session.AdminYn,
            });
        }
    } catch (err) {
        res.status(500);
        res.send(err);
    }
});

// API - 도서 정보를 가져온다. 
app.get('/api/getBookData', async function(req, res){
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

// API - DB 도서리스트를 삭제한다.
app.post('/api/deleteList', async function(req, res){
    try {
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_BookIdx', parseInt(req.body.book_idx))
            .input('vi_BookUpdateUser', req.body.BookRegWriter)
            .execute('[sp_book_delete_byAdmin]')
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(err);
    }
});
// API - DB 도서리스트를 수정한다.
app.post('/api/updateBook', upload.single('bookImg'), async function(req, res){
    try {
        //const { fieldname, originalname, encoding, mimetype, destination, filename, path, size } = req.file
        const pool = await poolPromise;
        let result = await pool.request()
            .input('vi_BookIdx', req.body.book_idx)
            .input('vi_BookTitle', req.body.BookTitle)
            .input('vi_BookAuthor', req.body.BookAuthor)
            .input('vi_BookPublisher', req.body.BookPublisher)
            .input('vi_BookTranslator', req.body.BookTranslator)
            .input('vi_BookPubDate', req.body.BookPubDate)
            .input('vi_BookBtDate', req.body.BookBtDate)
            .input('vi_BookCategory', req.body.BookCategory)
            .input('vi_BookUpdateUser', req.body.BookRegWriter)
            .input('vi_BookDesc', req.body.BookDesc)
            //.input('vi_BookImg', filename)
            .input('vi_BookImg_url', req.body.image_url)
            .execute('[sp_book_update_byAdmin]')
        res.json(result);
    } catch(err) {
        console.log(err);
        res.status(500);
        res.send(err)
    }
});

// 따옴표 안에는 https://projectgbc.herokuapp.com 이후에 올 주소를 넣으면 됨.

app.listen(port, function() {
    console.log('3000 실행');
});