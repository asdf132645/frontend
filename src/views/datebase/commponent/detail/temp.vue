<script>
async function moveImage(targetItemIndex: number, selectedImages: any[], draggedItem: any, targetItem: any) {
  const {slotId} = selectItems.value;
  const sourceFolder = `${pbiaRootPath}/${slotId}/01_WBC_Classification/${draggedItem.id}_${draggedItem.title}`;
  const destinationFolder = `${pbiaRootPath}/${slotId}/01_WBC_Classification/${targetItem.id}_${targetItem.title}`;

  try {
// 선택된 이미지 배열에 대해 반복
    for (const selectedImage of selectedImages.value) {
      const fileName = selectedImage.fileName;

// 이미지 이동 API 호출
      const response = await moveImgPost(`sourceFolder=${sourceFolder}&destinationFolder=${destinationFolder}&imageName=${fileName}`);

      if (response) {
// 드래그된 이미지를 원래 위치에서 제거
        const draggedImageIndex = draggedItem.images.findIndex((img: any) => img.fileName === fileName);
        draggedItem.images.splice(draggedImageIndex, 1);

// 변경되면 테두리 표시
        selectedImage.changed = true;

// 드롭된 위치에 이미지를 삽입
        wbcInfo.value[targetItemIndex].images.push(selectedImage);

// Count 업데이트
        const newCount = parseInt(wbcInfo.value[targetItemIndex].count) + 1;
        wbcInfo.value[targetItemIndex].count = newCount.toString();
      } else {
        console.error('이미지 이동 실패:', fileName);
      }
    }

// 선택된 이미지 초기화
    selectedImages.value = [];

// 원본 데이터베이스 업데이트
    await updateOriginalDb();
  } catch (error) {
    console.error('에러:', error);
  }
}
</script>