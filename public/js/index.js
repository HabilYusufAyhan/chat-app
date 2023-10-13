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
