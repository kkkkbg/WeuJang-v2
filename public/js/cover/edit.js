const mode = document.getElementById("pageMode");
const preImage = document.getElementById("preImage");
const coverPreview = document.getElementById("coverPreview");//가림판 미리보기 화면
const previewText = document.getElementById('previewText');//문제, 답 미리보기 화면
const previewImage = document.getElementById('previewImage');//배경 이미지 
const decorationText = document.getElementById('decorationText');//꾸밈 문구
const question = document.getElementById('sample-question');//문제 미리보기
const answer = document.getElementById('sample-answer');//답 미리보기

window.addEventListener('DOMContentLoaded', () => {
    if (!preImage.value) { //기존에 저장된 이미지 없음
        previewImage.src = "";
        previewImage.style.display = "none";  // 깨진 아이콘 숨기기
    }
    else {
        previewImage.src = preImage.value;
        previewImage.style.display = "block";
    }
    coverPreview.style.backgroundColor = document.getElementById("coverBackgroundColor").value;
    coverPreview.style.opacity = parseFloat(document.getElementById("coverOpacity").value);
    decorationText.textContent = document.getElementById("textInput").value;
    decorationText.style.fontSize = parseInt(document.getElementById("textSize").value) + "px";
    decorationText.style.color = document.getElementById("textColor").value;
    question.style.color = document.getElementById("questionColor").value;
    answer.style.color = document.getElementById("answerColor").value;
    answer.style.opacity = document.getElementById("answerOpacity").value;
});

// 배경 이미지 업로드
document.getElementById("imageUpload").addEventListener("change", async (e) => {

    const file = e.target.files[0];
    if (!file) return;

    // 수정 작업 중 기존에 저장된 이미지는 가림판 저장 시에 삭제
    const isSavedImage = mode.value == "update" && preImage.value == previewImage.getAttribute('src');

    console.log("현재 설정된 이미지가 DB에 저장된 이미지와 같나요? ", isSavedImage);

    // 기존에 DB에 저장되지 않은 이미지가 업로드되어있는 경우 파일 삭제 
    if (!isSavedImage && previewImage) {

        if (previewImage.getAttribute('src').startsWith(window.location.origin + "/uploads/")) {
            const filename = previewImage.getAttribute('src').split("/uploads/")[1];
            console.log("delete filename : ", filename);
            await deleteImage(filename);
        }
        // 이미지 src 제거 및 아이콘 제거
        previewImage.src = "";
        previewImage.style.display = "none";  // 깨진 아이콘 숨기기
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
        const res = await fetch("/cover/upload-image", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (data.url) {
            previewImage.src = data.url; // 임시 가림판에 바로 반영
            previewImage.style.display = "block";
        } else {
            alert("이미지 업로드에 실패했습니다.");
        }
    } catch (err) {
        console.error(err);
        alert("서버 오류: 이미지 업로드 실패");
    }
});

// 서버에 저장된 배경 이미지 삭제
document.getElementById("deleteImageBtn").addEventListener("click", async () => {
    if (previewImage.getAttribute('src').startsWith(window.location.origin + "/uploads/")) {
        const filename = previewImage.getAttribute('src').split("/uploads/")[1];
        console.log("delete filename : ", filename);
        await deleteImage(filename);
    }
    // 이미지 src 제거 및 아이콘 제거
    previewImage.src = "";
    previewImage.style.display = "none";  // 깨진 아이콘 숨기기
    document.getElementById("imageUpload").value = '';// file value 초기화
});

// 가림판 배경 색상 변경
document.getElementById('coverBackgroundColor').addEventListener("input", (e) => {
    coverPreview.style.backgroundColor = e.target.value;
});

// 가림판 투명도 변경
document.getElementById('coverOpacity').addEventListener("input", (e) => {
    coverPreview.style.opacity = e.target.value;
});

// 문구 변경
document.getElementById('textInput').addEventListener("input", (e) => {
    decorationText.textContent = e.target.value;
});

// 문구 크기 변경
document.getElementById('textSize').addEventListener("input", (e) => {
    decorationText.style.fontSize = e.target.value + "px";
});

// 문구 색상 변경
document.getElementById('textColor').addEventListener("input", (e) => {
    decorationText.style.color = e.target.value;
});

// 문제 색상 변경
document.getElementById('questionColor').addEventListener("input", (e) => {
    document.getElementById('sample-question').style.color = e.target.value;
});

// 답 색상 변경
document.getElementById('answerColor').addEventListener("input", (e) => {
    document.getElementById('sample-answer').style.color = e.target.value;
});

// 답 투명도 변경
document.getElementById('answerOpacity').addEventListener("input", (e) => {
    document.getElementById('sample-answer').style.opacity = e.target.value;
});

// 가림판 등록
document.getElementById("saveBtn").addEventListener("click", async () => {
    if (!document.getElementById("cover-title").value) {
        alert("가림판 이름을 입력해주세요.");
        return;
    }

    const settings = {
        cover_id: document.getElementById("coverId").value,
        title: document.getElementById("cover-title").value,
        imgUrl: previewImage.getAttribute('src') || '',
        backgroundColor: document.getElementById("coverBackgroundColor").value,
        backgroundOpacity: parseFloat(document.getElementById("coverOpacity").value),
        text: document.getElementById("textInput").value,
        textSize: parseInt(document.getElementById("textSize").value),
        textColor: document.getElementById("textColor").value,
        questionColor: document.getElementById("questionColor").value,
        answerColor: document.getElementById("answerColor").value,
        answerOpacity: parseFloat(document.getElementById("answerOpacity").value),
    };

    var response = null;

    if (mode.value == "update") {
        const isSavedImage = preImage.value && mode.value == "update" && preImage.value == previewImage.getAttribute('src');
        console.log("현재 설정된 이미지가 DB에 저장된 이미지와 같나요? ", isSavedImage);

        if (!isSavedImage) {
            console.log("기존에 저장된 이미지를 삭제합니다.");
            if (preImage.value) {
                const filename = preImage.value.split("/uploads/")[1];
                // console.log("기존 delete filename : ", filename);
                await deleteImage(filename);
            }
        }
        response = await fetch("/cover/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings)
        });
    }
    else {
        response = await fetch("/cover/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings)
        });
    }

    const data = await response.json();
    alert(data.message);

    // 사용중인 가림판을 수정한 경우, 수정 정보를 바로 반영한다.
    if (data.coverOpt) {
        // localStorage에 설정 정보 저장
        localStorage.setItem("coverSettings", JSON.stringify(data.coverOpt));
    }

    if (response.ok) {
        window.location.href = "/cover/list"; //새로고침
    }
});

//이미지 삭제
async function deleteImage(filename) {
    try {
        await fetch("/cover/delete-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename })
        });
    } catch (err) {
        console.error("이미지 삭제 실패:", err);
    }
}