const zvonok = document.getElementById('call');
const messageDiv = document.createElement('div');
messageDiv.textContent = "Номер скопирован!";
messageDiv.style.position = "fixed";
messageDiv.style.right = "2.5vh";
messageDiv.style.top = "2.5vh";
messageDiv.style.backgroundColor = "rgba(54, 54, 54, 0.7)";
messageDiv.style.color = "white";
messageDiv.style.padding = "2.5vh";
messageDiv.style.borderRadius = "1.25vh";
messageDiv.style.opacity = "0";
messageDiv.style.transition = "opacity 0.5s";
document.body.appendChild(messageDiv);

const image1 = document.getElementById('img1');
const image2 = document.getElementById('img2');
const nextButton = document.getElementById('nextimg');
const prevButton = document.getElementById('previmg');

let currentIndex = 0;
const images = [image1, image2];

function call() {
    zvonok.addEventListener('click', () => {        
        navigator.clipboard.writeText('+375291556535');
        console.log('Nomer skopirovan!');
        showMessage();
    });
}

function showMessage() {
    messageDiv.style.opacity = "1";
    setTimeout(() => {
        messageDiv.style.opacity = "0";
    }, 2000);
}

function showImage(index) {
    images.forEach((img, i) => {
        img.style.display = (i === index) ? 'block' : 'none';
    });
}

nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
});

prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(currentIndex);
});

window.onload = () => {
    call();
    showImage(currentIndex);
};
