/**
 * Created by admintk on 3/3/15.
 */

(function ($) {
    Drupal.behaviors.droogle = {
        attach: function (context, settings) {
           $('.gdocs-links').each(function(){
              var href = $(this).attr('href');
                //http://docs.google.com/gview?embedded=true&
              // bind each click event to target iframe with dynamic url
               $(this).click( function(){
                   //$("#googledocs").dialog();

                   //href = "http://docs.google.com/gview?embedded=true&url=" + encodeURIComponent(href) + "&output=embed";
                   //console.log(href);
                   //$("#gdoc_embbed").prop("src", (href+"&output=embed") );
                   //$("#googledocs").load(href);
                   window.open(href, "target=_blank");
                   return false;
               });
           });
        }
    };
}(jQuery));