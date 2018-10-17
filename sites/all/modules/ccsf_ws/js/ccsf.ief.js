/**
 * @file
 * Provides JavaScript for Inline Entity Form.
 */

(function ($) {
    Drupal.behaviors.ccsf_ws = {
        attach: function (context) {
            // clean node title when adding a new reference entity
            if($("#edit-field-additional-owners-und-form-title").val() == 'default title')
                $("#edit-field-additional-owners-und-form-title").val("");

            if($("#edit-field-additional-business-und-form-title").val() == 'default title')
                $("#edit-field-additional-business-und-form-title").val("");

            if($("#edit-field-additional-claimants-und-form-title").val() == 'default title')
                $("#edit-field-additional-claimants-und-form-title").val("");
 	    
            if($("#edit-field-payment-summary-und-form-title").val() == 'default title')
               $("#edit-field-payment-summary-und-form-title").val(" ");


            // mark any changes within IEF, notify user if navigating away from intake form.
            var msg = "You have unsaved changes in Activity Summary, please press the 'Save' button before navigating away. If you continue, your unsaved changes will be lost.";
            if(typeof Drupal.markPageUnsaved === "function"){
                $('input, select').change(function() {Drupal.markPageUnsaved(msg)}); // checkboxes, radio buttons and selects
                $('input, textarea').keypress(function() {Drupal.markPageUnsaved(msg)}); // textfields and textareas
                $('textarea').change(function() {Drupal.markPageUnsaved(msg)}); // textfields and textareas

                //Mark at start if there are form errors
                if ( (jQuery('.form-item .error').length > 0 )) Drupal.markPageUnsaved(msg);
            }

            if($("#attachment-delta-0").length < 1){
                $(".field-name-field-attachments").each( function(delta){
                    $(this).prepend('<span class="show-attachments" id="attachment-delta-'+ delta +'"> <img src="/sites/default/files/download_32.png"></span>');
                    var eleDelta = 'attachment-delta-'+ delta;
                    $("#" + eleDelta).click( function(){
                        //$(this).html("Collapse");
                        $(this).siblings('.field-items').children().each(function (){
                            $(this).toggle();
                            $(this).find("a").each( function(){
                                // open in new window
                                $(this).attr('target', '_blank');
                                //if($(this).attr('href').indexOf("drive.google.com") < 1)
                                    //$(this).attr('href',"https://drive.google.com/open?id="+$(this).attr('href').replace("http://apps.sfgov.org/olsecms/",""));
                            })
                        })
                    });
                });
                //format activity date
		  $(".field-name-field-activity-date .field-item .date-display-single, .field-name-field-payment-date .field-item .date-display-single,.field-name-field-payment-due-date .field-item .date-display-single").each( function(){
		var activitydate = new Date($(this).attr('content'));
                    $(this).html(activitydate.toLocaleDateString());
                });
            }
            //$(".field-name-field-additional-bn div div input[type=text]").each( function(index){
            // works in Edit mode
            $("#ief-entity-table-edit-field-additional-business-und-entities .ief-row-form > td > div > div > input[type=text]").each( function(index){
            	var that = this;
            	// get delta from: edit-field-additional-business-und-entities-1-form-title
            	var field_delta = $(this).prop('id').split("-");
            	field_delta = field_delta[6];
                $("#" +$(this).attr('id')).autocomplete(
                    {
                        source: function( request, response ) {
                            openOverlayInline($(that).parent());
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
                                    	var dbaname = data[index]['dba_name'].toLowerCase();
                                        var ownershipname = data[index]['ownership_name'].toLowerCase();
                                        if( (dbaname != '' && dbaname.indexOf(request.term.toLowerCase(), 0) === 0) 
                                        		|| (ownershipname != '' && ownershipname.indexOf(request.term.toLowerCase(), 0) === 0)){
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
                            //$(".field-name-field-additional-bl .form-textarea-wrapper textarea").val(ui.item.full_business_address);
                            
                            if($("#edit-field-additional-business-und-entities-"+field_delta+"-form-field-business-address-und-0-field-address-und-0-value").val() == '')
                        		$("#edit-field-additional-business-und-entities-"+field_delta+"-form-field-business-address-und-0-field-address-und-0-value").val(ui.item.full_business_address);
                            if($("#edit-field-additional-business-und-entities-"+field_delta+"-form-field-business-address-und-0-field-city-und-0-value").val() == '')
                            	$("#edit-field-additional-business-und-entities-"+field_delta+"-form-field-business-address-und-0-field-city-und-0-value").val(ui.item.city);
                            if($("#edit-field-additional-business-und-entities-"+field_delta+"-form-field-business-address-und-0-field-state-und").val() == '')
                            	$("#edit-field-additional-business-und-entities-"+field_delta+"-form-field-business-address-und-0-field-state-und").val(ui.item.business_zip);
                            if($("#edit-field-additional-business-und-entities-"+field_delta+"-form-field-business-address-und-0-field-zip-code-und-0-value").val() == '')
                            	$("#edit-field-additional-business-und-entities-"+field_delta+"-form-field-business-address-und-0-field-zip-code-und-0-value").val(ui.item.state);
                            
                        },
                        open: function() {
                            closeOverlayInline();
                            $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
                        },
                        close: function() {
                            closeOverlayInline();
                            $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
                        }

                    });
            });

            // works in Create new mode
            $(".form-item-field-additional-business-und-form-title input[type=text]").each( function(index){
                var that = this;
                $("#" +$(this).attr('id')).autocomplete(
                    {
                        source: function( request, response ) {
                            openOverlayInline($(that).parent());
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
                                    	var dbaname = data[index]['dba_name'].toLowerCase();
                                        var ownershipname = data[index]['ownership_name'].toLowerCase();
                                        if( (dbaname != '' && dbaname.indexOf(request.term.toLowerCase(), 0) === 0) 
                                        		|| (ownershipname != '' && ownershipname.indexOf(request.term.toLowerCase(), 0) === 0)){
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
                            if($("#edit-field-additional-business-und-form-field-business-address-und-0-field-address-und-0-value").val() == '')
                        		$("#edit-field-additional-business-und-form-field-business-address-und-0-field-address-und-0-value").val(ui.item.full_business_address);
                            if($("#edit-field-additional-business-und-form-field-business-address-und-0-field-city-und-0-value").val() == '')
                            	$("#edit-field-additional-business-und-form-field-business-address-und-0-field-city-und-0-value").val(ui.item.city);
                            if($("#edit-field-additional-business-und-form-field-business-address-und-0-field-state-und").val() == '')
                            	$("#edit-field-additional-business-und-form-field-business-address-und-0-field-state-und").val(ui.item.state);
                            if($("#edit-field-additional-business-und-form-field-business-address-und-0-field-zip-code-und-0-value").val() == '')
                            	$("#edit-field-additional-business-und-form-field-business-address-und-0-field-zip-code-und-0-value").val(ui.item.business_zip);
                            
                        },
                        open: function() {
                            closeOverlayInline();
                            $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
                        },
                        close: function() {
                            closeOverlayInline();
                            $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
                        }

                    });
            });
        },
    };

})(jQuery);
