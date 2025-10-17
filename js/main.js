
// GSAP
import gsap from 'gsap';
import 'virtual:uno.css'

// Инициализация
console.log('Vite работает!');
console.log('Текущий режим:', import.meta.env.MODE);
console.log('Base URL:', import.meta.env.BASE_URL);

// Пример анимации GSAP
gsap.from('h1', {
  duration: 1,
  y: -50,
  opacity: 0,
  ease: 'bounce'
});


// Твой код здесь
console.log('✨ Твоя магия начинается тут');
