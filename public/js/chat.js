//çözmen gerek : arkadaşlarından biriyle mesajı yoksa diğer arkadaşıylada mesajı olmuyor onu düzelt

let url = "http://localhost:3000"; //'https://chatapp-5wx4.onrender.com'
let testurl = "http://localhost:3000";
const mesajul = document.querySelector(".chat-box");
const input = document.querySelector(".mesaj");
const button = document.querySelector(".gonder");
const yazma = document.querySelector(".yazma");
const socket = io.connect(url);
const seefriend = document.querySelector(".seefriendreq");
const seefrienddiv = document.querySelector(".seefriend");
const friendcancel = document.querySelector(".friendcancel");

const friendwriting2 = document.querySelector(".friendwriting2");
seefriend.onclick = async function () {
  dropdownmenu.style.display = "none";
  fetch("/getfriendreq", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // Arama sonuçlarını kullanarak sayfayı güncelle
      friendwriting2.innerHTML = "";
      data.forEach((result) => {
        friendwriting2.innerHTML += `
               <div class="friend">
               <a href="/friendreject?id=${result._id}"> <button style= "border-radius: 24px 0px 0px 24px; margin-left:0;" class="friendrequest cancelfriendreq">Reddet</button></a>
               <p class="friendname">${result.ad} ${result.soyad}</p>
               <p class="friendemail">${result.email}</p>
               <a href="/acceptfriendreq?id=${result._id}"> <button class="friendrequest">Kabul Et</button></a>
               
           </div>
               `;
      });
    });
  seefrienddiv.style.display = "flex";
};

friendcancel.onclick = function () {
  seefrienddiv.style.display = "none";
};

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    // Enter tuşuna basıldığında butona benzer bir işlem yapmak için
    button.click(); // Butonu tıklar gibi davranır
  }
});

const friendaddbutton = document.querySelector(".friendaddbutton");
const mainfriendpage = document.querySelector(".mainfriendpage");
const closebutton = document.querySelector(".fa-x");
const searchInput = document.querySelector(".searchinput");
friendaddbutton.onclick = function () {
  mainfriendpage.style.display = "flex";
  dropdownmenu.style.display = "none";
};
closebutton.onclick = function () {
  mainfriendpage.style.display = "none";
};
const searchResults = document.querySelector(".friendwriting");
searchInput.addEventListener("input", () => {
  const searchText = searchInput.value;

  // Sunucuya istek göndermek için Fetch API kullanımı
  if (searchText != "") {
    fetch("/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ searchText }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Arama sonuçlarını kullanarak sayfayı güncelle
        searchResults.innerHTML = "";
        data.forEach((result) => {
          searchResults.innerHTML += `
                   <div class="friend">
                   <p class="friendname">${result.ad} ${result.soyad}</p>
                   <p class="friendemail">${result.email}</p>
                   <a href="/sendfriendreq?id=${result._id}"> <button class="friendrequest">Arkadaşlık İsteği Gönder</button></a>
                  
               </div>
                   `;
        });
      });
  } else {
    searchResults.innerHTML = "";
  }
});

const scrollableDiv = document.querySelector(".chat-box");

if (scrollableDiv) {
  window.onload = function () {
    scrollableDiv.scrollTo(0, scrollableDiv.scrollHeight);
  };
}

const currentURL = window.location.href;

// URL'den query stringi (parametreleri) al
const queryString = currentURL.split("?")[1];

// Query stringini parçalayarak parametreleri al
const params = new URLSearchParams(queryString);

// Belirli bir parametreyi al
let parametre1Deger = params.get("id");
console.log(parametre1Deger);
if (parametre1Deger) {
  if (parametre1Deger.charAt(parametre1Deger.length - 1) == "#") {
    parametre1Deger = parametre1Deger.slice(0, -1);
  }
  if (parametre1Deger.length != 24) {
    window.location.href = url + "chat";
  }
}
console.log(parametre1Deger);
socket.emit("joinRoom");
socket.emit("mainroom");
let sayac = 0;
socket.on("ongosterim", (data) => {
  const arkadaslar = document.querySelectorAll(".arkadaslar");
  console.log(arkadaslar);
  const control = document.querySelector(".control");
  const mainarkadaslar = document.querySelector(".mainarkadaslar");

  for (let index = 0; index < arkadaslar.length; index++) {
    console.log("hoppa");

    if (
      arkadaslar[index].attributes.href.value.substring(9) == data.sender &&
      control.value == data.receiver
    ) {
      mainarkadaslar.insertBefore(
        mainarkadaslar.children[index],
        mainarkadaslar.firstChild
      );

      arkadaslar[
        index
      ].firstElementChild.firstElementChild.nextElementSibling.firstElementChild.nextElementSibling.innerHTML = `
            <span class="offline">${data.message}</span>
            `;

      if (sayac == 0 && parametre1Deger != data.sender) {
        arkadaslar[index].innerHTML += '  <i class="fa-solid fa-circle"></i>';
        sayac++;
      }
    }
  }
});
socket.on("chat", async (data) => {
  if (data.message != "") {
    console.log(parametre1Deger);
    if (data.sender == parametre1Deger) {
      yazma.innerHTML = "";
      mesajul.innerHTML += `
            <div class="message received">
            <div class="message-content"> ${data.message}</div>
        </div>
            `;

      mesajul.scrollTo(0, mesajul.scrollHeight);
    }
  }
});

