$(function() {

    var $container = $('#ms-container');

    $container.imagesLoaded(function() {
        $container.masonry({
            itemSelector: '.ms-item',
            columnWidth: '.ms-item'
        });
    });


    $container.infinitescroll({
        navSelector: "#nextpage",
        nextSelector: "#nextpage a",
        itemSelector: ".ms-item",
        pixelsFromNavToBottom: 300,
        loading: {
            finishedMsg: '没有更多的页面加载。',
            img: 'images/loading.gif'
        }
    },
    function(newElements) {
        //首先隐藏
        var $newElems = $(newElements).css({opacity: 0});
        $newElems.imagesLoaded(function() {
            //布局时显示
            $newElems.animate({opacity: 1});
            $container.masonry('appended', $newElems, true);

            $newElems.find('div.comments-collapse-toggle>a').on('click', function() {
                $(this).parent('div.comments-collapse-toggle').next('div.comments').toggle();
                $container.masonry('layout');
            })
        });
    });


    $('div.comments-collapse-toggle>a').on('click', function() {
        $(this).parent('div.comments-collapse-toggle').next('div.comments').toggle();
        $container.masonry('layout');
    })

    /*
    $container.infinitescroll({
        navSelector: "#nextpage",
        nextSelector: "#nextpage a",
        itemSelector: ".ms-item",
        pixelsFromNavToBottom: 300,
        loading: {
            finishedMsg: '没有更多的页面加载。',
            img: 'images/ajax-loader.gif',
            msgText: "",
            msg:null
        },
        // other options
        debug           : false,
        dataType: 'json',
        appendCallback: false


    }, function(json, opts) {
        var page = opts.state.currPage;
        var template=$('#posts_template').html();
        console.log(json);
        var newElements= _.template(template,{posts:json});
        //首先隐藏

        console.log(newElements);
        var $newElems = $(newElements).css({opacity: 0});
        $newElems.animate({opacity: 1});
        $container.masonry('appended', $newElems, true);
        //$container.masonry('layout');

        $newElems.imagesLoaded(function() {
            //布局时显示
            $newElems.animate({opacity: 1});
            $container.masonry('appended', $newElems, true);

            $newElems.find('div.comments-collapse-toggle>a').on('click', function() {
                $(this).parent('div.comments-collapse-toggle').next('div.comments').toggle();
                $container.masonry('layout');
            })
        });

    });*/



});
