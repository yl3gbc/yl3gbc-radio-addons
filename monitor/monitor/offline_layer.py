from html import escape
LABELS = {
    "en": {"title": "OFFLINE TEST", "file": "OGG file", "button": "START TEST"},
    "ru": {"title": "ОФЛАЙН-ТЕСТ", "file": "Файл OGG", "button": "ЗАПУСТИТЬ ТЕСТ"},
}
def render_offline_test_layer(language: str = "en") -> str:
    lang = language if language in LABELS else "en"
    text = LABELS[lang]
    title = escape(text["title"])
    file_label = escape(text["file"])
    button = escape(text["button"])
    return (
        '<section id="offline-test-layer" class="offline-test-layer">'
        f'<h2>{title}</h2>'
        '<form method="post" action="/offline-test" enctype="multipart/form-data">'
        f'<label for="offline-ogg">{file_label}</label>'
        '<input id="offline-ogg" name="ogg" type="file" accept=".ogg,audio/ogg" required>'
        f'<button type="submit">{button}</button>'
        '</form>'
        '<div id="offline-test-result"></div>'
        '</section>'
    )
