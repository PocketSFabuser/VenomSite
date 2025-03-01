const zvonok = document.getElementById('call');

function call() {
    zvonok.addEventListener('click', () => {
        navigator.clipboard.writeText('+375291556535');
        console.log('Nomer skopirovan!');

    }) 
}

window.onlload = call();