Пиши в _variables.sass(можно писать где угодно, главное в root)
в root
переменные для цветов

:root
    --black: #000
    --white: #fff
    --red: #CF2703
    --beuge: #F2F2EF
    --olive: #868367
    --blue: #5F84BA


Теперь ты можешь использовать в html конструкции типа
<div class="c-blue bgc-blue brdc-blue"></div>
классы актуальные для любого цвета, что задан в переменной, в root

c-{n} - цвет текста
bgc-{n} - фон
brdc-{} - цвет border, вдруг понадобится
