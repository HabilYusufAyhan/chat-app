const mesajul = document.querySelector('.chat-box')
const input = document.querySelector('.mesaj')
const button = document.querySelector('.gonder');

const socket = io.connect('http://localhost:3000')


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
})



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
        mesajul.innerHTML += `
        <div class="message received">
        <div class="message-content"> ${data.message}</div>
    </div>
        `
    }

})