import sqlite3
import telebot
from datetime import datetime
import threading
import time
import json
import os
from telebot import types

# ========== КОНФИГУРАЦИЯ ==========
USER_BOT_TOKEN = '7666013679:AAGyEqPBBKKVti_erPzdkxtg8CmF9q-oxXc'
OPERATOR_BOT_TOKEN = '8157310546:AAEdJ6AZNwqEVsU_uVeMZbZoSF1Al7rTCnw'
OPERATOR_CHAT_IDS = set()  # Множество авторизованных операторов
AUTH_FILE = "operators.json"  # Файл с учетными данными
# ==================================

# Инициализация ботов
user_bot = telebot.TeleBot(USER_BOT_TOKEN)
operator_bot = telebot.TeleBot(OPERATOR_BOT_TOKEN)

# База данных
conn = sqlite3.connect('events.db', check_same_thread=False)
cursor = conn.cursor()

# Создание таблиц
cursor.execute('''
CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    event_description TEXT,
    event_dates TEXT,
    full_name TEXT,
    contact_info TEXT,
    timestamp DATETIME
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS broadcasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT,
    timestamp DATETIME
)
''')
conn.commit()


# ========== СИСТЕМА АВТОРИЗАЦИИ ==========
def load_auth_data():
    """Загружает данные авторизации из JSON-файла"""
    if not os.path.exists(AUTH_FILE):
        # Создаем файл с примером данных, если он не существует
        sample_data = {
            "operators": [
                {"login": "admin", "password": "admin123"},
                {"login": "operator1", "password": "pass123"}
            ]
        }
        with open(AUTH_FILE, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, indent=2)
        return sample_data

    with open(AUTH_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def authenticate(login, password):
    """Проверяет логин и пароль оператора"""
    auth_data = load_auth_data()
    for operator in auth_data.get('operators', []):
        if operator['login'] == login and operator['password'] == password:
            return True
    return False


# Состояния для FSM (Finite State Machine)
OPERATOR_STATES = {}


# ========== ПОЛЬЗОВАТЕЛЬСКИЙ БОТ ==========
@user_bot.message_handler(commands=['start'])
def send_welcome(message):
    welcome_text = (
        "Привет! Я - телеграм бот для принятия заявок на организацию мероприятий. "
        "Сейчас я расскажу в какой форме нужно отправить свой запрос, и перешлю его оператору!\n\n"
        "Используй команду /form чтобы начать заполнение заявки."
    )
    user_bot.reply_to(message, welcome_text)


@user_bot.message_handler(commands=['form'])
def request_form(message):
    form_instructions = (
        "Заполните форму в таком формате (4 строки):\n\n"
        "1. Краткое описание мероприятия\n"
        "2. Сроки\n"
        "3. Ваше ФИО\n"
        "4. Способ связи\n\n"
        "Пример:\n"
        "Организация конференции по IT\n"
        "15-20 сентября 2023 года\n"
        "Иванов Иван Иванович\n"
        "@username или +71234567890"
    )
    msg = user_bot.reply_to(message, form_instructions)
    user_bot.register_next_step_handler(msg, process_application)


def process_application(message):
    try:
        data = message.text.split('\n')
        if len(data) < 4:
            raise ValueError("Недостаточно данных")

        event_description = data[0].strip()
        event_dates = data[1].strip()
        full_name = data[2].strip()
        contact_info = data[3].strip()

        user_id = message.from_user.id
        username = message.from_user.username if message.from_user.username else "N/A"

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute('''
        INSERT INTO applications 
        (user_id, username, event_description, event_dates, full_name, contact_info, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, username, event_description, event_dates, full_name, contact_info, timestamp))
        conn.commit()

        # Отправка уведомления всем авторизованным операторам
        app_id = cursor.lastrowid
        notify_operators(app_id, message)

        user_bot.reply_to(message, "✅ Заявка успешно сохранена! Оператор свяжется с вами в ближайшее время.")

    except Exception as e:
        error_message = (
            "⚠️ Ошибка при обработке заявки. Пожалуйста, убедитесь, что вы отправили данные "
            "в правильном формате (4 строки).\n\n"
            "Попробуйте снова командой /form"
        )
        user_bot.reply_to(message, error_message)
        print(f"Ошибка: {str(e)}")


def notify_operators(app_id, message):
    """Отправляет уведомление всем авторизованным операторам"""
    if OPERATOR_CHAT_IDS:
        keyboard = types.InlineKeyboardMarkup()
        btn = types.InlineKeyboardButton(
            text="Просмотреть заявку",
            callback_data=f"view_{app_id}"
        )
        keyboard.add(btn)

        for chat_id in OPERATOR_CHAT_IDS:
            try:
                operator_bot.send_message(
                    chat_id,
                    "🚀 Новая заявка на мероприятие!",
                    reply_markup=keyboard
                )
            except Exception as e:
                print(f"Ошибка отправки оператору {chat_id}: {str(e)}")
                # Удаляем невалидный chat_id из списка
                OPERATOR_CHAT_IDS.discard(chat_id)


# ========== ОПЕРАТОРСКИЙ БОТ ==========
@operator_bot.message_handler(commands=['start'])
def operator_start(message):
    chat_id = message.chat.id
    if chat_id in OPERATOR_CHAT_IDS:
        operator_bot.reply_to(message, "✅ Вы уже авторизованы!")
        return

    OPERATOR_STATES[chat_id] = {'state': 'waiting_login'}
    operator_bot.send_message(chat_id,
                              "🔒 Для доступа к функциям бота-оператора требуется авторизация.\n\nВведите ваш логин:")


def check_auth(chat_id):
    """Проверяет авторизацию оператора"""
    if chat_id not in OPERATOR_CHAT_IDS:
        operator_bot.send_message(chat_id, "⚠️ Доступ запрещен! Пожалуйста, авторизуйтесь с помощью /start")
        return False
    return True


@operator_bot.message_handler(func=lambda message: True)
def handle_operator_messages(message):
    chat_id = message.chat.id
    text = message.text.strip()

    # Обработка авторизации
    if chat_id in OPERATOR_STATES:
        state = OPERATOR_STATES[chat_id]['state']

        if state == 'waiting_login':
            OPERATOR_STATES[chat_id] = {
                'state': 'waiting_password',
                'login': text
            }
            operator_bot.send_message(chat_id, "🔑 Теперь введите ваш пароль:")

        elif state == 'waiting_password':
            login = OPERATOR_STATES[chat_id]['login']
            password = text

            if authenticate(login, password):
                OPERATOR_CHAT_IDS.add(chat_id)
                operator_bot.send_message(chat_id, "✅ Авторизация успешна! Теперь вы можете использовать функции бота.")
                del OPERATOR_STATES[chat_id]
            else:
                operator_bot.send_message(chat_id, "❌ Неверный логин или пароль. Попробуйте снова с помощью /start")
                del OPERATOR_STATES[chat_id]
        return

    # Обработка команд после авторизации
    if text.startswith('/rs'):
        if not check_auth(chat_id):
            return
        broadcast_message(message)
    elif text == '/start':
        operator_start(message)
    else:
        if not check_auth(chat_id):
            return
        operator_bot.send_message(chat_id,
                                  "ℹ️ Используйте команды:\n/rs - для рассылки сообщений\n/form - для просмотра формы заявки")


@operator_bot.callback_query_handler(func=lambda call: call.data.startswith('view_'))
def view_application(call):
    chat_id = call.message.chat.id
    if not check_auth(chat_id):
        return

    app_id = call.data.split('_')[1]
    cursor.execute("SELECT * FROM applications WHERE id = ?", (app_id,))
    application = cursor.fetchone()

    if application:
        app_text = (
            f"📝 Заявка #{application[0]}\n\n"
            f"👤 Пользователь: @{application[2]} (ID: {application[1]})\n"
            f"📅 Время подачи: {application[7]}\n\n"
            f"1. Мероприятие: {application[3]}\n"
            f"2. Сроки: {application[4]}\n"
            f"3. ФИО: {application[5]}\n"
            f"4. Контакты: {application[6]}"
        )
        operator_bot.send_message(chat_id, app_text)
    else:
        operator_bot.send_message(chat_id, "⚠️ Заявка не найдена")


def broadcast_message(message):
    chat_id = message.chat.id
    if not check_auth(chat_id):
        return

    broadcast_text = message.text.replace('/rs', '', 1).strip()
    if not broadcast_text:
        operator_bot.reply_to(message, "❌ Укажите текст рассылки после команды /rs")
        return

    # Сохраняем в базу для отправки
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute('''
    INSERT INTO broadcasts (message, timestamp)
    VALUES (?, ?)
    ''', (broadcast_text, timestamp))
    conn.commit()

    operator_bot.reply_to(message, f"✅ Сообщение сохранено для рассылки:\n\n{broadcast_text}")


# ========== СИСТЕМА РАССЫЛКИ ==========
def broadcast_sender():
    while True:
        try:
            # Получаем непосланные сообщения
            cursor.execute("SELECT * FROM broadcasts")
            broadcasts = cursor.fetchall()

            for broadcast in broadcasts:
                broadcast_id = broadcast[0]
                message_text = broadcast[1]

                # Получаем всех пользователей
                cursor.execute("SELECT DISTINCT user_id FROM applications")
                users = cursor.fetchall()

                for user in users:
                    try:
                        user_bot.send_message(user[0], f"📢 Рассылка:\n\n{message_text}")
                    except Exception as e:
                        print(f"Ошибка отправки пользователю {user[0]}: {str(e)}")

                # Помечаем как отправленное (удаляем)
                cursor.execute("DELETE FROM broadcasts WHERE id = ?", (broadcast_id,))
                conn.commit()

                print(f"Рассылка #{broadcast_id} отправлена {len(users)} пользователям")

            time.sleep(10)  # Проверка каждые 10 секунд

        except Exception as e:
            print(f"Ошибка в системе рассылки: {str(e)}")
            time.sleep(60)


# ========== ЗАПУСК СИСТЕМЫ ==========
if __name__ == "__main__":
    # Создаем файл авторизации при первом запуске
    load_auth_data()

    # Запускаем поток для рассылки
    threading.Thread(target=broadcast_sender, daemon=True).start()


    # Запускаем ботов в отдельных потоках
    def run_user_bot():
        user_bot.infinity_polling()


    def run_operator_bot():
        operator_bot.infinity_polling()


    t1 = threading.Thread(target=run_user_bot)
    t2 = threading.Thread(target=run_operator_bot)

    t1.start()
    t2.start()

    t1.join()
    t2.join()