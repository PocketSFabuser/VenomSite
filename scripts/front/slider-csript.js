document.addEventListener('DOMContentLoaded', () => {
            const slider = document.querySelector('.slider');
            const slides = document.querySelectorAll('.slide');
            const prevBtn = document.querySelector('.prev-btn');
            const nextBtn = document.querySelector('.next-btn');
            const dotsContainer = document.querySelector('.dots');
            
            let currentSlide = 0;
            const slideCount = slides.length;
            
            // Создаем точки для навигации
            slides.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(index));
                dotsContainer.appendChild(dot);
            });
            
            // Функция перехода к определенному слайду
            function goToSlide(slideIndex) {
                currentSlide = slideIndex;
                updateSlider();
            }
            
            // Обновление положения слайдера и активной точки
            function updateSlider() {
                slider.style.transform = `translateX(-${currentSlide * 100}%)`;
                
                // Обновляем активную точку
                document.querySelectorAll('.dot').forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentSlide);
                });
            }
            
            // Переход к следующему слайду
            function nextSlide() {
                currentSlide = (currentSlide + 1) % slideCount;
                updateSlider();
            }
            
            // Переход к предыдущему слайду
            function prevSlide() {
                currentSlide = (currentSlide - 1 + slideCount) % slideCount;
                updateSlider();
            }
            
            // Обработчики событий для кнопок
            nextBtn.addEventListener('click', nextSlide);
            prevBtn.addEventListener('click', prevSlide);
            
            // Автоматическое переключение слайдов
            let autoSlide = setInterval(nextSlide, 5000);
            
            // Остановка автоматического переключения при наведении
            slider.parentElement.addEventListener('mouseenter', () => {
                clearInterval(autoSlide);
            });
            
            // Возобновление автоматического переключения
            slider.parentElement.addEventListener('mouseleave', () => {
                autoSlide = setInterval(nextSlide, 5000);
            });
            
            // Обработка свайпов для мобильных устройств
            let touchStartX = 0;
            let touchEndX = 0;
            
            slider.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].screenX;
            });
            
            slider.addEventListener('touchend', e => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            });
            
            function handleSwipe() {
                const threshold = 50;
                if (touchEndX < touchStartX - threshold) {
                    nextSlide();
                }
                if (touchEndX > touchStartX + threshold) {
                    prevSlide();
                }
            }
        });