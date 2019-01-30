/**
 * Main JS file for okiku
 */

jQuery(document).ready(function($) {

    var config = {
        'disqus-shortname': 'hauntedthemes-demo',
        'content-api-host': 'http://localhost:2368',
        'content-api-key': '8a13e02a8917186f02014db742',
    };

    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        readLaterPosts = [],
        lang = $('html').attr('lang'),
        noBookmarksMessage = $('.no-bookmarks').html(),
        monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var ghostAPI = new GhostContentAPI({
        host: config['content-api-host'],
        key: config['content-api-key'],
        version: 'v2'
    });

    var currentPage = 1;
    var pathname = window.location.pathname;
    var $result = $('.post');

    var instance = $('.bookmark-container').overlayScrollbars({ }).overlayScrollbars();

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
    $('header').midnight();

    // Make all images from gallery ready to be zoomed
    $('.kg-gallery-image img').each(function(index, el) {
        $( "<a href='" + $(this).attr('src') + "' class='zoom'></a>" ).insertAfter( $(this) );
        $(this).appendTo($(this).next("a"));
    });

    $('.zoom').fluidbox();

    // var headerHeight = $('header').innerHeight();

    // $.jScrollability([
    //     {
    //         'selector': '.simulate-bg',
    //         'start': h,
    //         'end': h*2-headerHeight-50,
    //         'fn': function($el,pcnt) {
    //             $el.css({
    //               'opacity': (pcnt)
    //             });
    //         }
    //     }
    // ]);

    // $(window).on('resize', function (e) {
    //     w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    //     h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    //     $.jScrollability([
    //         {
    //             'selector': '.simulate-bg',
    //             'start': h,
    //             'end': h*2,
    //             'fn': function($el,pcnt) {
    //                 $el.css({
    //                   'opacity': ((pcnt))
    //                 });
    //             }
    //         }
    //     ]);

    // });

    // $(window).on('scroll', function (e) {
    //     var scrollTop = $(window).scrollTop();
    //     if((scrollTop + headerHeight + 100) > h){
    //         $('body').addClass('active-header');
    //     }else{
    //         $('body').removeClass('active-header');
    //     }
    // });

    $(window).on('scroll', function(event) {

        w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        $('.zoom').fluidbox('close');
        if ($('.post-template').length) {
            progressBar();
        };
    });

    // anime({
    //     targets: '#content .share li',
    //     translateX: 100,
    //     delay: anime.stagger(50),
    //     opacity: 1,
    //     begin: function(anim) {
    //         $('#content .share').addClass('begin');
    //     },
    //     complete: function(anim) {
    //         $('#content .share').addClass('complete');
    //     }
    // });

    // Progress bar for inner post
    function progressBar(){
        var postContentOffsetTop = $('.post-content').offset().top;
        var postContentHeight = $('.post-content').height();
        if ($(window).scrollTop() > postContentOffsetTop && $(window).scrollTop() < (postContentOffsetTop + postContentHeight)) {
            var heightPassed = $(window).scrollTop() - postContentOffsetTop;
            var percentage = heightPassed * 100/postContentHeight;
            $('.progress').css({
                width: percentage + '%'
            });
            if(!$('#content .share').hasClass('begin')){
                anime({
                    targets: '#content .share li',
                    translateX: 100,
                    delay: anime.stagger(50),
                    begin: function(anim) {
                        $('#content .share').addClass('begin');
                    },
                });
            }
        }else if($(window).scrollTop() < postContentOffsetTop){
            $('.progress').css({
                width: '0%'
            });
            if($('#content .share').hasClass('begin')){
                $('#content .share').removeClass('begin');
                anime({
                    targets: '#content .share li',
                    translateX: -20,
                });
            }
        }else{
            if($('#content .share').hasClass('begin')){
                $('#content .share').removeClass('begin');
                anime({
                    targets: '#content .share li',
                    translateX: -20,
                });
            }
            $('.progress').css({
                width: '100%'
            });
        };
    }

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
        instance.destroy();
        instance = $('.bookmark-container').overlayScrollbars({ }).overlayScrollbars();
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
        host: config['content-api-host'],
        key: config['content-api-key'],
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

    function enableRelax(){
        if($('.rellax').length){
            var rellax = new Rellax('.rellax');
        }
    }

    enableRelax();

    // Check 'read later' posts 
    if (typeof Cookies.get('okiku-read-later') !== "undefined") {
        readLaterPosts = JSON.parse(Cookies.get('okiku-read-later'));
    }

    readLaterPosts = readLater($('#content .loop'), readLaterPosts);

    function readLater(content, readLaterPosts) {

        if (typeof Cookies.get('okiku-read-later') !== "undefined") {
            $.each(readLaterPosts, function(index, val) {
                $('.read-later[data-id="' + val + '"]').addClass('active');
            });
            bookmarks(readLaterPosts);
        }

        $(content).find('.read-later').each(function(index, el) {
            $(this).on('click', function(event) {
                event.preventDefault();
                var id = $(this).attr('data-id');
                if ($(this).hasClass('active')) {
                    removeValue(readLaterPosts, id);
                } else {
                    readLaterPosts.push(id);
                };
                $('.read-later[data-id="' + id + '"]').each(function(index, el) {
                    $(this).toggleClass('active');
                });
                Cookies.set('okiku-read-later', readLaterPosts, {
                    expires: 365
                });
                bookmarks(readLaterPosts);
            });
        });

        return readLaterPosts;

    }

    function bookmarks(readLaterPosts) {

        $('.bookmark-container').empty();
        if (readLaterPosts.length) {

            var url = [location.protocol, '//', location.host].join('');

            $('header .counter').removeClass('hidden').text(readLaterPosts.length);
            $('.bookmark-container').removeClass('no-bookmarks');

            var filter = readLaterPosts.toString();
            filter = "id:[" + filter + "]";

            ghostAPI.posts
                .browse({limit: 'all', filter: filter, include: 'tags'})
                .then((results) => {

                    $('.bookmark-container').empty();

                    $.each(results, function(index, result) {
                        var dateSplit = result.published_at.split('T');
                        dateSplit = dateSplit[0].split('-');
                        var month = monthNames.indexOf(dateSplit[1])+1;
                        var date = moment(dateSplit[2]+'-'+dateSplit[1]+'-'+dateSplit[0], "DD-MM-YYYY").format('DD MMM YYYY');
                        var tag = '';
                        if(result.primary_tag){
                            tag = '<div class="tags"><a href="/tag/'+ result.primary_tag.slug +'">'+ result.primary_tag.name +'</a></div>';
                        }
                        var str = '\
                        <div class="item"> \
                            <article> \
                                <div class="post-inner-content"> \
                                    ' + tag + '  \
                                    <p> \
                                        <a href="/' + result.slug + '/" class="post-title" title="' + result.title + '"><strong>' + result.title + '</strong></a> \
                                    </p> \
                                    <time datetime="' + result.published_at + '">' + date + '</time> \
                                </div> \
                                <a href="#" class="read-later active" data-id="' + result.id + '"><i class="far fa-bookmark"></i></a> \
                            </article> \
                        </div>';
                        $('.bookmark-container').append(str);
                    });

                    $('.bookmark-container').find('.read-later').each(function(index, el) {
                        $(this).on('click', function(event) {
                            event.preventDefault();
                            var id = $(this).attr('data-id');
                            if ($(this).hasClass('active')) {
                                removeValue(readLaterPosts, id);
                            }else{
                                readLaterPosts.push(id);
                            };
                            $('.read-later[data-id="'+ id +'"]').each(function(index, el) {
                                $(this).toggleClass('active');
                            });
                            Cookies.set('okiku-read-later', readLaterPosts, { expires: 365 });
                            bookmarks(readLaterPosts);
                        });
                    });

                    if (results) {
                        $('header .counter').removeClass('hidden').text(results.length);
                    }else{
                        $('header .counter').addClass('hidden');
                        $('.bookmark-container').append('<p class="no-bookmarks"></p>');
                        $('.no-bookmarks').html(noBookmarksMessage)
                    };

                })
                .catch((err) => {
                    console.error(err);
                });

        } else {
            $('header .counter').addClass('hidden');
            $('.bookmark-container').append('<p class="no-bookmarks"></p>');
            $('.no-bookmarks').html(noBookmarksMessage)
        };
    }

    function removeValue(arr) {
        var what, a = arguments,
            L = a.length,
            ax;
        while (L > 1 && arr.length) {
            what = a[--L];
            while ((ax = arr.indexOf(what)) !== -1) {
                arr.splice(ax, 1);
            }
        }
        return arr;
    }

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