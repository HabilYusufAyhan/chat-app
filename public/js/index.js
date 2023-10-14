const menu = document.querySelector("#menu");
const drawer = document.querySelector(".drawer");

let sayac = 0;

menu.onclick = () => {
  if (sayac == 0) {
    drawer.style.opacity = 1;
    drawer.style.zIndex = 1;
    sayac++;
  } else {
    drawer.style.opacity = 0;
    drawer.style.zIndex = 0;
    sayac--;
  }
};
const fileInput = document.getElementById("file-input");

fileInput.addEventListener("change", function () {
  const selectedFile = fileInput.files[0];

  if (selectedFile) {
    const cropper = new Cropper(selectedFile, {
      aspectRatio: 1,
    });

    // Kullanıcının kırpma işlemini tamamlamasını beklemek için bir düğmeye ihtiyacınız var
    // Bu düğme kullanıcıya kırpma işlemini başlatmasını sağlar
    const cropButton = document.getElementById("crop-button");

    cropButton.addEventListener("click", function () {
      const croppedImage = cropper.getCroppedCanvas().toDataURL("image/png");
      // Kırpılmış resmi kullanmak için burada yapmanız gereken işlemleri gerçekleştirin
    });
  }
});
