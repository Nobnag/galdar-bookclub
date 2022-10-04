$(document).ready(function(){
    var html = '<div id="gnb">';
    html += '<img src="galdar_logo.png>'
    html += '<a href="login.html" class="gnb_r">로그인</a>';
    html += '<a href="join.html" >회원가입</a>';
    html += '<div class="gnb_link">';
    html += '<a href="https://galdar.kr/">HOME</a>';
    html += '<a href="login.html">ABOUT</a>';
    html += '<a href="join.html">LIST</a>';
    html += '</div>';
    html += '</div>';
   
    $("body").prepend(html);
});
