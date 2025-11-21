

# Grid System — Документация для разработчиков

Наша grid-система построена на **UnoCSS** и максимально близка к **Bootstrap**, но с важными отличиями.

---

## Основные отличия от Bootstrap

### 1. Брейкпоинты работают через `max-width` (не `min-width`)

**Bootstrap:**

```html
<!-- md: применяется ОТ 768px и ВЫШЕ -->

<div class="col-md-6"></div>
```

**Наша система:**

```html
<!-- l: применяется ДО 1440.98px и НИЖЕ -->

<div class="l:col-6"></div>
```

```html
<!-- m: применяется ДО 575.98px и НИЖЕ -->

<div class="m:col-6"></div>
```

Брейпоинты l и m мождно переопределить в uno.config.js



### 2. Префиксы брейкпоинтов

| Префикс | Брейкпоинт | Описание |
|---------|------------|----------|
| _нет_ | 1441px–1920px | Комп |
| `l:` | ≤1440.98px | Ноутбуки |
| `m:` | ≤575.98px | Мобилки |

---

## Колонки (Grid)

### Базовое использование

Работает **как в Bootstrap**:

```html

<div class="row">

  <div class="col-6">6 колонок</div>

  <div class="col-6">6 колонок</div>

</div>
```

### ⚠️ Важный нюанс: мобильное поведение

**По умолчанию** все `col-*` на мобилке **автоматически** становятся `width: 100%`:
Я выбрал такое поведение исходя из задач с которыми сталкиваюсь, можно переделать.

Примечание - такая же логика актуальна и для offset классов. В мобилке они всегда обнуляются;

```html
<!-- Desktop/Laptop: 6/12, Mobile: 12/12 (100%) -->

<div class="col-6">Авто 100% на мобилке</div>


<!-- Явно задаём 6 колонок на мобилке -->

<div class="col-6 m:col-6">6/12 везде, включая мобилку</div>


<!-- Desktop: 6/12, Laptop: 4/12, Mobile: 100% -->

<div class="col-6 l:col-4">Адаптивная сетка</div>
```


## Dev-инструменты

### Тестирование в браузере

В **dev-режиме** доступны ВСЕ классы `col-*`, `l:col-*`, `m:col-*` для экспериментов в DevTools.

В **test** и **production** генерируются только используемые классы.

За это отвечает поле safelist, 185строка кода в uno.config.js


---

## Шпаргалка: Bootstrap vs Наша система

| Сценарий | Bootstrap (min-width) | Наша система (max-width) |
| :-- | :-- | :-- |
| **Две колонки везде** | `col-6` | `col-6 m:col-6` |
| **Две колонки → одна на мобилке** | `col-md-6 col-12` | `col-6` (авто 100% на mobile) |
| **Адаптивная сетка: 3→2→1** | `col-lg-4 col-md-6 col-12` | `col-4 l:col-6` (авто 100% на mobile) |
| **Четыре колонки → две на планшете → одна на мобилке** | `col-lg-3 col-md-6 col-12` | `col-3 l:col-6` |
| **Явный контроль на всех экранах** | `col-lg-4 col-md-6 col-sm-12` | `col-4 l:col-6 m:col-12(не обязательно)` |
| **Offset слева десктоп и планшет** | `offset-md-2 col-md-8` | `l:offset-2 col-8` |
| **Скрыть на мобилке** | `d-none d-md-block` | `m:d-none` |
| **Desktop: 3, Laptop: 4, Mobile: 6** | `col-lg-4 col-md-3 col-6` | `col-4 l:col-3 m:col-6` |

---


## Помимо  row и col - доступны привичные Bootstrap утилиты, с небольшими поправками. Будут добавляться по мере необходимости.

### **Grid (Колонки)**

```
col-{n}        // n: 1-12
col-auto
```


### **Offset**

```
offset-{n}     // n: 1-11
```


### **Display**

```
d-none  d-block  d-inline  d-inline-block
d-flex  d-inline-flex  d-grid
```


### **Flexbox Direction**

```
flex-row  flex-row-reverse
flex-column  flex-column-reverse
```


### **Flexbox Wrap**

```
flex-wrap  flex-nowrap  flex-wrap-reverse
```


### **Justify Content**

```
justify-content-start    justify-content-end
justify-content-center   justify-content-between
justify-content-around   justify-content-evenly
```


### **Align Items**

```
align-items-start     align-items-end
align-items-center    align-items-baseline
align-items-stretch
```


### **Align Content**

```
align-content-start    align-content-end
align-content-center   align-content-between
align-content-around   align-content-stretch
```


### **Align Self**

```
align-self-start     align-self-end
align-self-center    align-self-baseline
align-self-stretch
```


### **Flex Grow/Shrink**

```
flex-fill  flex-grow-0  flex-grow-1
flex-shrink-0  flex-shrink-1
```


### **Order**

```
order-{n}      // n: любое число
order-first    // -1
order-last     // 9999
```

**Не сделано**

```
row-cols-{n}
```


***

## ⚠️ Все классы работают с префиксами `l:` и `m:`

**Примеры:**

```html
<!-- Grid -->
<div class="col-6 l:col-4 m:col-8">
  Desktop: 6/12, Laptop: 4/12, Mobile: 8/12
</div>
<div class="offset-2 l:offset-1">
  Desktop: отступ 2, Laptop: отступ 1, Mobile: без отступа
</div>

<!-- Display -->
<div class="d-flex m:d-block">
  На десктопе flex, на мобилке блок
</div>
<div class="d-none l:d-flex m:d-none">
  Показать только на laptop (скрыт на desktop и mobile)
</div>
<div class="m:d-none">
  Скрыть на мобилке
</div>

<!-- Flexbox -->
<div class="flex-row m:flex-column">
  Desktop: горизонтальный, Mobile: вертикальный
</div>
<div class="justify-content-between m:justify-content-center">
  Desktop: по краям, Mobile: по центру
</div>
<div class="align-items-start l:align-items-center m:align-items-center">
  Desktop: сверху, Laptop+Mobile: по центру вертикали
</div>


<!-- Order -->
<div class="order-1 m:order-2">
  Desktop: первый, Mobile: второй
</div>
<div class="order-first l:order-last m:order-last">
  Desktop: в начало, Laptop+Mobile: в конец
</div>

```

**Контейнер:** `content-container` - Дима такой использует :)


***

