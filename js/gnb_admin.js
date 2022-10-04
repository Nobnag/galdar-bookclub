$(document).ready(function(){
    var html = '<div id="gnb">';
    html += '<div class="gnb_container">'
    html += '<a href="https://galdar.kr/" class="gnb_home_link">';
    html += '<img src="galdar_logo.png" class="gnb_logo" ></a>';
    html += '<div class="gnb_content">';
    html += '<a href="https://galdar.kr/" class="gnb_link">HOME</a>';
    html += '<a href="login.html" class="gnb_link">ABOUT</a>';
    html += '<a href="join.html" class="gnb_link">LIST</a>';
    html += '</div>';
    html += '<div class="gnb_right">';
    html += '<p class="gnb_btn_login">회원 이름</p>'
    html += '<a class="gnb_btn_login" href="login.html"><button>로그아웃</button></a>'
    html += '<a class="gnb_btn_login" href="join.html"><button>회원관리</button></a>'
    html += '</div>'
    html += '</div>'
    html += '</div>'
    $("body").prepend(html);
});
