<template>

</template>
<script>
viewer.value.addHandler('canvas-click', async (event: any) => {
  if (!event.originalEvent.shiftKey) { // 쉬프트 키를 누르지 않았을 때
    const clickPos = viewer.value.viewport.pointFromPixel(event.position);
    const canvasPos = {
      x: clickPos.x * viewer.value.source.width,
      y: clickPos.y * viewer.value.source.height
    };

    let itemClicked = false;

    // 클릭된 아이템 확인
    for (const item of drawPath.value) {
      const itemPos = item;
      const width = 40; // 아이템의 너비
      const height = 40; // 아이템의 높이

      // 클릭된 아이템 확인
      if (
          canvasPos.x >= itemPos.posX && canvasPos.x <= (itemPos.posX + width) &&
          canvasPos.y >= itemPos.posY && canvasPos.y <= (itemPos.posY + height)
      ) {
        itemClicked = true;
        if (event.originalEvent.ctrlKey) { // 컨트롤 키를 눌렀을 때
          const element = document.createElement('ol');
          element.className = 'overlayElement';
          element.id = 'overlayElement';
          element.setAttribute('data-category-id', categoryId);
          element.setAttribute('data-class-nm', item.classNm);
          element.style.width = '40px';
          element.style.backgroundColor = color;
          element.style.height = '40px';
          element.style.position = 'absolute';
          element.style.opacity = '0.5';

          const posX = parseFloat(itemPos.posX);
          const posY = parseFloat(itemPos.posY);
          const overlayRect = viewer.value.viewport.imageToViewportRectangle(posX, posY, 40, 40); // 이미지 좌표를 뷰포트 좌표로 변환
          viewer.value.addOverlay({
            element: element,
            location: overlayRect
          });
        }
        // 클릭된 아이템이 있으므로 더 이상의 처리는 필요 없음
        break;
      }
    }

    // 아무것도 클릭되지 않았을 때의 처리
    if (!itemClicked) {
      for (const item of drawPath.value) {
        const itemPos = item;
        const width = 40; // 아이템의 너비
        const height = 40; // 아이템의 높이

        // 클릭된지 확인
        if (
            canvasPos.x >= itemPos.posX && canvasPos.x <= (itemPos.posX + width) &&
            canvasPos.y >= itemPos.posY && canvasPos.y <= (itemPos.posY + height)
        ) {
          // 클릭된 아이템 처리
          const categoryId = item.categoryId;
          const color = 'lightgreen'; // 연한 연두색
          const classInfo = rbcInfoPathAfter.value.find((category: any) => category.categoryId === categoryId)?.classInfo.find(classItem => classItem.classNm === item.classNm);
          if (classInfo) {
            moveRbcClass.value = item;
            const existingOverlay = document.getElementById('overlayElement');
            if (existingOverlay) {
              viewer.value.removeOverlay(existingOverlay);
            }

            // 이전 오버레이의 위치를 업데이트합니다.
            const previousOverlay = document.querySelector(`.overlayElement[data-category-id="${categoryId}"][data-class-nm="${item.classNm}"]`);
            if (previousOverlay) {
              const posX = parseFloat(itemPos.posX);
              const posY = parseFloat(itemPos.posY);
              const overlayRect = viewer.value.viewport.imageToViewportRectangle(posX, posY, 40, 40); // 이미지 좌표를 뷰포트 좌표로 변환
              viewer.value.updateOverlay(previousOverlay, overlayRect);
            } else {

              // 이전 오버레이가 없으면 새로 생성합니다.
              const element = document.createElement('ol');
              element.className = 'overlayElement';
              element.id = 'overlayElement';
              element.setAttribute('data-category-id', categoryId);
              element.setAttribute('data-class-nm', item.classNm);
              element.style.width = '40px';
              element.style.backgroundColor = color;
              element.style.height = '40px';
              element.style.position = 'absolute';
              element.style.opacity = '0.5';

              const posX = parseFloat(itemPos.posX);
              const posY = parseFloat(itemPos.posY);
              const overlayRect = viewer.value.viewport.imageToViewportRectangle(posX, posY, 40, 40); // 이미지 좌표를 뷰포트 좌표로 변환
              viewer.value.addOverlay({
                element: element,
                location: overlayRect
              });
            }
          }
        }
      }
    }
  } else { // 쉬프트 키를 눌렀을 때
    // 전체 그림을 그리는 로직 추가
    selectAllItems();
  }
});
</script>