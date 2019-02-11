/**
 * Main JS file for okiku
 */

jQuery(document).ready(function($) {

    var config = {
        'disqus-shortname': 'hauntedthemes-demo',
        'content-api-host': '',
        'content-api-key': '',
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

    var instanceMenu, instanceSearch, instanceBookmark;

    if(w >= 992){
        instanceBookmark = $('.bookmark-container').overlayScrollbars({
            resize: "vertical",
            sizeAutoCapable: false
        }).overlayScrollbars();
        instanceSearch = $('#results').overlayScrollbars({
            resize: "vertical",
            sizeAutoCapable: false
        }).overlayScrollbars();
        instanceMenu = $('.navigation .inner').overlayScrollbars({
            resize: "vertical",
            sizeAutoCapable: false
        }).overlayScrollbars();
    }

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
        breakpoints: {
            991: {
                slidesPerView: 2,
            },
            575: {
                spaceBetween: 0,
                slidesPerView: 1,
            },
        }
    };

    var swiperMain = new Swiper('.swiper-main', swiperMainData);
    $('header').midnight();

    if(w < 992){
        $('.swiper-main .swiper-slide, .post-header').height(h);
    }else{
        enableRelax();
    }

    $(window).on('load', function(event) {

        setGalleryRation();

        // Make all images from gallery ready to be zoomed
        $('.kg-gallery-image img').each(function(index, el) {
            $( "<a href='" + $(this).attr('src') + "' class='zoom'></a>" ).insertAfter( $(this) );
            $(this).appendTo($(this).next("a"));
        });

        $('.zoom').fluidbox();
        
    });

    $('.view-more').on('click', function (event) {
        event.preventDefault();
        $("html,body").animate({scrollTop: $('.post-header').height() + 1}, 600);
    });

    $(window).on('scroll', function(event) {
        $('.zoom').fluidbox('close');
        if ($('.post-template').length) {
            progressBar();
        };
    });

    $(window).on('resize', function(event) {
        w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        var check = 0;

        if($('.navigation .inner').hasClass('os-host')){
            instanceMenu.destroy();
        }
        if($('.bookmark-container').hasClass('os-host')){
            instanceBookmark.destroy();
        }
        if($('#results').hasClass('os-host')){
            instanceSearch.destroy();
        }

        if(w >= 992){
            instanceMenu = $('.navigation .inner').overlayScrollbars({
                resize: "vertical",
                sizeAutoCapable: false
            }).overlayScrollbars();
            instanceSearch = $('#results').overlayScrollbars({
                resize: "vertical",
                sizeAutoCapable: false
            }).overlayScrollbars();
            instanceBookmark = $('.bookmark-container').overlayScrollbars({
                resize: "vertical",
                sizeAutoCapable: false
            }).overlayScrollbars();
            $('.loop .swiper-slide, .post-header').height('100vh');
        }else{
            $('.loop .swiper-slide').height(h);
        }

    });

    if(w >= 992){
        animateSocialIconsOnLoop($('.swiper-main .swiper-slide'));
    }

    function animateSocialIconsOnLoop(element){
        element.each(function(index, el) {
            $(this).on('mouseenter', function (e) {
                var index = $(this).index()+1;
                anime({
                    targets: '.swiper-main .swiper-slide:nth-child('+ index +') .share li',
                    translateY: -60,
                    delay: anime.stagger(50),
                    opacity: 1,
                });
            });
            $(this).on('mouseleave', function (e) {
                var index = $(this).index()+1;
                anime.remove('.swiper-main .swiper-slide:nth-child('+ index +') .share li');
                anime({
                    targets: '.swiper-main .swiper-slide:nth-child('+ index +') .share li',
                    translateY: 60,
                });
            });
        });
    }

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
            if(!$('#content .share').hasClass('begin') && w >= 992){
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
            if($('#content .share').hasClass('begin') && w >= 992){
                $('#content .share').removeClass('begin');
                anime({
                    targets: '#content .share li',
                    translateX: -20,
                });
            }
        }else{
            if($('#content .share').hasClass('begin') && w >= 992){
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
        anime({
            targets: '.bookmark-container .anime',
            delay: anime.stagger(50),
            opacity: 1,
        });
        anime({
            targets: '#results .anime',
            delay: anime.stagger(50),
            opacity: 1,
        });
        if($('.bookmark-container').hasClass('os-host')){
            instanceBookmark.destroy();
            instanceBookmark = $('.bookmark-container').overlayScrollbars({
                resize: "vertical",
                sizeAutoCapable: false
            }).overlayScrollbars();
        }
    })

    $('#menu').on('hidden.bs.modal', function (e) {
        anime.remove('.nav li');
        anime.remove('.no-bookmarks, .search form');
        anime.remove('.bookmark-container .anime');
        anime.remove('#results .anime');
        anime({
            targets: '.nav li',
            translateY: 0,
            opacity: 0,
        });
        anime({
            targets: '.no-bookmarks, .search form',
            opacity: 0
        });
        anime({
            targets: '#results .anime',
            opacity: 0
        });
        anime({
            targets: '.bookmark-container .anime',
            opacity: 0
        });
    })

    var ghostSearch = new GhostSearch({
        host: config['content-api-host'],
        key: config['content-api-key'],
        results: '#results',
        input: '#search-field',
        api: {
            parameters: { 
                fields: ['title', 'slug', 'published_at', 'feature_image', 'primary_tag', 'id'],
                include: 'tags',
            },
        },
        on: {
            afterDisplay: function(results){

                $('#results').empty();
                
                var tags = [];
                $.each(results, function(index, val) {
                    if (val.obj.primary_tag) {
                        if ($.inArray(val.obj.primary_tag.name, tags) === -1) {
                            tags.push(val.obj.primary_tag.name);
                        };
                    }else{
                        if ($.inArray('Other', tags) === -1) {
                            tags.push('Other');
                        };
                    };
                });

                tags.sort();

                $.each(tags, function(index, val) {
                    var tag = val;
                    if (val == 'Other') {
                        tag = $('#results').attr('data-other');
                    };
                    $('#results').append('<h5 class="anime">'+ tag +'</h5><ul data-tag="'+ val +'" class="list-box"></ul>');
                });

                $.each(results, function(index, val) {
                    var dateSplit = val.obj.published_at.split('T');
                    dateSplit = dateSplit[0].split('-');
                    var month = monthNames[dateSplit[1]-1];
                    var date = moment(dateSplit[2]+'-'+month+'-'+dateSplit[1], "DD-MM-YYYY").format('DD MMM YYYY');
                    if (val.obj.primary_tag) {
                        $('#results ul[data-tag="'+ val.obj.primary_tag.name +'"]').append('<li class="anime"><a href="#" class="read-later" data-id="'+ val.obj.id +'"></a><a href="/'+ val.obj.slug +'/">'+ val.obj.title +'</a><time>'+ date +'</time></li>');
                    }else{
                        $('#results ul[data-tag="Other"]').append('<li class="anime"><a href="#" class="read-later" data-id="'+ val.obj.id +'"></a><a href="/'+ val.obj.slug +'/">'+ val.obj.title +'</a><time>'+ date +'</time></li>');
                    };
                });

                anime({
                    targets: '#results .anime',
                    delay: anime.stagger(50),
                    opacity: 1,
                });

                if($('#results').hasClass('os-host')){
                    instanceSearch.destroy();
                    instanceSearch = $('#results').overlayScrollbars({ }).overlayScrollbars();
                }

            }
        }
    })

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
                    var post = $(content).find('.swiper-main .swiper-slide').addClass('loading');
                    swiperMain.appendSlide(post);
                    if(w >= 992){
                        animateSocialIconsOnLoop($('.swiper-main .swiper-slide.loading'));
                    }else{
                        $('.swiper-main .swiper-slide').height(h);
                    }
                    readLaterPosts = readLater($('.swiper-main .swiper-slide.loading'), readLaterPosts);
                    $('.swiper-main .swiper-slide.loading').removeClass('loading');
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

    // Check 'read later' posts 
    if (typeof Cookies.get('okiku-read-later') !== "undefined") {
        readLaterPosts = JSON.parse(Cookies.get('okiku-read-later'));
    }

    readLaterPosts = readLater($('.share'), readLaterPosts);

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

                    var tags = [];
                    $.each(results, function(index, val) {
                        if (val.primary_tag) {
                            if ($.inArray(val.primary_tag.name, tags) === -1) {
                                tags.push(val.primary_tag.name);
                            };
                        }else{
                            if ($.inArray('Other', tags) === -1) {
                                tags.push('Other');
                            };
                        };
                    });
    
                    tags.sort();

                    $.each(tags, function(index, val) {
                        var tag = val;
                        if (val == 'Other') {
                            tag = $('.bookmark-container').attr('data-other');
                        };
                        $('.bookmark-container').append('<h5 class="anime">'+ tag +'</h5><ul data-tag="'+ val +'" class="list-box"></ul>');
                    });
    
                    $.each(results, function(index, val) {
                        var dateSplit = val.published_at.split('T');
                        dateSplit = dateSplit[0].split('-');
                        var month = monthNames[dateSplit[1]-1];
                        var date = moment(dateSplit[2]+'-'+month+'-'+dateSplit[1], "DD-MM-YYYY").format('DD MMM YYYY');
                        if (val.primary_tag) {
                            $('.bookmark-container ul[data-tag="'+ val.primary_tag.name +'"]').append('<li class="anime"><a href="#" class="read-later active" data-id="'+ val.id +'"><i class="far fa-bookmark"></i></a><a href="/'+ val.slug +'/">'+ val.title +'</a><time>'+ date +'</time></li>');
                        }else{
                            $('.bookmark-container ul[data-tag="Other"]').append('<li class="anime"><a href="#" class="read-later active" data-id="'+ val.id +'"><i class="far fa-bookmark"></i></a><a href="/'+ val.slug +'/">'+ val.title +'</a><time>'+ date +'</time></li>');
                        };
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
                        $('header .counter').removeClass('hidden').text(readLaterPosts.length);
                        anime({
                            targets: '.bookmark-container .anime',
                            delay: anime.stagger(50),
                            opacity: 1,
                        });
                    }else{
                        $('header .counter').addClass('hidden');
                        $('.bookmark-container').append('<p class="no-bookmarks"></p>');
                        $('.no-bookmarks').html(noBookmarksMessage);
                        anime({
                            targets: '.no-bookmarks, .search form',
                            opacity: 1
                        });
                    };

                })
                .catch((err) => {
                    console.error(err);
                });

        } else {
            $('header .counter').addClass('hidden');
            $('.bookmark-container').append('<p class="no-bookmarks"></p>');
            $('.no-bookmarks').html(noBookmarksMessage);
            anime({
                targets: '.no-bookmarks, .search form',
                opacity: 1
            });
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

    // Initialize Disqus comments
    if ($('#content').attr('data-id') && config['disqus-shortname'] != '') {

        $('.comments .btn').on('click', function(event) {
            event.preventDefault();
            $(this).addClass('d-none');
            $('.comments').append('<div id="disqus_thread"></div>');

            var url = [location.protocol, '//', location.host, location.pathname].join('');
            var disqus_config = function() {
                this.page.url = url;
                this.page.identifier = $('#content').attr('data-id');
            };

            (function() {
                var d = document,
                    s = d.createElement('script');
                s.src = '//' + config['disqus-shortname'] + '.disqus.com/embed.js';
                s.setAttribute('data-timestamp', +new Date());
                (d.head || d.body).appendChild(s);
            })();
        });

    };

});