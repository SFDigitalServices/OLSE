function openOverlay(olEl) {
    $oLay = jQuery(olEl);

    if (jQuery('#overlay-shade').length === 0)
        jQuery('body').prepend('<div id="overlay-shade"></div>');

    jQuery('#overlay-shade').fadeTo(100, 0.6, function() {
        var props = {
            oLayWidth       : $oLay.width(),
            scrTop          : $(window).scrollTop(),
            viewPortWidth   : $(window).width()
        };

        var leftPos = (props.viewPortWidth - props.oLayWidth) / 2;

        $oLay
            .css({
                display : 'block',
                opacity : 0,
                top : '-=300',
                left : leftPos+'px'
            })
            .animate({
                top : props.scrTop + 40,
                opacity : 1
            }, 600);
    });
}
function openOverlayInline(attachTo) {
    // remove any previous elements
    jQuery('.retrieve-businessname').remove();
    $html = '<div class="retrieve-businessname" class="overlay1" style="float:none; width: 50%;"> '
        + ' <label style="float:left; margin-top:12px;">Retrieving business name...</label>'
        + ' <img src="/sites/all/themes/skeletontheme/images/loading-x.gif" style="width:75px; height: 50px;" /> '
        +'</div>';
    jQuery(attachTo).append($html);

    // if element loses focus, remove this
    jQuery(attachTo).focusout( function(){
        jQuery('.retrieve-businessname').remove();
    })
}
function closeOverlayInline() {
    jQuery('.retrieve-businessname').remove();
}
function closeOverlay() {
    jQuery('.overlay').animate({
        top : '-=300',
        opacity : 0
    }, 400, function() {
        jQuery('#overlay-shade').fadeOut(100);
        jQuery(this).css('display','none');
    });
}
function GetQueryStringParams(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}
function toTitleCase(str) {
    return str.replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
    });
}
