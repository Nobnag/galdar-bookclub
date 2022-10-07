$(document).ready(function(){
    var html = '<div id="gnb">';
    html += '<div class="gnb_container">'
    html += '<a href="/" class="gnb_home_link">';
    html += '<img src="https://storage.googleapis.com/cr-resource/image/27cf9b9af0f70922d4875dd55b58aa80/galdar/ba7fe1f4c0472f401cd86f6cfacbdca2.png" class="gnb_logo" ></a>';
    html += '<div class="gnb_content">';
    html += '<a href="/" class="gnb_link">HOME</a>';
    html += '<a href="intro" class="gnb_link">ABOUT</a>';
    html += '<a href="galdarBook_list" class="gnb_link">LIST</a>';
    html += '</div>';
    
    html += '<div class="gnb_right">';
    var loginObj = getLoginObj();
    if(loginObj.loginYn == "Y"){
        if(loginObj.loginType == "ADMIN"){
            html += '<p class="gnb_btn_login">'+'관리자'+loginObj.loginNm+'님 안녕하세요'+'</p>'
            html += '<a class="gnb_btn_login" href="/"><button>로그아웃</button></a>'
            html += '<a class="gnb_btn_login" href="/mamber_"><button>회원관리</button></a>'
        }
        else if(loginObj.loginType == "NORMAL"){
            html += '<p class="gnb_btn_login">'+loginObj.loginNm+'님 안녕하세요'+'</p>'
            html += '<a class="gnb_btn_login" href="/"><button>로그아웃</button></a>'
            html += '<a class="gnb_btn_login" href="/"><button>회원가입</button></a>'
        }
    }
    else{
        html += '<a class="gnb_btn_login" href="/login"><button>로그인</button></a>'
        html += '<a class="gnb_btn_login" href="/"><button>회원가입</button></a>'
    }
    html += '</div>'
    html += '</div>'
    html += '</div>'
    $("body").prepend(html);
});

function getLoginObj(){
    var loginObj = {
        loginType: 'ADMIN', //관리자: ADMIN, 일반: NORMAL
        loginYn: 'N',
        memberNm: ''
    };

    //API 호출 (로그인 상태 확인)

    //로그인 여부 값을 리턴한다.
    return loginObj;
}
