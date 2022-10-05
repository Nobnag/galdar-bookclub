var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var {sql, poolPromise} = require('./server');
// var path = require('path');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

app.use("/js", express.static(__dirname + "/js"));
app.use("/css", express.static(__dirname + "/css"));

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
            // .input('PremiumMemberYn', req.body.PremiumMemberYn)
            // .input('AdminYn', req.body.AdminYn)
            .execute('[sp_member_create]')
        res.json(result);
    } catch (err) {
        res.status(300);
        res.send(err);
    }
});
app.get('/', function(req,res) {
    res.sendFile(__dirname + "/join.html")
    //res.sendFile(path.resolve('../join.html'));
})

app.listen(3000, function() {
    console.log('3000 실행');
})