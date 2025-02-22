const p1 = document.getElementById('p1');
const input1 = document.getElementById("filename");
const cnt = document.getElementById('cnt');
function main() {
    cnt.addEventListener('click', () => {
        if (input1.value == file1id) {
            window.open('dota.html');
            console.log('первый if сработал!');
        } else if (input1.value == file2id) {
            window.open('stratz.html');
            console.log('второй if сработал!');
        } else {
            p1.style.display = "block";
        }
        });
    input1.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
                if (input1.value == file1id) {
                    window.open('dota.html');
                } else if (input1.value == file2id) {
                    window.open('stratz.html');
                } else {
                    p1.style.display = "block";
                }
            }
        });
}

window.onload = main(), console.log('main is started!');

