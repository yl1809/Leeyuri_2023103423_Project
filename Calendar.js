document.addEventListener('DOMContentLoaded', () => {
    const category = document.querySelector('.category');
    const categoryOpen = document.querySelector('#btn_create button');
    const categoryClose = document.querySelector('.close_category_popup');
    const c_event = document.querySelector('.event');
    const c_eventClose = document.querySelector('.close_event_popup');
    const eventcreate_BTN = document.querySelector('.event_create');
    const deleteEvent_BTN = document.querySelector('.delete_event'); // 삭제 버튼

    const createCategoryButton = document.querySelector('.category_create');
    const inputCategoryName = document.getElementById('input_category_name');
    const categoryList = document.getElementById('category-list');
    const calendars = {}; // 카테고리별 캘린더 인스턴스를 저장할 객체
    const contentSections = []; // 동적으로 생성된 캘린더 DIV를 저장

    let currentEvent = null; // 현재 수정 중인 이벤트를 추적하기 위한 변수

    categoryOpen.addEventListener('click', function () {
        category.style.display = 'block';
    });

    categoryClose.addEventListener('click', function () {
        category.style.display = 'none';
    });

    c_eventClose.addEventListener('click', function () {
        c_event.style.display = 'none';
        currentEvent = null; // 모달 닫을 때 currentEvent 초기화
    });

    // 새로운 카테고리 추가
    createCategoryButton.addEventListener('click', function () {
        const categoryName = inputCategoryName.value.trim();
        if (categoryName !== "") {
            // 기존 active 상태에서 active 클래스 제거
            const activeCategory = document.querySelector('.side_bar .category-link.active');
            if (activeCategory) {
                activeCategory.classList.remove('active');
            }

            // 새 카테고리 링크 추가
            const newCategoryItem = document.createElement('li');
            const newCategoryLink = document.createElement('a');
            newCategoryLink.href = "#none";
            newCategoryLink.textContent = categoryName;
            newCategoryLink.classList.add('category-link');

            newCategoryLink.addEventListener('click', function (event) {
                event.preventDefault();

                // 카테고리 클릭 시 해당 캘린더만 보이게 하기
                document.querySelectorAll('.side_bar .category-link.active').forEach(link => link.classList.remove('active'));
                newCategoryLink.classList.add('active');
                
                // 모든 캘린더 숨기기
                contentSections.forEach(section => section.style.display = 'none');
                const selectedCalendar = document.getElementById('calendar_' + categoryName);
                selectedCalendar.style.display = 'block';
            });

            newCategoryItem.appendChild(newCategoryLink);
            categoryList.appendChild(newCategoryItem);

            // 새 캘린더 영역 추가
            const newCalendarDiv = document.createElement('div');
            newCalendarDiv.id = 'calendar_' + categoryName;
            newCalendarDiv.classList.add('calendar');
            document.querySelector('.categories').appendChild(newCalendarDiv);
            contentSections.push(newCalendarDiv);  // 캘린더 DIV를 리스트에 저장

            // 캘린더 생성 및 설정
            const calendar = new FullCalendar.Calendar(newCalendarDiv, {
                initialView: 'dayGridMonth',
                customButtons: {
                    addEventButton: {
                        text: '이벤트 등록',
                        click: function () {
                            c_event.style.display = 'block';
                            document.getElementById('input_event_name').value = ''; // 이벤트 이름 초기화
                            currentEvent = null;  // 새로운 이벤트 등록 시 currentEvent 초기화
                            eventcreate_BTN.textContent = "등록";  // 버튼 텍스트 "등록"으로 설정
                            deleteEvent_BTN.style.display = 'none';  // 삭제 버튼 숨기기
                        }
                    }
                },
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'addEventButton'
                },
                events: [], // 초기엔 이벤트 없음
                eventClick: function(info) {
                    // 이벤트 클릭 시 모달 띄우기
                    c_event.style.display = 'block';
                    eventcreate_BTN.textContent = "수정";  // 버튼 텍스트 "수정"으로 설정
                    c_eventClose.style.display = 'none';  // 닫기 버튼 숨기기
                    deleteEvent_BTN.style.display = 'block';  // 삭제 버튼 보이기
                    
                    // 클릭한 이벤트의 정보를 모달에 채우기
                    document.getElementById('input_event_name').value = info.event.title;
                    document.getElementById('input_Start').value = info.event.start.toISOString().slice(0, 16);  // 'YYYY-MM-DDTHH:MM' 형식으로 변환
                    document.getElementById('input_End').value = info.event.end ? info.event.end.toISOString().slice(0, 16) : '';  // 종료 시간이 있을 때만 설정
                    document.getElementById('input_description').value = info.event.extendedProps.description || '';  // description 필드 추가
                    
                    // 현재 클릭한 이벤트를 currentEvent에 저장
                    currentEvent = info.event;
                }
            });

            calendar.render();
            calendars[categoryName] = calendar; // 카테고리별 캘린더 저장

            // 입력값 초기화 및 모달 닫기
            inputCategoryName.value = "";
            category.style.display = 'none';

            // 새 카테고리 바로 활성화
            newCategoryLink.classList.add('active');
            newCalendarDiv.style.display = 'block'; // 새 카테고리 캘린더만 보이도록 설정

            // 첫 번째 카테고리 캘린더를 제외한 나머지는 숨기기
            contentSections.forEach((section, index) => {
                if (index !== contentSections.length - 1) {
                    section.style.display = 'none';
                }
            });
        } else {
            alert("카테고리 이름을 입력하세요.");
        }
    });

    // 이벤트 수정 또는 등록 (수정 버튼 클릭 시 또는 새로운 이벤트 등록 시)
    eventcreate_BTN.addEventListener('click', function () {
        const eventName = document.getElementById('input_event_name').value;
        const eventStart = document.getElementById('input_Start').value;
        const eventEnd = document.getElementById('input_End').value;
        const eventDescription = document.getElementById('input_description').value;

        if (!eventName || !eventStart) {
            alert('이벤트 이름과 시작 날짜를 입력해주세요.');
            return;
        }

        const activeCategoryLink = document.querySelector('.side_bar .category-link.active');
        if (!activeCategoryLink) {
            alert('카테고리를 먼저 선택해주세요.');
            return;
        }

        const categoryName = activeCategoryLink.textContent.trim();
        const calendar = calendars[categoryName];

        if (currentEvent) {
            // 이벤트 수정
            currentEvent.setProp('title', eventName);
            currentEvent.setStart(eventStart);
            currentEvent.setEnd(eventEnd);
            currentEvent.setExtendedProp('description', eventDescription);
            currentEvent = null;  // 수정 후 currentEvent 초기화
            eventcreate_BTN.textContent = "등록";  // 버튼 텍스트 "등록"으로 설정
            deleteEvent_BTN.style.display = 'none'; // 삭제 버튼 숨기기
        } else {
            // 새로운 이벤트 등록
            const event = {
                title: eventName,
                start: eventStart,
                end: eventEnd,
                extendedProps: { description: eventDescription },
                editable: true
            };
            calendar.addEvent(event);
        }

        // 이벤트 추가 후 모달 입력값 초기화
        eventName.value = ''; // 이벤트 이름 리셋
        eventStart.value = ''; // 시작 날짜 리셋 (datetime-local)
        eventEnd.value = ''; // 종료 날짜 리셋 (datetime-local)
        eventDescription.value = ''; // 이벤트 설명 리셋

        c_event.style.display = 'none';
    });

    // 이벤트 삭제
    deleteEvent_BTN.addEventListener('click', function() {
        if (currentEvent) {
            // 삭제된 이벤트 제거
            currentEvent.remove();
            currentEvent = null;  // 삭제 후 currentEvent 초기화
            c_event.style.display = 'none';  // 모달 닫기
        }
    });
});
