const mesajul = document.querySelector('.chat-box')
const input = document.querySelector('.mesaj')
const button = document.querySelector('.gonder');
const yazma = document.querySelector('.yazma')
const socket = io.connect('http://localhost:3000')
const seefriend = document.querySelector('.seefriendreq');
const seefrienddiv = document.querySelector('.seefriend')
const friendcancel = document.querySelector('.friendcancel')

const friendwriting2 = document.querySelector('.friendwriting2')
seefriend.onclick = async function () {

    fetch('/getfriendreq', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },

    })
        .then(response => response.json())
        .then(data => {

            console.log(data);
            // Arama sonuçlarını kullanarak sayfayı güncelle
            friendwriting2.innerHTML = '';
            data.forEach(result => {
                friendwriting2.innerHTML += `
               <div class="friend">
               <a href="/friendreject?id=${result._id}"> <button class="friendrequest">Reddet</button></a>
               <p class="friendname">${result.ad} ${result.soyad}</p>
               <p class="friendemail">${result.email}</p>
               <a href="/acceptfriendreq?id=${result._id}"> <button class="friendrequest">Kabul Et</button></a>
               
           </div>
               `
            });
        });
    seefrienddiv.style.display = 'flex'
}

friendcancel.onclick = function () {
    seefrienddiv.style.display = 'none'
}






document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        // Enter tuşuna basıldığında butona benzer bir işlem yapmak için
        button.click(); // Butonu tıklar gibi davranır
    }
});



const friendaddbutton = document.querySelector('.friendaddbutton')
const mainfriendpage = document.querySelector('.mainfriendpage');
const closebutton = document.querySelector('.fa-x')
const searchInput = document.querySelector('.searchinput')
friendaddbutton.onclick = function () {
    mainfriendpage.style.display = 'flex'
}
closebutton.onclick = function () {
    mainfriendpage.style.display = 'none'


}
const searchResults = document.querySelector('.friendwriting')
searchInput.addEventListener('input', () => {
    const searchText = searchInput.value;

    // Sunucuya istek göndermek için Fetch API kullanımı
    if (searchText != '') {
        fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchText })
        })
            .then(response => response.json())
            .then(data => {
                // Arama sonuçlarını kullanarak sayfayı güncelle
                searchResults.innerHTML = '';
                data.forEach(result => {
                    searchResults.innerHTML += `
                   <div class="friend">
                   <p class="friendname">${result.ad} ${result.soyad}</p>
                   <p class="friendemail">${result.email}</p>
                   <a href="/sendfriendreq?id=${result._id}"> <button class="friendrequest">Arkadaşlık İsteği Gönder</button></a>
                  
               </div>
                   `
                });
            });
    } else {
        searchResults.innerHTML = ''
    }
});






const scrollableDiv = document.querySelector('.chat-box');

if (scrollableDiv) {
    window.onload = function () {

        scrollableDiv.scrollTo(0, scrollableDiv.scrollHeight);
    };
}

const currentURL = window.location.href;

// URL'den query stringi (parametreleri) al
const queryString = currentURL.split('?')[1];

// Query stringini parçalayarak parametreleri al
const params = new URLSearchParams(queryString);

// Belirli bir parametreyi al
const parametre1Deger = params.get('id');

socket.emit('joinRoom');
socket.on('chat', data => {


    console.log(parametre1Deger);
    if (data.sender == parametre1Deger) {
        yazma.innerHTML = ''
        mesajul.innerHTML += `
        <div class="message received">
        <div class="message-content"> ${data.message}</div>
    </div>
        `

        mesajul.scrollTo(0, mesajul.scrollHeight);
    }


})

if (input) {
    input.addEventListener('input', () => {
        if (input.value != '') {
            socket.emit('typing', {
                yaziyor: true
            })
        }
    })
}


socket.on('typing', data => {

    const currentURL = window.location.href;

    // URL'den query stringi (parametreleri) al
    const queryString = currentURL.split('?')[1];

    // Query stringini parçalayarak parametreleri al
    const params = new URLSearchParams(queryString);

    // Belirli bir parametreyi al
    const parametre1Deger = params.get('id');

    console.log(parametre1Deger);
    if (data.sender == parametre1Deger) {

        yazma.innerHTML = '<span style="color: white;  margin-left: 20px;" class="writing">Yazıyor...</span>'
    }

})
















const dropdown = document.querySelector('.dropdown');
const dropdownmenu = document.querySelector('.dropdownmenu');
const body = document.querySelector('body')
let sayac = 0;
dropdown.onclick = function () {
    if (sayac == 0) {
        dropdownmenu.style.display = 'inline-block'
        sayac++;
    } else {
        dropdownmenu.style.display = 'none'
        sayac--;
    }

}

const userdropdown = document.querySelector('.userdropdown')
const dropdownmenu2 = document.querySelector('.dropdownmenu2');
let sayac2 = 0;
if (userdropdown) {
    userdropdown.onclick = function () {

        if (sayac2 == 0) {
            dropdownmenu2.style.display = 'inline-block'
            sayac2++;
        } else {
            dropdownmenu2.style.display = 'none'
            sayac2--;
        }
    }
}


if (button) {
    button.addEventListener('click', () => {



        socket.emit('chat', {
            message: input.value
        })
        mesajul.innerHTML += `
        <div class="message sent">
        <div class="message-content">
            ${input.value}
        </div>
    </div>
        `



        mesajul.scrollTo(0, mesajul.scrollHeight);
        input.value = ''

    })
}