if (input) {
  input.addEventListener("input", () => {
    if (input.value != "") {
      socket.emit("typing", {
        yaziyor: true,
      });
    }
  });
}

socket.on("typing", (data) => {
  const currentURL = window.location.href;

  // URL'den query stringi (parametreleri) al
  const queryString = currentURL.split("?")[1];

  // Query stringini parçalayarak parametreleri al
  const params = new URLSearchParams(queryString);

  // Belirli bir parametreyi al
  let parametre1Deger = params.get("id");
  if (parametre1Deger.charAt(parametre1Deger.length - 1) == "#") {
    parametre1Deger = parametre1Deger.slice(0, -1);
  }
  if (parametre1Deger.length != 24) {
    window.location.href = url + "chat";
  }
  console.log(parametre1Deger);
  if (data.sender == parametre1Deger) {
    yazma.innerHTML =
      '<span style="color: white;  margin-left: 20px;" class="writing">Yazıyor...</span>';
  }
});

const dropdown = document.querySelector(".dropdown");
const dropdownmenu = document.querySelector(".dropdownmenu");
const body = document.querySelector("body");
dropdownmenu.style.display = "none";
const dropdownmenu2 = document.querySelector(".dropdownmenu2");

// Sayfa genelinde bir tıklama olayı dinle
if (dropdownmenu2) {
  document.addEventListener("click", function (event) {
    // Tıklanan noktanın dropdown icon veya dropdown menü içinde olup olmadığını kontrol et
    if (
      !dropdownmenu.contains(event.target) &&
      !dropdown.contains(event.target)
    ) {
      // Tıklanan nokta ne dropdown icon ne de dropdown menü içinde ise dropdown menüsünü gizle
      dropdownmenu.style.display = "none";
    }
    if (
      !dropdownmenu2.contains(event.target) &&
      !userdropdown.contains(event.target)
    ) {
      // Tıklanan nokta ne dropdown icon ne de dropdown menü içinde ise dropdown menüsünü gizle
      dropdownmenu2.style.display = "none";
    }
  });
  dropdownmenu2.style.display = "none";
}
if (dropdown) {
  dropdown.onclick = function () {
    if (dropdownmenu.style.display == "none") {
      dropdownmenu.style.display = "inline-block";
    } else {
      dropdownmenu.style.display = "none";
    }
  };
}

const userdropdown = document.querySelector(".userdropdown");

if (userdropdown) {
  userdropdown.onclick = function () {
    if (dropdownmenu2.style.display == "none") {
      dropdownmenu2.style.display = "inline-block";
    } else {
      dropdownmenu2.style.display = "none";
    }
  };
}

if (button) {
  button.addEventListener("click", () => {
    if (input.value != "") {
      socket.emit("chat", {
        message: input.value,
      });
      mesajul.innerHTML += `
        <div class="message sent">
        <div class="message-content">
            ${input.value}
        </div>
    </div>
        `;

      mesajul.scrollTo(0, mesajul.scrollHeight);
      /* const arkadaslar = document.querySelectorAll('.arkadaslar')
                console.log(arkadaslar);
              
                const mainarkadaslar = document.querySelector('.mainarkadaslar')
                for (let index = 0; index < arkadaslar.length; index++) {
                    console.log('hoppa');
            
                    if (arkadaslar[index].attributes.href.value.substring(9) == data.sender && control.value == data.receiver) {
                        mainarkadaslar.insertBefore(mainarkadaslar.children[index], mainarkadaslar.firstChild);
            
                        arkadaslar[index].firstElementChild.firstElementChild.nextElementSibling.firstElementChild.nextElementSibling.innerHTML = `
                        <span class="offline">${data.message}</span>
                        `
                    }
            
                }*/

      const arkadaslar = document.querySelectorAll(".arkadaslar");
      const mainarkadaslar = document.querySelector(".mainarkadaslar");
      console.log(arkadaslar);
      for (let index = 0; index < arkadaslar.length; index++) {
        if (
          arkadaslar[index].attributes.href.value.substring(9) ==
          parametre1Deger
        ) {
          mainarkadaslar.insertBefore(
            mainarkadaslar.children[index],
            mainarkadaslar.firstChild
          );
          arkadaslar[
            index
          ].firstElementChild.firstElementChild.nextElementSibling.firstElementChild.nextElementSibling.innerHTML = `
                    <span class="online">${input.value}</span>
                    `;
        }
      }
      input.value = "";
    }
  });
}

/*responsive js*/

const arrowleft = document.querySelector(".fa-arrow-left");
const arrowright = document.querySelector(".fa-arrow-right");
const sidebar = document.querySelector(".sidebar");

arrowleft.onclick = function () {
  arrowleft.style.display = "none";
  arrowright.style.display = "inline-block";
  sidebar.style.display = "none";
};
arrowright.onclick = function () {
  arrowright.style.display = "none";
  arrowleft.style.display = "inline-block";
  sidebar.style.display = "block";
};
