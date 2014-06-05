


Date.prototype.format = function (format) {
    /*
     * eg:format="YYYY-MM-dd hh:mm:ss";
     */
    var  o = {
        "M+"  : this .getMonth() + 1,  // month
        "d+"  : this .getDate(),  // day
        "h+"  : this .getHours(),  // hour
        "m+"  : this .getMinutes(),  // minute
        "s+"  : this .getSeconds(),  // second
        "q+"  :Math.floor(( this .getMonth() + 3) / 3),  // quarter
        "S"  : this .getMilliseconds()
    }
    if  (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this .getFullYear() +  "" )
            .substr(4 - RegExp.$1.length));
    }

    for  (  var  k  in  o) {
        if  ( new  RegExp( "("  + k +  ")" ).test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
                : ("00"  + o[k]).substr(( ""  + o[k]).length));
        }
    }
    return  format;
}


function formatPostTime(time){
    return new date(time).format('YYYY-MM-dd hh:mm:ss');
}

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
            img: 'images/loading.gif',
            msgText: "加载中...",
            selector: '.loading'
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

$(function(){
    $("img").error(function(){
        $(this).closest('div.card').hide();
    })
})
