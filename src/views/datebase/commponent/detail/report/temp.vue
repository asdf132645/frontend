<script>
const printPage = () => {
  const content = printContent.value;
  if (content) {
    const printWindow = window.open('', '_blank');
    if (printWindow !== null) {
      printWindow.document.write(content.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
      printWindow.addEventListener('afterprint', () => {
        printWindow.close();
      });

      if (printWindow && !printWindow.closed) {
        printWindow.close();
      }

    }
  } else {
    console.error("프린트할 내용을 찾을 수 없습니다.");
  }
};
</script>