window.addEventListener('DOMContentLoaded', () => {
    const defaultCoverId = document.getElementById('defaultCoverId').value;
    const selectBox = document.getElementById('coverSelectbox');
    for (const option of selectBox.options) {
        if (option.value === defaultCoverId) {
            option.selected = true;
            // 선택 변경 후 이벤트 수동 발생
            selectBox.dispatchEvent(new Event('change'));
            break;
        }
    }
});

// 가림판 선택
async function chageCoverSelect() {
    try {
        // 가림판 상세 정보 조회
        const response = await fetch('/cover/options', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cover_id: document.getElementsByName("cover_id")[0].value })
        });

        const data = await response.json();
        if (!response.ok) {
            alert(data.message); // 오류 메시지
        }
        else {
            setCoverOpt(data); // 미리보기 화면 적용
        }
    } catch (error) {
        console.error('예외 발생:', error);
        alert('네트워크 오류가 발생했습니다.');
    }
}

// 기본값 설정 
async function setDefaultCover() {
    try {
        const response = await fetch('/cover/change', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cover_id: document.getElementsByName("cover_id")[0].value })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message); // 오류 메시지
        } else {
            alert('가림판 변경 성공!');
            // localStorage에 설정 정보 저장
            localStorage.setItem("coverSettings", JSON.stringify(data));
            window.location.href = '/main'; // 메인 페이지로 이동
        }
    } catch (error) {
        console.error('예외 발생:', error);
        alert('네트워크 오류가 발생했습니다.');
    }
}

// 가림판 설정 적용
function setCoverOpt(data) {
    const coverPreview = document.getElementById("coverPreview");//가림판 미리보기 화면
    const coverImage = document.getElementById("previewImage");
    const decorationText = document.getElementById('decorationText');//꾸밈 문구
    const question = document.getElementById('sample-question');//문제 미리보기
    const answer = document.getElementById('sample-answer');//답 미리보기

    if (!data.Img) {
        coverImage.src = "";
        coverImage.style.display = "none";  // 깨진 아이콘 숨기기
    }
    else {
        coverImage.src = data.Img;
        coverImage.style.display = "block";
    }
    coverPreview.style.backgroundColor = data.color;
    coverPreview.style.opacity = data.opacity;
    decorationText.textContent = data.text;
    decorationText.style.fontSize = data.text_size + "px";
    decorationText.style.color = data.text_color;
    question.style.color = data.question_color;
    answer.style.color = data.answer_color;
    answer.style.opacity = data.answer_opacity;
}

// 수정/등록 화면으로 이동
async function goCoverEdit(btnName) {
    var cover_id = "";
    if (btnName == "update") {
        cover_id = document.getElementsByName("cover_id")[0].value;
        if (cover_id == '-1') {
            alert("기본 가림판은 편집이 불가능 합니다.");
            return;
        }
    }
    else {
        // 가림판 갯수가 6개 이상이면 등록 불가
        const coverCount = document.getElementById('coverSelectbox').options.length
        if (coverCount > 5) {
            alert("최대 5개 까지만 가림판 등록이 가능합니다.");
            return;
        }
    }
    window.location.href = "/cover/edit?coverId=" + cover_id;
}

// 삭제
async function deleteCover() {
    try {
        const cover_id = document.getElementsByName("cover_id")[0].value;
        if (cover_id == '-1' || cover_id == '') {
            alert("기본 커버는 삭제가 불가능 합니다.");
            return;
        }

        if (confirm("정말 삭제하시겠습니까?")) {
            const response = await fetch('/cover/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cover_id: cover_id })
            });

            const data = await response.json();
            if (!response.ok) {
                alert(data.message);
            } else {
                alert(data.message);

                const coverImage = document.getElementById("previewImage").getAttribute('src');
                const filename = coverImage.split("/uploads/")[1];
                // 서버에 저장된 이미지 삭제 
                if (filename) await deleteImage(filename);
            }
        }
    }
    catch (error) {
        console.error('예외 발생:', error);
        alert("커버 삭제 중 오류가 발생했습니다.");
    }
    finally {
        window.location.href = "/cover/list"; //새로고침
    }
}

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