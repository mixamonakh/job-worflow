import 'virtual:uno.css'

gsap.registerPlugin(ScrollTrigger, Draggable);

if(navigator.userAgent.indexOf('Mac') > 0) {
    $('html').addClass('mac');
}

class ModalPlugin extends Scrollbar.ScrollbarPlugin {
	static pluginName = 'modal';

	static defaultOptions = {
		open: false,
	};

	transformDelta(delta) {
		return this.options.open ? { x: 0, y: 0 } : delta;
	}
}

class SoftScrollPlugin extends Scrollbar.ScrollbarPlugin {
  static pluginName = 'SoftScroll';

  transformDelta(delta, fromEvent) {
    const dirX = delta.x > 0 ? 1 : -1;
    const dirY = delta.y > 0 ? 1 : -1;

    if (dirX === this.lockX || dirY === this.lockY) {
      return {x: 0, y: 0};
    } else {
      this.lockX = null;
      this.lockY = null;
    }

    return delta;
  }

  onRender(Data2d) {
    const {x, y} = Data2d;

    // Up
    if (y < 0 && !this.lockY && Math.abs(y) >= this.scrollbar.scrollTop) {
      this.scrollbar.setMomentum(0, -this.scrollbar.scrollTop);
      this.lockY = -1;
    }

    // Left
    if (x < 0 && !this.lockX && Math.abs(x) >= this.scrollbar.scrollLeft) {
      this.scrollbar.setMomentum(-this.scrollbar.scrollLeft, 0);
      this.lockX = -1;
    }

    // Right
    if (x > 0 && !this.lockX && Math.abs(x) >= (this.scrollbar.limit.x - this.scrollbar.scrollLeft)) {
      this.scrollbar.setMomentum((this.scrollbar.limit.x - this.scrollbar.scrollLeft), 0);
      this.lockX = 1;
    }

    // Down
    if (y > 0 && !this.lockY && Math.abs(y) >= (this.scrollbar.limit.y - this.scrollbar.scrollTop)) {
      this.scrollbar.setMomentum(0, (this.scrollbar.limit.y - this.scrollbar.scrollTop));
      this.lockY = 1;
    }

    if(y === 0) this.lockY = null;
    if(x === 0) this.lockX = null;
  }
}


let deltaScaleX = 1;
let deltaScaleY = 1;
function detectBrowser(){
	let result = 'Other';
	if (navigator.userAgent.indexOf('YaBrowser') !== -1 ) {
		result = 'Yandex';
	} else if (navigator.userAgent.indexOf('Firefox') !== -1 ) {
		result = 'Firefox';
	} else if (navigator.userAgent.indexOf('MSIE') !== -1 ) {
		result = 'Exploder';
	} else if (navigator.userAgent.indexOf('Edge') !== -1 ) {
		result = 'Edge';
	} else if (navigator.userAgent.indexOf('Safari') !== -1 ) {
		result = 'Safari';
	} else if (navigator.userAgent.indexOf('Opera') !== -1 ) {
		result = 'Opera';
	} else if (navigator.userAgent.indexOf('Chrome') !== -1 ) {
		result = 'Chrome';
	}

	if(result !== 'Firefox'){
		deltaScaleX = 1.3;
		deltaScaleY = 1.3;
	} else {
		deltaScaleX = 1;
		deltaScaleY = 1;
	}
	if($('html').hasClass('mobile')){
		deltaScaleX = .75;
		deltaScaleY = .75;
	}
}
detectBrowser();

class ScaleDeltaPlugin extends Scrollbar.ScrollbarPlugin {
	static pluginName = 'scaleDelta';

	transformDelta(delta, fromEvent) {
		return {
			x: delta.x * deltaScaleX,
			y: delta.y * deltaScaleY,
		}
	}
}

Scrollbar.use(ModalPlugin, SoftScrollPlugin, ScaleDeltaPlugin);

// Hash
var hash = window.location.hash;

// Loading
let anim = 1.2, animHalf = anim / 3, ease = 'power1.out', progressHeader = 0, done = false;

const images = gsap.utils.toArray('img');
const showDemo = () => {
	$('html').addClass('ready');
	$(".scroll-container").animate({ scrollTop: 0 }, 0);
	set();
	setTimeout(function(){
		ready();
	},100);
};
imagesLoaded(images).on('always', showDemo);

// фикс 100vh
const appHeight = () => {
	const doc = document.documentElement;
	doc.style.setProperty('--app-height', `${window.innerHeight}px`);
	ScrollTrigger.refresh();
}
appHeight();

window.addEventListener('pageshow', () => {setTimeout(function(){appHeight();},0);});
window.addEventListener('resize', () => {appHeight();}, false);
window.addEventListener("orientationchange", () => {appHeight();}, false);

// SCROLL
let bodyScrollBar;

bodyScrollBar = Scrollbar.init(document.querySelector('.scroll-container'), {
	damping: 0.05,
	thumbMinSize: 50,
	syncCallbacks: true
});

ScrollTrigger.scrollerProxy('.scroll-container', {
	scrollTop(value) {
		if (arguments.length) {
			bodyScrollBar.scrollTop = value;
		}
		return bodyScrollBar.scrollTop;
	}
});

bodyScrollBar.addListener(ScrollTrigger.update);

// Scroll to
$(document).on('click','.scroll-top', function(e){
	bodyScrollBar.scrollTo(0,0,2000);
	e.preventDefault();
});

let topOffset, scrollToId, scrollToHere;
$(document).on('click','.scroll-to', function(e){
	scrollToId = $(this).attr('href');
	if($(this).hasClass('scoll-header')){
		topOffset = document.querySelector('.header').offsetHeight;
	} else if($(this).attr('data-to')){
		topOffset = document.querySelector(scrollToId).getBoundingClientRect().top - document.querySelector('.' + $(this).attr('data-to')).getBoundingClientRect().top;
	} else {
		topOffset = 0;
	}
	
	scrollToHere = document.querySelector(scrollToId).offsetTop - topOffset;
	
	bodyScrollBar.scrollTo(0, scrollToHere, 2000);
	
	e.preventDefault();
});

ScrollTrigger.defaults({ scroller: '.scroll-container' , force3D: false,});

// Set
function set(){
	
}

// Ready
function ready(){
	
}


// Grid
$('.grid-trigger').click(function(e){
	$('html').toggleClass('show-grid');
	e.preventDefault();
});