
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
    if(typeof(loginObj) != "undefined"){
        if(loginObj.AdminYn == "1"){
            html += '<p class="gnb_btn_login">'+'관리자'+loginObj.Nickname+'님 안녕하세요'+'</p>'
            html += '<a class="gnb_btn_login" href="#" onClick="logout()"><button>로그아웃</button></a>'
            html += '<a class="gnb_btn_login" href="/mamber_"><button>회원관리</button></a>'
        }
        else if(loginObj.AdminYn == "0"){
            html += '<p class="gnb_btn_login">'+loginObj.Nickname+'님 안녕하세요'+'</p>'
            html += '<a class="gnb_btn_login" href="#" onClick="logout()"><button>로그아웃</button></a>'
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

/*
    로그인 객체를 가져온다.
    리턴:
    - 로그인되지 않았으면, undefined를 리턴한다.
    - 로그인 되었으면, 로그인 객체를 전달한다.
      전달되는 객체는 다음과 같다.
        {
            "Email":"aaa@aaa.aaa",
            "Nickname":"노뱅",
            "PremiumMemberYn":"1",
            "AdminYn":"1"
        }
*/
function getLoginObj(){
    var loginObj = undefined;

    $.ajax({
        type: 'GET',
        url: '/api/getLoginInfo',
        dataType: 'json',
        async: false,
        success: function(result){
            loginObj = result;
        },error: function(jqXHR,textStatus,errorThrown) {
            if(jqXHR.status == 401){
                loginInfo = undefined;
                //alert("로그인이 필요합니다.");
                //로그인 페이지로 이동
                //location.href="로그인페이지링크";
            }
        }
    });
    //로그인 여부 값을 리턴한다.
    return loginObj;
};

function logout(){
    $.ajax({
        type: 'GET',
        url: '/api/logout',
        dataType: 'json',
        async: false,
        success: function(result){
        },
        error: function(jqXHR,textStatus,errorThrown) {
        },
        complete:function(){
            location.replace("/");
        }
    });
}