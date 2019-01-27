/**
 * Main JS file for okiku
 */

jQuery(document).ready(function($) {

    var config = {
        'share-selected-text': true,
        'load-more': true,
        'infinite-scroll': false,
        'infinite-scroll-step': 1,
        'disqus-shortname': 'hauntedthemes-demo'
    };

    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        readLaterPosts = [],
        lang = $('html').attr('lang'),
        noBookmarksMessage = $('.no-bookmarks').html(),
        monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var currentPage = 1;
    var pathname = window.location.pathname;
    var $result = $('.post');

    setGalleryRation();

    // remove hash params from pathname
    pathname = pathname.replace(/#(.*)$/g, '').replace('/\//g', '/');

    if ($('body').hasClass('paged')) {
        currentPage = parseInt(pathname.replace(/[^0-9]/gi, ''));
    }

    var swiperMainData = {
        slidesPerView: 3,
        spaceBetween: 6,
        mousewheel: true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    };

    var swiperMain = new Swiper('.swiper-main', swiperMainData);
    var swup = new Swup({
        animateHistoryBrowsing: true
    });

    swup.on('contentReplaced', function () {
        swiperMain = new Swiper('.swiper-main', swiperMainData);
        $('header').midnight();
        loadNextPosts(swiperMain, currentPage, maxPages, pathname)
        // cursor = new CursorFx(document.querySelector('.cursor'));
    });

    $('header').midnight();

    $('#menu').on('shown.bs.modal', function (e) {
        anime({
            targets: '.nav li',
            translateY: 30,
            delay: anime.stagger(50),
            opacity: 1,
        });
        anime({
            targets: '.no-bookmarks, .search form',
            opacity: 1
        });
    })

    $('#menu').on('hidden.bs.modal', function (e) {
        anime.set('.nav li',{
            translateY: 0,
            opacity: 0
        });
        anime.set('.no-bookmarks, .search form',{
            opacity: 0
        });
    })

    var ghostSearch = new GhostSearch({
        host: 'http://localhost:2368',
        key: '1bfefb2fd10a5cb7230c8f220b',
        results: '#results',
        input: '#search-field',
        on: {
            afterDisplay: function(results){
                
            }
        }
    })

    $('#search-field').on('keyup', function () {
        if(!$(this).parent().hasClass('active')){
            $(this).parent().addClass('active')
        }
    });

    function loadNextPosts(swiperMain, currentPage, maxPages, pathname){
        swiperMain.on('slideChange', function(event) {
            var activeSlide = swiperMain.activeIndex;
            if(activeSlide % 3 == 0 && activeSlide != 0){
    
                if (currentPage == maxPages) {
                    return;
                };
    
                // next page
                currentPage++;
    
                if ($('body').hasClass('paged')) {
                    pathname = '/';
                };
    
                // Load more
                var nextPage = pathname + 'page/' + currentPage + '/';
    
                $.get(nextPage, function (content) {
                    var post = $(content).find('.swiper-main .swiper-slide');
                    swiperMain.appendSlide(post);
                });
            }
        });
    }

    if(typeof maxPages !== "undefined"){
        loadNextPosts(swiperMain, currentPage, maxPages, pathname);
    }

    // Set the right proportion for images inside the gallery
    function setGalleryRation(){
        $('.kg-gallery-image img').each(function(index, el) {
            var container = $(this).closest('.kg-gallery-image');
            var width = $(this)[0].naturalWidth;
            var height = $(this)[0].naturalHeight;
            var ratio = width / height;
            container.attr('style', 'flex: ' + ratio + ' 1 0%');
        });
    }

    var rellax = new Rellax('.rellax', {
        center: true,
    });

    // $('#search-field').on('focusin', function () {
    //     $('.search form').addClass('active');
    // });

    // $('#search-field').on('focusout', function () {
    //     $('.search form').removeClass('active');
    // });

    // Custom Cursor

    // const shuffleArray = arr => arr.sort(() => Math.random() - 0.5);
    // const lineEq = (y2, y1, x2, x1, currentVal) => {
    //     let m = (y2 - y1) / (x2 - x1); 
    //     let b = y1 - m * x1;
    //     return m * currentVal + b;
    // };
    // const lerp = (a, b, n) => (1 - n) * a + n * b;
    // const body = document.body;
    // const bodyColor = getComputedStyle(body).getPropertyValue('--color-bg').trim() || 'white';
    // const getMousePos = (e) => {
    //     let posx = 0;
    //     let posy = 0;
    //     if (!e) e = window.event;
    //     if (e.pageX || e.pageY) {
    //         posx = e.pageX;
    //         posy = e.pageY;
    //     }
    //     else if (e.clientX || e.clientY) 	{
    //         posx = e.clientX + body.scrollLeft + document.documentElement.scrollLeft;
    //         posy = e.clientY + body.scrollTop + document.documentElement.scrollTop;
    //     }
    //     return { x : posx, y : posy }
    // }

    // class CursorFx {
    //     constructor(el) {
    //         this.DOM = {el: el};
    //         this.DOM.dot = this.DOM.el.querySelector('.cursor__inner--dot');
    //         this.DOM.circle = this.DOM.el.querySelector('.cursor__inner--circle');
    //         this.bounds = {dot: this.DOM.dot.getBoundingClientRect(), circle: this.DOM.circle.getBoundingClientRect()};
    //         this.scale = 1;
    //         this.opacity = 1;
    //         this.mousePos = {x:0, y:0};
    //         this.lastMousePos = {dot: {x:0, y:0}, circle: {x:0, y:0}};
    //         this.lastScale = 1;
    //         this.lastOpacity = 1;
            
    //         this.initEvents();
    //         requestAnimationFrame(() => this.render());
    //     }
    //     initEvents() {
    //         window.addEventListener('mousemove', ev => this.mousePos = getMousePos(ev));
    //     }
    //     render() {
    //         this.lastMousePos.dot.x = lerp(this.lastMousePos.dot.x, this.mousePos.x - this.bounds.dot.width/2, 1);
    //         this.lastMousePos.dot.y = lerp(this.lastMousePos.dot.y, this.mousePos.y - this.bounds.dot.height/2, 1);
    //         this.lastMousePos.circle.x = lerp(this.lastMousePos.circle.x, this.mousePos.x - this.bounds.circle.width/2, 0.15);
    //         this.lastMousePos.circle.y = lerp(this.lastMousePos.circle.y, this.mousePos.y - this.bounds.circle.height/2, 0.15);
    //         this.lastScale = lerp(this.lastScale, this.scale, 0.15);
    //         this.lastOpacity = lerp(this.lastOpacity, this.opacity, 0.1);
    //         this.DOM.dot.style.transform = `translateX(${(this.lastMousePos.dot.x)}px) translateY(${this.lastMousePos.dot.y}px)`;
    //         this.DOM.circle.style.transform = `translateX(${(this.lastMousePos.circle.x)}px) translateY(${this.lastMousePos.circle.y}px) scale(${this.lastScale})`;
    //         this.DOM.circle.style.opacity = this.lastOpacity
    //         requestAnimationFrame(() => this.render());
    //     }
    //     enter() {
    //         cursor.scale = 2.7;
    //     }
    //     leave() {
    //         cursor.scale = 1;
    //     }
    //     click() {
    //         this.lastScale = 1;
    //         this.lastOpacity = 0;
    //     }
    // }

    // var cursor = new CursorFx(document.querySelector('.cursor'));

    // [...document.querySelectorAll('[data-hover]')].forEach((link) => {
    //     link.addEventListener('mouseenter', () => cursor.enter() );
    //     link.addEventListener('mouseleave', () => cursor.leave() );
    //     link.addEventListener('click', () => cursor.click() );
    // });

});