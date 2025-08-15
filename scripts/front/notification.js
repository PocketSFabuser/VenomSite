function showNotification(options) {
            const container = document.getElementById('notificationContainer');
            
            // Создаем элемент уведомления
            const notification = document.createElement('div');
            notification.className = `notification ${options.type || ''}`;
            
            // Добавляем содержимое уведомления
            notification.innerHTML = `
                <div class="notification-content">
                    ${options.title ? `<div class="notification-title">${options.title}</div>` : ''}
                    <div class="notification-message">${options.message}</div>
                </div>
                <button class="notification-close">&times;</button>
            `;
            
            // Добавляем уведомление в контейнер
            container.appendChild(notification);
            
            // Показываем уведомление с анимацией
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            // Закрытие по кнопке
            const closeBtn = notification.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => {
                closeNotification(notification);
            });
            
            // Автоматическое закрытие, если указано
            if (options.autoClose !== false) {
                const duration = typeof options.autoClose === 'number' ? options.autoClose : 5000;
                setTimeout(() => {
                    closeNotification(notification);
                }, duration);
            }
            
            return notification;
        }
        
        function closeNotification(notification) {
            notification.classList.remove('show');
            notification.addEventListener('transitionend', () => {
                notification.remove();
            });
        }
        
        // Примеры использования:
        // showNotification({
        //     title: 'Успех!',
        //     message: 'Операция выполнена успешно.',
        //     type: 'success'
        // });
        // 
        // showNotification({
        //     title: 'Ошибка',
        //     message: 'Что-то пошло не так.',
        //     type: 'error',
        //     autoClose: 8000
        // });
        // 
        // showNotification({
        //     message: 'Простое информационное сообщение',
        //     type: 'info'
        // });
        // 
        // showNotification({
        //     title: 'Предупреждение',
        //     message: 'Это важно!',
        //     type: 'warning',
        //     autoClose: false // не закрывается автоматически
        // });