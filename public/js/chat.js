const mesajul = document.querySelector('.chat-box')
const input = document.querySelector('.mesaj')
const button = document.querySelector('.gonder');
const yazma = document.querySelector('.yazma')
const socket = io.connect('http://localhost:3000')

document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        // Enter tuşuna basıldığında butona benzer bir işlem yapmak için
        button.click(); // Butonu tıklar gibi davranır
    }
});


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

window.onload = function () {
    const scrollableDiv = document.querySelector('.chat-box');
    scrollableDiv.scrollTo(0, scrollableDiv.scrollHeight);
};


socket.on('chat', data => {
    const currentURL = window.location.href;

    // URL'den query stringi (parametreleri) al
    const queryString = currentURL.split('?')[1];

    // Query stringini parçalayarak parametreleri al
    const params = new URLSearchParams(queryString);

    // Belirli bir parametreyi al
    const parametre1Deger = params.get('id');

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

input.addEventListener('input', () => {
    if (input.value != '') {
        socket.emit('typing', {
            yaziyor: true
        })
    }
})


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
userdropdown.onclick = function () {

    if (sayac2 == 0) {
        dropdownmenu2.style.display = 'inline-block'
        sayac2++;
    } else {
        dropdownmenu2.style.display = 'none'
        sayac2--;
    }
}