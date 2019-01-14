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

    var swiperMain = new Swiper('.swiper-main', {
        slidesPerView: 3,
        spaceBetween: 5,
    });

});