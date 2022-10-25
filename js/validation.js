var idRegExp = /^[a-zA-z0-9]{4,12}$/; //아이디 유효성검사
//var reg = /^[가-힣]{2,4}$/; // 한글 이름 2~4자 이내
//var reg = /^[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/; // 영문 이름 2~10자 이내 : 띄어쓰기(\s)가 들어가며 First, Last Name 형식
// 한글 또는 영문 사용하기(혼용X)
var NicknameRegExp = /^[가-힣]{2,6}|[a-zA-Z]{2,10}|s[a-zA-Z]{2,10}$/; // "|"를 사용
var ContactRegExp = /[0-9]/;
var EmailRegExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
var YnRegExp = /[0-1]/;