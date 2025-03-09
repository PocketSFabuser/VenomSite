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
const copynum1 = document.getElementById('copynumb1');
const copynum2 = document.getElementById('copynumb2');
const onas = document.getElementById('onas');
const changethemetolight = document.getElementById('btn-theme');

let currentIndex = 0;
let autoChangePaused = false; 
const images = [image1, image2];

function changetheme() {
    changethemetolight.addEventListener('click', () => {
        window.open('index.html', '_self');
    });
}

function copynum() {
    copynum1.addEventListener('click', () => {
        console.log('copied!');
        navigator.clipboard.writeText('+375293375158');
        showMessage();
    });
    copynum2.addEventListener('click', () => {
        console.log('copied!');
        navigator.clipboard.writeText('+375291556535');
        showMessage();
    });
}

function call() {
    zvonok.addEventListener('click', () => {        
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            window.location.href = 'tel:+375291556535';
        } else {
            console.log('This feature is only available on mobile devices.');
            navigator.clipboard.writeText('+375291556535');
            showMessage();
        }
    });
}

function showMessage() {
    messageDiv.style.opacity = "1";
    setTimeout(() => {
        messageDiv.style.opacity = "0";
    }, 2000);
}

function showImage(index) {
    const currentImage = images[currentIndex];
    const nextImage = images[index];

    currentImage.style.opacity = "0"; 
    setTimeout(() => {
        currentImage.style.display = 'none';
        nextImage.style.display = 'block'; 
        nextImage.style.opacity = "1"; 
    }, 500); 
    nextImage.style.opacity = "1"; 
    images.forEach((img, i) => {
        img.style.display = (i === index) ? 'block' : 'none';
    });
}

nextButton.addEventListener('click', () => {
    autoChangePaused = true; 
    setTimeout(() => {
        autoChangePaused = false; 
    }, 20000); 
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
});

prevButton.addEventListener('click', () => {
    autoChangePaused = true; 
    setTimeout(() => {
        autoChangePaused = false; 
    }, 20000); 
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(currentIndex);
});

window.onload = () => {
    changetheme();
    copynum();
    onasFunction();
    call();
    showImage(currentIndex);
    detectDevice(); 
    setInterval(() => {
        if (!autoChangePaused) { 
            currentIndex = (currentIndex + 1) % images.length; 
            showImage(currentIndex); 
        }
    }, 5000); 
};
function onasFunction() {
    onas.addEventListener('click', () => {
        document.getElementById('p3').scrollIntoView ({behavior: 'smooth'});
    })
}

function detectDevice() {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        console.log('User is on a mobile device.');
    } else {
        console.log('User is on a PC.');
    }
}
