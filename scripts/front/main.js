window.onload = () => {
    const tg_btn = document.getElementById('form');
    const phone_copy = document.getElementById('copy-phone');

    tg_btn.addEventListener('click', () => {
        setTimeout(()=> {
            open('t.me/QuestsBar_bot', '_blank');
        }, 1000);
        showNotification({
						title: 'Перенаправляем...',
            message: 'Вы будете перенаправлены в Telegram',
            type: 'success'
        });
    });
    phone_copy.addEventListener('click', () => {
        setTimeout(()=> {
            copyPhoneNumber();
        },
            1000
        );
        showNotification({
            title: 'Связь',
            message: 'Номер телефона скопирован в буфер обмена!',
            type: 'success'
        });
    });

    function copyPhoneNumber() {
        const phoneNumber = "Номер";
        const textarea = document.createElement("textarea");
          textarea.value = phoneNumber;
          textarea.style.position = "fixed"; 
        document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");      
          document.body.removeChild(textarea);
}
}
