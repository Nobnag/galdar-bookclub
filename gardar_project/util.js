// $( document ).ready(function() {
    const reader = new FileReader();
        
    reader.onload = (readerEvent) => {
        document.querySelector(".real-upload").setAttribute("src", readerEvent.target.result);
    };

    document.querySelector("#upload_file").addEventListener("change", (changeEvent) => {

        const imgFile = changeEvent.target.files[0];
        reader.readAsDataURL(imgFile);

        const fileName = document.getElementById("file_route");
        fileName.value = imgFile.name;
        //파일 이름을 띄워줌
    })
// });