/**
 * @file
 * Provides JavaScript for Inline Entity Form.
 */

(function ($) {

/**
 * Allows submit buttons in entity forms to trigger uploads by undoing
 * work done by Drupal.behaviors.fileButtons.
 */
Drupal.behaviors.inlineEntityForm = {
  attach: function (context) {
    if (Drupal.file) {
      $('input.ief-entity-submit', context).unbind('mousedown', Drupal.file.disableFields);
    }
    $(".field-name-field-additional-bn div div input[type=text]").each( function(index){
        $("#" +$(this).attr('id')).autocomplete(
            {
                source: function( request, response ) {
                    $.ajax({
                        url: "https://data.sfgov.org/resource/g8m3-pdis.json",
                        dataType: "json",
                        data: {
                            $q: request.term.toLowerCase()
                        },
                        success: function( data ) {
                            var i = 0;
                            var datasource = new Object();
                            for(index=0;index<data.length;index++){
                                var dba_name = data[index]['dba_name'].toLowerCase();
                                if(dba_name.startsWith(request.term.toLowerCase()) > 0){
                                    data[index].value = data[index]['dba_name'] + " : " + data[index]['full_business_address'];
                                    datasource[i] = data[index];
                                    i++;
                                }
                            }
                            response( datasource );
                        }
                    });
                },
                minLength: 3,
                select: function( event, ui ) {
                    $(".field-name-field-additional-bl .form-textarea-wrapper textarea").val(ui.item.full_business_address);
                },
                open: function() {
                    $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
                },
                close: function() {
                    $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
                }

            });
    });

  },
  detach: function (context) {
    if (Drupal.file) {
      $('input.form-submit', context).bind('mousedown', Drupal.file.disableFields);
    }
  }
};

})(jQuery);
