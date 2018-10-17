/**
 * Created by admintk on 4/15/15.
 * Updated 9/7/2016
 */

(function ($){
    function loadActivityDescription(casetype){
    	casetype = casetype.toLowerCase();
        if($("#edit-field-activity-description-und").val() != 'other')
            $("#edit-field-other-activity-description").hide();
        if($("#edit-field-activity-type-und").val() != 'other')
            $("#edit-field-other-activity-type").hide();
        if($("#edit-field-activity-type-und").val() == 'correspondence' ){
            // if(casetype == 'mwo' || casetype == 'pslo' || casetype ==
			// 'pslomwo'){
        	if(casetype.indexOf('mwo') > -1 || casetype.indexOf('pslo') > -1 ||  casetype.indexOf('pslomwo') > -1){
                var mwopslo  = ["advisory", "audit", "citation", "notice_of_d", "settlement_ag"];
                $("#edit-field-activity-description-und option").each(function(){
                    if( ! ( $.inArray($(this).val(), mwopslo) > -1) )
                        $(this).remove();
                });
            }
            // else if(casetype == 'hcso'){
            else if(casetype.indexOf('hcso') > -1 ){
                var hcso = ["np_violation","notice_violation","d_violation","no_violation","with_violation","settlement","dov","escrow"];
                $("#edit-field-activity-description-und option").each(function(){
                    if( !($.inArray($(this).val(), hcso) > -1) ){
                        $(this).remove();
                    }
                });
            }
        }
        else if($("#edit-field-activity-type-und").val() == 'phone' || jQuery("#edit-field-activity-type-und").val() == 'email' ){
            var other = ["claimant","from_claimant","claimant_rep","from_claimant_rep","emp","from_employer","emp_rep","from_employer_rep","other"];
            $("#edit-field-activity-description-und option").each(function(){
                if( !($.inArray($(this).val(), other) > -1) )
                    $(this).remove();
            });
            $("#edit-field-activity-description-und").change( function(){
                if($(this).val() == 'other')
                    $("#edit-field-other-activity-description").show();
                else
                    $("#edit-field-other-activity-description").hide();
            });
        }
        else if($("#edit-field-activity-type-und").val() == 'meeting' ){
            var meetings = ["withstaff","withworkers","withemployers","withworkersrep","withemployerrep","withattorney"];
            $("#edit-field-activity-description-und option").each(function(){
                if( !($.inArray($(this).val(), meetings) > -1) ){
                    $(this).remove();
                }
            });
        }
        else{
            $("#edit-field-activity-description-und option").each(function(){
                $(this).remove();
            });
            $("#edit-field-activity-description-und").append('<option value="none">none</option>');
        }
    }
    // utility functions
    function getCurrentNodeId() {
        var $body = $('body.page-node');
        if ( ! $body.length )
          return false;
        var bodyClasses = $body.attr('class').split(/\s+/);
        for ( i in bodyClasses ) {
          var c = bodyClasses[i];
          if ( c.length > 10 && c.substring(0, 10) === "page-node-" )
            return parseInt(c.substring(10), 10);
        }
        return false;
      }

    function getTodayDate(){
    	var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; // January is 0!
        var yyyy = today.getFullYear();

        if(dd<10) {
            dd='0'+dd
        } 

        if(mm<10) {
            mm='0'+mm
        } 

        today = mm+'/'+dd+'/'+yyyy;
        
        return today;
    }
    // create payment worksheet
    function createPaymentSchedule(id, currentNid, checklist){
        var createlist = "nid=" + currentNid + "&type=worksheet&title=" + encodeURIComponent($("#edit-field-spreadsheet-title-und-0-value").val()) + "&fileid=" + id;
        createlist += "&startdate=" + $(".form-item-field-1st-payment-date-und-0-value-date input").val().replace(/\//gi,'_');
        createlist += "&totalnumber=" + $("#edit-field-total-amount-und-0-value").val();
        createlist += "&payments=" + $("#edit-field-number-of-payments-und-0-value").val();
        createlist += "&frequency=" + $("#edit-field-payment-frequency-und option:selected").val();
        createlist += "&city_penalties=" + $("#edit-field-penalties-to-city-und-0-value").val();
        createlist += "&city_penalties_payments=" + $("#edit-field-payments-to-the-city-und-0-value").val();
        $("#paymentschedule_worksheet").click( function(){
            openOverlay('#overlay-inAbox');
            $.ajax({
                url: "/olsecms/droogle/ajax/" + createlist + "&checklist=" + checklist,
                cache: true
            }).done(function(data){
                closeOverlay();
            }).fail(function(){
                closeOverlay();
            });
            return false;
        });

        // step 3, payment tracking, add link to create payment tracking
        $("<a href='' id='paymenttracking_worksheet' class='google-doc-links link-button'> Payment Tracking</a>").insertAfter("#paymentschedule_worksheet");
        $(".group-step3").show();
        $("#paymenttracking_worksheet").click( function(){
            openOverlay('#overlay-inAbox');
            createlist = createlist.replace("type=worksheet","type=paymenttracking")
            createlist += "&penalties_city=" + $("#edit-field-penalties-to-city-und-0-value").val();
            createlist += "&payment_type=" + $("#edit-field-payment-type-und option:selected").val();
            $.ajax({
                url: "/olsecms/droogle/ajax/" + createlist,
                cache: true
            }).done(function(data){
                closeOverlay();
            }).fail(function(){
                closeOverlay();
            });
            return false;
        });
    }

    // reset link click
    function resetPaymentWorksheets(id, currentNid){
        var resetlist = "nid=" + currentNid + "&type=resetworksheet&title=" + encodeURIComponent($("#edit-field-spreadsheet-title-und-0-value").val()) + "&fileid=" + id;
        $("#reset_worksheet").click( function(){
            $("#edit-field-spreadsheet-link-und-0-value").val("");
            $("#edit-field-spreadsheet-title-und-0-value").val("");
            openOverlay('#overlay-inAbox');
            $.ajax({
                url: "/olsecms/droogle/ajax/" + resetlist,
                cache: true
            }).done(function(data){
                $(".group-step2").hide();
                $(".group-step3").hide();
                $("#paymentschedule_worksheet").remove();
                $("#reset_worksheet").remove();
                $("#paymentworksheet").remove();
                $("#paymenttracking_worksheet").remove();
                $("#sync_google_doc").show();
                closeOverlay();
            });
            return false;
        });

    }

   // Case Record UI init
    function initUI(uid){
    	// some fields show be hidden initially
    	$("#navigation").hide();
        $(".tabledrag-toggle-weight-wrapper").hide();
        
        // attach business name to title edit-field-bnhhidden-und-0-value, and
		// move it to the header staus - case# - business dba
        $("#page-title").html('<div class="bn-title"> ' +  $("#edit-field-current-claim-status-und option:selected").text() + ' #' + $("#edit-title").val() + ' '+ $("#edit-field-business-name-und-0-value").val() + '</div>');
        $("#site-name").detach();
        var element = $("#page-title").detach()
        $("#name-and-slogan").append(element);
        $("#page-title").prepend('<div class="go-back"><a href="../../reports/cases" class="btn btn-primary"> << Home </a></div>');

        // turn off autocomplete for business name field
        $("#edit-field-business-name-und-0-value").prop("autocomplete","off"); // turnoff browser autocomplete

        // move the edit action div to top, if user scroll to bottom, move it to
		// the bottom.
        var element = $('#edit-actions').detach();
        var element2 = $(".nav-menu-steps").detach();
        $(".node-intake_form-form > div:first-child").prepend(element);
        $(".node-intake_form-form").prepend(element2);
        $(".node-intake_form-form").prepend(element);

        // add scroll listener to move menu from/to top to/from bottom
        $(window).scroll( function(){
            docHeight = $(document).height();
            if($(window).scrollTop() > docHeight / 5 ){ // scroll up
                var element = $('#edit-actions').detach();
                $(".node-intake_form-form").append(element2);
                $(".node-intake_form-form").append(element);
            } // scroll down
            else if($(window).scrollTop() < docHeight / 5){
                var element = $('#edit-actions').detach();
                $(".node-intake_form-form").prepend(element2);
                $(".node-intake_form-form").prepend(element);
            }
        });
        
        // set default compliance officer
        if($("#edit-field-compliance-officer-und").val() == '_none')
            $("#edit-field-compliance-officer-und").val(uid);
        // HRA no longer used, hide if no value is set
        if($("#edit-field-c-hra-und-0-value").val() == ""){
        	$("#edit-field-c-hra").hide();
        	$("#edit-field-assessment-for-workers-und option[value='hra']").remove();
        }
        
        // set payment fields based on case type
        switch($("#edit-field-claim-type-und").val()){
        	case "hcso": $("#edit-field-back-wages").hide(); $("#edit-field-penalties-to-worker").hide();$("#edit-field-c-back-wages-and-interest").hide(); $("#edit-field-c-penalties-to-worker").hide();$("#edit-field-wages-recovered-other-agen").hide();
        		$("#edit-field-c-wages-recovered-other").hide(); break;
        	case "mwo": break;
        	case "pslo": break;
        	default: break;
        }
        
        // add link to datasf business name search
		// element.parentNode.insertBefore(newElement, element.nextSibling);
        var newNode = "<a target='_blank' href='https://data.sfgov.org/Economy-and-Community/Registered-Business-Locations-San-Francisco/g8m3-pdis'> Business Registration Search</a>";
        $(".form-item-field-business-name-und-0-value > label").html($(".form-item-field-business-name-und-0-value > label").html() + " " + newNode);
        if($("#letter-download-link").length > 0){
        	var href = $('#letter-download-link').prop('href');
        	window.location.href = href;
        }
        var newNode = "<a id='file-browser' href='file:///c:/'> File Browser</a>";
        $(".form-item-field-case-files-input-und-0-value > label").html(newNode );
        
        // show or hide activity summary entry
        if( $("#edit-field-save-current-activity-und").is(":checked") )
        	$(".group-activity-entry").show();
        else
        	$(".group-activity-entry").hide();
        
       // grey out primary business contact info
        $("#edit-field-primary-business-contact-und-0-value").prop('disabled', true);
        $("#edit-field-primary-business-contact-t-und-0-value").prop('disabled', true);
        $("#edit-field-primary-business-contact-e-und-0-email").prop('disabled', true);
        $("#edit-field-primary-contact-phone-2-und-0-value").prop('disabled', true);
        $("#edit-field-company-name-und-0-value").prop('disabled', true);
        $("#edit-field-amount-outstanding-und-0-value").prop('disabled', true);
        
        // disabled Payment Entry collected/paid inputs, these are calculated.
        $(".group-collected-paid input").prop("disabled", "true");
        $(".group-assessed input").prop("disabled", "true");
    }
    
    function setupEditFormEventHandlers(){
        // if populate from business address is checked
        $("#edit-field-populate-business-address-und").click( function(){
        	if( $(this).is(':checked') ){
                $("#edit-field-primary-business-contact-a-und-0-field-business-address-und-0-field-address-und-0-value").val($("#edit-field-business-address-und-0-field-address-und-0-value").val());
                $("#edit-field-primary-business-contact-a-und-0-field-business-address-und-0-field-city-und-0-value").val($("#edit-field-business-address-und-0-field-city-und-0-value").val());
                $("#edit-field-primary-business-contact-a-und-0-field-business-address-und-0-field-zip-code-und-0-value").val($("#edit-field-business-address-und-0-field-zip-code-und-0-value").val());
                $("#edit-field-primary-business-contact-a-und-0-field-business-address-und-0-field-state-und").val($("#edit-field-business-address-und-0-field-state-und").val());
                $("#edit-field-primary-business-contact-a-und-0-field-business-address-und-0-field-address2-und-0-value").val($("#edit-field-business-address-und-0-field-address2-und-0-value").val());
            }
        });
        // print the activity summaries to word document
        $(document).on('click','#print_activities', function(){
        	        $.ajax({
	                    url: "/api/list/print-activities/" + getCurrentNodeId(),
	                    dataType: 'json',
	                    cache: false
	                }).done(function(url){
	                	url = $.parseJSON(url);
	                	window.location.assign(url);
	                });
        })
        // if recurring activity reminder is check
        $("#edit-field-recurring-reminder-und").click( function(){
      		$("#edit-field-recurring-reminder-type").toggle();
        });
       
        // get a list of DBA that contains user input
        var datasource = {};
        $("#edit-field-business-name-und-0-value").autocomplete(
            {
                source: function( request, response ) {
                    openOverlayInline('.form-item-field-business-name-und-0-value');
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
                                    // data[index].value =
									// data[index]['dba_name'] + " : " +
									// data[index]['full_business_address'];
                                	data[index].value = data[index]['dba_name'];
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
                	console.log(ui.item);
                	if($("#edit-field-business-name-und-0-value").val()  == '')
                		$("#edit-field-business-name-und-0-value").val(ui.item.dba_name);
                	if($("#edit-field-business-address-und-0-field-address-und-0-value").val() == '')
                		$("#edit-field-business-address-und-0-field-address-und-0-value").val(ui.item.full_business_address);
                    if($("#edit-field-business-account-und-0-value").val() == '')
                    	$("#edit-field-business-account-und-0-value").val(ui.item.certificate_number);
                    if($("#edit-field-business-address-und-0-field-city-und-0-value").val() == '')
                    	$("#edit-field-business-address-und-0-field-city-und-0-value").val(ui.item.city);
                    if($("#edit-field-business-address-und-0-field-zip-code-und-0-value").val() == '')
                    	$("#edit-field-business-address-und-0-field-zip-code-und-0-value").val(ui.item.business_zip);
                    if($("#edit-field-business-address-und-0-field-state-und").val() == '')
                    	$("#edit-field-business-address-und-0-field-state-und").val(ui.item.state);
                    if($("#edit-field-ownership-name-und-0-value").val() == '')
                    	$("#edit-field-ownership-name-und-0-value").val(ui.item.ownership_name);
                    if($("#edit-field-bnhhidden-und-0-value").val() == '')
                    	$("#edit-field-bnhhidden-und-0-value").val(ui.item.dba_name);
                    if($("#edit-field-business-dba-und-0-value").val() == '')
                    	$("#edit-field-business-dba-und-0-value").val(ui.item.dba_name);
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
        
        // set default date
        $("#edit-field-activity-date-und-0-value-datepicker-popup-0").val(getTodayDate());
        
        // save activity summary checkbox
        $("#edit-field-save-current-activity-und").change(function() {
        	if($(this).is(":checked") ){
                $(".group-activity-entry").show();
        	}
            else
            	$(".group-activity-entry").hide();    
        });
        
        // format decimal fields, users may input decimals where the thousand separator is used
        $(".group-assessed input[type='text']").change( function(){
        	$(this).val($(this).val().replace(/[^\d.-]/g, ''));
        })
    }
    
    // document ready
    $(function() {
        var uid = Drupal.settings.forena.uid;
        var hide_sco =  0;
        var d = new Date();
        var todayis = d.toLocaleDateString();
        var statushistory = $("#edit-field-status-history-und-0-value").val();

        var pathArray = window.location.pathname.split( '/' );
        var currentNid = getCurrentNodeId();
        if(pathArray.indexOf('user') > 0 )
        	$(".tabs ul.primary").show();
        
        // export overview report to Excel
        if($("#overview_block").length > 0){
	        $("#overview_block > table").prop('id', 'export-this-excel');
	        $(".export-excel").click(function(){
	        	var x = document.getElementById("export-this-excel");
	        	var thehtml = x.outerHTML.replace(/ /g, '%20');
	        	console.log(thehtml);
	        	window.open('data:application/vnd.ms-excel,'+ thehtml);
	        });
        }
        // if dashboard, move the frx table filter div to bottom if scrolling
        if($("#dashboard_block").length > 0){
	        $(window).scroll( function(){
	            docHeight = $(document).height();
	            if($(window).scrollTop() > docHeight / 5 ){ // scroll up
	                var element = $('#pager').detach();
	                $("#dashboard_block").append(element);
	            } // scroll down
	            else if($(window).scrollTop() < docHeight / 5){
	                var element = $('#pager').detach();
	                $("#dashboard_block").prepend(element);
	            }
	        });
        }
        // node edit view
        if($(".node-intake_form-form").length > 0){
            // initial page settings
            initUI(uid);
          
            // open new tab for generated document
            if($("#edit-field-document-link").length > 0){
                $("#edit-field-document-link").hide();
                if($("#edit-field-document-link-und-0-value").val() != ''){
                    window.open("https://drive.google.com/open?id="+$("#edit-field-document-link-und-0-value").val());
                    $("#edit-field-document-link-und-0-value").val("");
                }
            }
            // if editing intake form
            if($("#edit-title").val() != "") {
                $(".nav-menu-steps").show();
                $(".node-intake_form-form  > div > div").hide(); // hide
																	// claim
																	// type
                // set current tab after saving, default should be "Claim"
                switch($("#edit-field-stephidden-und-0-value").val()){
                    case "business": $(".group-business").show(); $("#click-business").addClass('menu-tab-active');
                        break;
                    case "business-contact": $(".group-business-contact").show(); $("#click-contact").addClass('menu-tab-active');
                        break;
                    case "claimant": $(".group-claimant").show();$("#click-claimant").addClass('menu-tab-active');
                        break;
                    case "activity": $(".group-activity-sheet").show(); $("#click-activity").addClass('menu-tab-active');
                        break;
                    case "payment-summary": $(".group-payment-summary").show(); $("#click-payment-summary").addClass('menu-tab-active');
                        break;
                    case "claim":
                    default:
                        $(".group-claim").show(); $("#click-claim").addClass('menu-tab-active');
                        break;
                }
                $("#edit-actions").show();
                $("#edit-field-case-files-input").show();

                // set nav tab active
                $(".nav-menu-steps input").click( function(){
                    $(".nav-menu-steps input").removeClass('menu-tab-active');
                    $(this).addClass('menu-tab-active');

                    // Activate/De-activate content divs based on above
                    $(".node-intake_form-form > div > div").hide();
                    $("#edit-actions").show();
                    $("#edit-field-case-files-input").show();

                    var id = $(this).attr('id');
                    switch(id){
                        case 'click-business': $(".group-business").show(); $("#edit-field-stephidden-und-0-value").val("business");
                            break;
                        case 'click-contact': $(".group-business-contact").show(); $("#edit-field-stephidden-und-0-value").val("business-contact");
                            break;
                        case 'click-claimant': $(".group-claimant").show(); $("#edit-field-stephidden-und-0-value").val("claimant");
                            break;
                        case 'click-activity': $(".group-activity-sheet").show(); $("#edit-field-stephidden-und-0-value").val("activity");
                            break;
                        case 'click-payment-summary': $(".group-payment-summary").show(); $("#edit-field-stephidden-und-0-value").val("payment-summary");
                            break;
                        case 'click-claim':
                        default: $(".group-claim").show(); $("#edit-field-stephidden-und-0-value").val("claim");
                            break;
                    }
                })
            }
            // if new intake form, create case # base on case type
            else{
                $(".node-intake_form-form > div > div").hide();
                $(".nav-menu-steps").hide();
                $(".group-new-case-screen").show();
                $("#edit-field-initial-status-und").change( function(){
                	if($(this).val() == 'WATCH'){
                		$("#edit-field-current-claim-status-und").removeProp('disabled');
                        $("#edit-field-current-claim-status-und").val('Watch');
                        $("#edit-field-current-claim-status-und").Prop('disabled', true);
                	}
                });
                $("#edit-field-claim-type-und").change( function(){
                    var param = $(this).val();
                    // set body background opacity
                    $("body").css({"opacity": "0.5"});
                    $.ajax({
                        url: "/api/list/casetype/"+ param,
                        dataType: 'json'
                    }).done( function(data){
                        if(data){
                            $("#edit-title").val(data);
                            $("#edit-field-casetypehidden-und-0-value").val(param);
                            $("#edit-submit").trigger('click');
                        }
                        $("body").css({"opacity": "0"});
                    });
                });
            }

            // Claim status will change if activity status changes, claim status
			// should not be changeable on the Claim screen
            $("#edit-field-current-claim-status-und").prop('disabled', true);
            var current_status = $("#edit-field-current-claim-status-und option:selected").text();
           
            $("#edit-field-activity-status-und").change( function(){
                $("#edit-field-current-claim-status-und").removeProp('disabled');
                $("#edit-field-current-claim-status-und").val($(this).val());
                $("#edit-field-status-history-und-0-value").removeProp('disabled');
                var date = new Date();
                var day = date.getDate();
                var monthIndex = date.getMonth() + 1;
                var year = date.getFullYear();
                var status_change_notes = $("#edit-field-status-history-und-0-value").val() + "\n\nStatus changed from "+ current_status + " to "+ $("#edit-field-activity-status-und option:selected").text() + " on " + monthIndex+"/"+day+"/"+year;
                $("#edit-field-status-history-und-0-value").val(status_change_notes);
            });


            // update status history, status history textarea should be disabled
            $("#edit-field-status-history-und-0-value").prop("disabled",true);
            $("#edit-field-current-claim-status-und").change( function(){
                $("#edit-field-status-history-und-0-value").val($(this).val() + " - " + todayis+ "\n" + statushistory);
            });

            // if activity sheet, load activity descriptions
            $("#edit-field-activity-und-form-field-other-activity-type").hide();
            var selectHTML = $("#edit-field-activity-description-und").html();
            if($("#edit-field-activity-type"). length > 0){
                if(($("#edit-field-activity-type-und").val() == '_none'))
                    ($("#edit-field-activity-type-und").val('none'));
                loadActivityDescription($("#edit-title").val());
                $("#edit-field-activity-type-und").change( function(){
                    // restor the select HTML
                    $("#edit-field-activity-description-und").html(selectHTML);
                    if($(this).val() == 'other')
                        $("#edit-field-other-activity-type").show();
                    else
                        $("#edit-field-other-activity-type").hide();
                    loadActivityDescription($("#edit-title").val());
                });
                
                // build compliance officer hourly rate
                $("#edit-field-act-compliance-officer-und").change( function(){
                	if($(this).val() == "_none") {$("#edit-field-co-hourly-rate-und-0-value").val(0);return;}
	                $.ajax({
	                    url: "/api/list/hourlyrate/" + $(this).val(),
	                    dataType: 'json',
	                    cache: false
	                }).done(function(data){
	                	console.log(data);
	                	console.log(data[0]);
	                	$("#edit-field-co-hourly-rate-und-0-value").val(data[0]);
	                	// calculate Activity cost
	                    var totalcost = parseFloat($("#edit-field-time-spent-und-0-value").val()) * parseFloat(data);
	                    if( isNaN(totalcost) )
	                        totalcost = 0;
	                    $("#edit-field-activity-cost-und-0-value").val(totalcost);
	                });
                });
                 
            	// time spent field updates, re-calculate
            	$("#edit-field-time-spent-und-0-value").change( function(){
                    // var totalcost =
					// parseFloat($("#edit-field-co-hourly-rate-und").val()) *
					// parseFloat($(this).val());
                    var thisvalue = $("#edit-field-co-hourly-rate-und-0-value").val();
                    var totalcost = parseFloat($(this).val()) * parseFloat(thisvalue);
                    if( isNaN(totalcost) )
                        totalcost = 0;
                    $("#edit-field-activity-cost-und-0-value").val(totalcost);
                });
                // attachShowAttachments();
            }

            setupEditFormEventHandlers();
        }
        else{
            $(".nav-menu-steps").hide();
        }
        if($(".node-payment-form").length > 0){
            currentNid = $("#edit-title").val();
            var checklist = "";
            $("#edit-field-assessment-for-workers-und input:checked").each( function(){
                checklist = checklist + $(this).val() + "|";
            });

            // get the case number, it should already created, but just in case.
            $("#edit-title").prop('disabled', 'true');
            if($("#edit-title").val() == ""){
                $.ajax({
                    url: "/api/list/casenumber/" + currentNid,
                    dataType: 'json',
                    cache: false
                }).done(function(data){
                    $("#edit-title").val(data);
                });
            }
            // check if google spreadsheet already created
            if($("#edit-field-spreadsheet-link-und-0-value").val() != ""){
                $(".group-step2").show();

                var paymentlink = "<a href='https://docs.google.com/spreadsheets/d/" + $("#edit-field-spreadsheet-link-und-0-value").val() + "/edit?usp=drivesdk' target='_blank' id='paymentworksheet' class='google-doc-links link-button'> Payment Worksheets </a>";
                $(paymentlink).insertAfter($("#sync_google_doc"));
                $("#sync_google_doc").hide();
                // add link to create 2nd payment worksheet
                $("<a href='' id='paymentschedule_worksheet' class='google-doc-links link-button'> Create  Payment Schedule</a>").insertAfter("#paymentworksheet");

                // add reset link
                $("<a href='' id='reset_worksheet' class='google-doc-links link-button'> Reset Worksheets</a>").insertAfter("#paymentschedule_worksheet");

                // create payment worksheet
                createPaymentSchedule($("#edit-field-spreadsheet-link-und-0-value").val(), currentNid, checklist);

                // reset link click
                resetPaymentWorksheets($("#edit-field-spreadsheet-link-und-0-value").val(),currentNid);
            }
            // create payment summary from google docs
            $("#sync_google_doc").click( function(){
                openOverlay('#overlay-inAbox');
                var querylist = "nid=" + currentNid + "&type=create&numberC=" + encodeURIComponent($("#edit-field-number-of-claimants-und-0-value").val()) + "&checklist=" + encodeURIComponent(checklist);

                $.ajax({
                    url: "/olsecms/droogle/ajax/" + querylist,
                    cache: false
                }).done(function(data){
                    var paymentlink = "<a href='https://docs.google.com/spreadsheets/d/" + data.id + "/edit?usp=drivesdk' target='_blank' id='paymentworksheet' class='google-doc-links link-button'> Payment Worksheets</a>";
                    $(paymentlink).insertAfter($("#sync_google_doc"));
                    $("#sync_google_doc").hide();

                    var worksheet = "<a href='#' id='paymentschedule_worksheet' class='google-doc-links link-button' > Create  Payment Schedule </a>";
                    $(worksheet).insertAfter("#paymentworksheet");

                    // add reset link
                    $("<a href='' id='reset_worksheet' class='google-doc-links link-button'> Reset Worksheets</a>").insertAfter("#paymentschedule_worksheet");

                    // fill drupal fields
                    closeOverlay();
                    // $(".group-step1").hide();
                    $(".group-step2").show("fast", function() {
                        $("#edit-field-spreadsheet-link-und-0-value").val(data.id);
                        $("#edit-field-spreadsheet-title-und-0-value").val(data.title);

                        // create payment worksheet
                        createPaymentSchedule(data.id,currentNid, checklist);

                        // reset link click
                        resetPaymentWorksheets(data.id, currentNid);
                    });
                });
                return false;
            });

            // assessments for worker checkbox and inputs
            $(".group-step1-right > div").hide();
            $("#edit-field-assessment-for-workers-und .form-type-checkbox .form-checkbox").each(function(i){
                if($(this).is(":checked")){
                    var checkedme = i + 1;
                    $(".group-step1-right > div:nth-child("+checkedme+")").show();
                }
            });
            $("#edit-field-assessment-for-workers-und .form-type-checkbox .form-checkbox").change( function(i){
                $("#edit-field-assessment-for-workers-und .form-type-checkbox .form-checkbox").each(function(i){
                    var checkedme = i + 1;
                    if($(this).is(":checked")){
                        $(".group-step1-right > div:nth-child("+checkedme+")").show();
                    }
                    else
                        $(".group-step1-right > div:nth-child("+checkedme+")").hide();
                });
            })
        }

    });
})(jQuery);
