// .querySelectorAll() ile seçilen öğeler bir NodeList döndürür, bu yüzden forEach() ile döngüye almanız gerekecek.

const newPersonButtons = document.querySelectorAll(".personadd");
const persons = document.querySelectorAll(".closing");
const closePersonButtons = document.querySelectorAll(".fa-x");

// NodeList üzerinde forEach() kullanarak her "personadd" düğmesine tıklanma olayını ekleyin.
newPersonButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    // Tıklanan düğmenin karşılık gelen "newPerson" öğesini gösterin.
    persons[index].style.display = "flex";
  });
});

// NodeList üzerinde forEach() kullanarak her "fa-x" düğmesine tıklanma olayını ekleyin.
closePersonButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    // Tıklanan düğmenin karşılık gelen "newPerson" öğesini gizleyin.
    persons[index].style.display = "none";
  });
});
