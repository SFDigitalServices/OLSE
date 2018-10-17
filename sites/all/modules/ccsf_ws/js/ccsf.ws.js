/**
 * Created by admintk on 4/22/15.
 */
(function ($){
	function attachTableSorter(pagerOptions){
        //remove ief-sort-header as it messes up field search
        if($('.ief-sort-order-header').length > 0){
            $('.ief-sort-order-header').remove();
            $('.tabledrag-hide').remove();
        }
        //console.log("attached");
        if($(".ief-entity-table").length < 1) return;
        $(".ief-entity-table")
            // Initialize tablesorter
            // ***********************
            .tablesorter({
                theme: 'blue',
                dateFormat : "mmddyyyy",
                widthFixed: true,
                widgets: ['zebra', 'filter'],
                ignoreCase: false,
                sortList: [
                    [1, 1]
                ],
                widgetOptions: {
                    filter_childRows: false,
                    filter_columnFilters: true,
                    filter_cellFilter: '',
                    filter_cssFilter: '', // or []
                    filter_defaultFilter: {},
                    filter_excludeFilter: {},
                    filter_external: '',
                    filter_filteredRow: 'filtered',
                    filter_formatter: null,
                    filter_functions: null,
                    filter_hideEmpty: true,
                    filter_hideFilters: false,
                    filter_ignoreCase: true,
                    filter_liveSearch: true,
                    filter_onlyAvail: 'filter-onlyAvail',
                    filter_placeholder: { search: '', select: '' },
                    filter_reset: '#filter_reset',
                    filter_saveFilters: false,
                    filter_searchDelay: 300,
                    filter_searchFiltered: true,
                    filter_selectSource: null,
                    filter_serversideFiltering: false,
                    filter_startsWith: false,
                    filter_useParsedData: false,
                    filter_defaultAttrib: 'data-value',
                    filter_selectSourceSeparator: '|',
                    headers: { 
                    	0: 
                    		{ 
                    			filter: true 
                    		},
                    	1:
                    		{
                    			sorter: 'my_date_column'
                    		}
                    },
                }
            });
            // initialize the pager plugin
            // ****************************
            //.tablesorterPager(pagerOptions); //pager doesn't seem to be working
			//console.log(pagerOptions);
        
        $.tablesorter.addParser({ 
            id: 'my_date_column', 
            is: function(s) { 
                // return false so this parser is not auto detected 
                return false; 
            }, 
            format: function(s) { 
                var timeInMillis = new Date.parse(s);
                return timeInMillis;         
            }, 
            // set type, either numeric or text 
            type: 'numeric' 
        }); 

        if( window.location.pathname.lastIndexOf('overview') > 0 || $(".field-type-entityreference").length > 0){
    		$(".FrxTable table").trigger('pageSize', 'all');
    	}
    }
    $(function() {
        var pagerOptions = {

            // target the pager markup - see the HTML block below
            container: $(".pager"),

            // use this url format "http:/mydatabase.com?page={page}&size={size}&{sortList:col}"
            ajaxUrl: null,

            // modify the url after all processing has been applied
            customAjaxUrl: function (table, url) {
                return url;
            },

            // process ajax so that the data object is returned along with the total number of rows
            // example: { "data" : [{ "ID": 1, "Name": "Foo", "Last": "Bar" }], "total_rows" : 100 }
            ajaxProcessing: function (ajax) {
                if (ajax && ajax.hasOwnProperty('data')) {
                    // return [ "data", "total_rows" ];
                    return [ ajax.total_rows, ajax.data ];
                }
            },

            // output string - default is '{page}/{totalPages}'
            // possible variables: {page}, {totalPages}, {filteredPages}, {startRow}, {endRow}, {filteredRows} and {totalRows}
            // also {page:input} & {startRow:input} will add a modifiable input in place of the value
            output: '{startRow:input} to {endRow} ({totalRows})',

            // apply disabled classname to the pager arrows when the rows at either extreme is visible - default is true
            updateArrows: true,

            // starting page of the pager (zero based index)
            page: 0,

            // Number of visible rows - default is 10
            size: 10,

            // Save pager page & size if the storage script is loaded (requires $.tablesorter.storage in jquery.tablesorter.widgets.js)
            savePages: true,

            //defines custom storage key
            storageKey: 'tablesorter-pager',

            // if true, the table will remain the same height no matter how many records are displayed. The space is made up by an empty
            // table row set to a height to compensate; default is false
            fixedHeight: true,

            // remove rows from the table to speed up the sort of large tables.
            // setting this to false, only hides the non-visible rows; needed if you plan to add/remove rows with the pager enabled.
            removeRows: false,

            // css class names of pager arrows
            cssNext: '.next', // next page arrow
            cssPrev: '.prev', // previous page arrow
            cssFirst: '.first', // go to first page arrow
            cssLast: '.last', // go to last page arrow
            cssGoto: '.gotoPage', // select dropdown to allow choosing a page

            cssPageDisplay: '.pagedisplay', // location of where the "output" is displayed
            cssPageSize: '.pagesize', // page size selector - select dropdown that sets the "size" option

            // class added to arrows when at the extremes (i.e. prev/first arrows are "disabled" when on the first page)
            cssDisabled: 'disabled', // Note there is no period "." in front of this class name
            cssErrorRow: 'tablesorter-errorRow' // ajax error information row

        };
     
        // IEF ajax success handler functions
        var updateNonEditableFields = function($elements){
        	$.each($elements, function(){
            	//remove disabled attribute from element
            	$(this.key).removeProp('disabled');
            	//update value
            	$(this.key).val(this.value);
            	//disabled manual entry
            	$(this.key).keydown(function(){
    				return false;
    			})
    			// disable right-click to prevent cut and paste
    			$(this.key).on("contextmenu",function(e){
    		        return false;
    		    });
        	});
        }
        
        var getAssessedFields = function(updated_info){
        	var $collected_fields = [];
			switch (updated_info.field_assessment_for_workers){
					// roll up to healthcare expenditures
				case 'Penalties to city': 
					$collected_fields.push({
						key: "#edit-field-penalties-to-city-und-0-value",
						value: parseFloat(updated_info.field_payment_amount_due)
					});
					break; // renamed to HCSO resititution, roll up to healthcare expenditures
				case 'Health care assessment': 
					$collected_fields.push({
						key: "#edit-field-health-care-assessment-und-0-value",
						value: parseFloat(updated_info.field_payment_amount_due)
					});
					break; // deprecated but still needs to be calculated
				case 'Wages Recovered Other Agencies': 
					$collected_fields.push({
						key: "#edit-field-wages-recovered-other-agen-und-0-value",
						value: parseFloat(updated_info.field_payment_amount_due)
					});
					break; //roll up to citation
				case 'Citation Posting': 
					$collected_fields.push({
						key: "#edit-field-citation-assessed-und-0-value",
						value: parseFloat(updated_info.field_payment_amount_due)
					});
					break;//roll up to citation
				case 'Citation Records':
					$collected_fields.push({
						key: "#edit-field-citation-assessed-und-0-value",
						value: parseFloat(updated_info.field_payment_amount_due)
					});
					break;//roll up to citation
				case 'Citation Retaliation':
					$collected_fields.push({
						key: "#edit-field-citation-assessed-und-0-value",
						value: parseFloat(updated_info.field_payment_amount_due)
					});
					break;//roll up to citation
				case 'Citation Annual Reporting':
					$collected_fields.push({
						key: "#edit-field-citation-assessed-und-0-value",
						value: parseFloat(updated_info.field_payment_amount_due)
					});
					break;// roll up to healthcare expenditures
				case 'cityoption': 
					$collected_fields.push({
						key: "#edit-field-c-city-option-und-0-value", //this looks like collected amount?
						value: parseFloat(updated_info.field_payment_amount_due)
					});
					break;		
				/* Back Wages and Interest deprecated, does not seem to have an assessed, only collected value... there's an edit-field-back-wages2?
				case 'Backwages': 
					$collected_fields.push({
						key: "#edit-field-c-back-wages-and-interest-und-0-value",
						value: parseFloat(updated_info.field_payment_amount)
					});
					break; */
				// Penalties to Worker deprecated but still needs to be calculated
				case 'Penalties to worker': 
					$collected_fields.push({
						key: "#edit-field-penalties-to-worker-und-0-value",
						value: parseFloat(updated_info.field_payment_amount_due)
					});
					break;
				/* HRA should roll up to healthcare expenditures, but does not seem to have an assessed, only collected value
				case 'hra': 
				default: break;		
				*/
			}
			
			return $collected_fields;
        }
        
        var getCollectedFields = function(updated_info){
        	var $collected_fields = [];
			switch (updated_info.field_assessment_for_workers){
				// deprecated but still needs to be calculated
				case 'Backwages': 
					$collected_fields.push({
						key: "#edit-field-c-back-wages-and-interest-und-0-value",
						value: parseFloat(updated_info.field_payment_amount)
					});
					break; // deprecated but still needs to be calculated
				case 'Penalties to worker': 
					$collected_fields.push({
						key: "#edit-field-c-penalties-to-worker-und-0-value",
						value: parseFloat(updated_info.field_payment_amount)
					});
					break; // roll up to healthcare expenditures
				case 'Penalties to city': 
					$collected_fields.push({
						key: "#edit-field-c-penalties-to-city-und-0-value",
						value: parseFloat(updated_info.field_payment_amount)
					});
					break; // renamed to HCSO resititution, roll up to healthcare expenditures
				case 'Health care assessment': 
					$collected_fields.push({
						key: "#edit-field-c-health-care-remedy-und-0-value",
						value: parseFloat(updated_info.field_payment_amount)
					});
					break; // deprecated but still needs to be calculated
				case 'Wages Recovered Other Agencies': 
					$collected_fields.push({
						key: "#edit-field-c-wages-recovered-other-und-0-value",
						value: parseFloat(updated_info.field_payment_amount)
					});
					break; //roll up to citation
				case 'Citation Posting': 
					$collected_fields.push({
						key: "#edit-field-c-citation-und-0-value",
						value: parseFloat(updated_info.field_payment_amount)
					});
					break;//roll up to citation
				case 'Citation Records':
					$collected_fields.push({
						key: "#edit-field-c-citation-und-0-value",
						value: parseFloat(updated_info.field_payment_amount)
					});
					break;//roll up to citation
				case 'Citation Retaliation':
					$collected_fields.push({
						key: "#edit-field-c-citation-und-0-value",
						value: parseFloat(updated_info.field_payment_amount)
					});
					break;//roll up to citation
				case 'Citation Annual Reporting':
					$collected_fields.push({
						key: "#edit-field-c-citation-und-0-value",
						value: parseFloat(updated_info.field_payment_amount)
					});
					break;// roll up to healthcare expenditures
				case 'cityoption': 
					$collected_fields.push({
						key: "#edit-field-c-city-option-und-0-value",
						value: parseFloat(updated_info.field_payment_amount)
					});
					break;//roll up to healthcare expenditures, but does not seem to have an assessed, only collected value
				case 'hra': 
					$collected_fields.push({
						key: "#edit-field-c-hra-und-0-value",
						value: parseFloat(updated_info.field_payment_amount)
					});
					break;		
				default: break;		
			}
			return $collected_fields;
        }
        
        var calculateTotal = function(){
            var total = 0;
            if( ! isNaN(parseFloat($("#edit-field-c-health-care-remedy-und-0-value:visible").val())))
            	total = parseFloat($("#edit-field-c-health-care-remedy-und-0-value:visible").val()) + parseFloat(total);
                     
            if( ! isNaN(parseFloat($("#edit-field-c-back-wages-and-interest-und-0-value:visible").val()))){
               	total = parseFloat($("#edit-field-c-back-wages-and-interest-und-0-value:visible").val()) + parseFloat(total);
            }
            if( ! isNaN(parseFloat($("#edit-field-c-penalties-to-city-und-0-value:visible").val())))
           		total += parseFloat($("#edit-field-c-penalties-to-city-und-0-value:visible").val());
            
			//this one should be hidden but putting in visible pseudo class instead
           	if( ! isNaN(parseFloat($("#edit-field-c-penalties-to-worker-und-0-value:visible").val())))
        		total += parseFloat($("#edit-field-c-penalties-to-worker-und-0-value:visible").val());
        
           	if( ! isNaN(parseFloat($("#edit-field-c-city-option-und-0-value:visible").val())))
            	total += parseFloat($("#edit-field-c-city-option-und-0-value:visible").val());
            
           	if( ! isNaN(parseFloat($("#edit-field-c-citation-und-0-value:visible").val())))
               	total += parseFloat($("#edit-field-c-citation-und-0-value:visible").val());
            
           	if( ! isNaN(parseFloat($("#edit-field-c-wages-recovered-other-und-0-value:visible").val())))
                	total += parseFloat($("#edit-field-c-wages-recovered-other-und-0-value:visible").val());
				
			//hra was originally missing, adding it and putting in visible pseudo class
           	if( ! isNaN(parseFloat($("#edit-field-c-hra-und-0-value:visible").val())))
        		total += parseFloat($("#edit-field-c-hra-und-0-value:visible").val());
           	
           	total = parseFloat(Math.round(total * 100) / 100).toFixed(2);
           	total_assessed = $("#edit-field-total-assessed-und-0-value").val();
           	
           	$("#edit-field-total-collected-und-0-value").removeProp('disabled');
           	$("#edit-field-total-collected-und-0-value").val(total);
           	
           	$("#edit-field-amount-outstanding-und-0-value").removeProp('disabled');
           	$("#edit-field-amount-outstanding-und-0-value").val( parseFloat(Math.round(total_assessed * 100) / 100).toFixed(2) - total );
           	
           	//console.log(total);
        }
        
        var calculateAssessedTotal = function(){
			//missing HRA which does not have an assessed amount
            var total = 0; 
            //Health Care Expenditures Assessed, HCSO
            if( ! isNaN(parseFloat($("#edit-field-health-care-assessment-und-0-value:visible").val())))
            	total = parseFloat($("#edit-field-health-care-assessment-und-0-value:visible").val()) + parseFloat(total);

			//deprecated, back wages is missing from assessed
            /*if( ! isNaN(parseFloat($("#edit-field-c-back-wages-and-interest-und-0-value:visible").val()))){
               	total = parseFloat($("#edit-field-c-back-wages-and-interest-und-0-value:visible").val()) + parseFloat(total);
            }*/
			
            // Penalties to City, health care expenditure
            if( ! isNaN(parseFloat($("#edit-field-penalties-to-city-und-0-value:visible").val())))
           		total += parseFloat($("#edit-field-penalties-to-city-und-0-value:visible").val());

			// deprecated
           	if( ! isNaN(parseFloat($("#edit-field-c-penalties-to-worker-und-0-value:visible").val())))
        		total += parseFloat($("#edit-field-c-penalties-to-worker-und-0-value:visible").val());

			//health care expenditure
           	if( ! isNaN(parseFloat($("#edit-field-c-city-option-und-0-value:visible").val())))
            	total += parseFloat($("#edit-field-c-city-option-und-0-value:visible").val());
            
            //Citation
           	if( ! isNaN(parseFloat($("#edit-field-citation-assessed-und-0-value:visible").val())))
               	total += parseFloat($("#edit-field-citation-assessed-und-0-value:visible").val());
            
           	// deprecated, other wages
           	if( ! isNaN(parseFloat($("#edit-field-wages-recovered-other-agen-und-0-value:visible").val())))
                	total += parseFloat($("#edit-field-wages-recovered-other-agen-und-0-value:visible").val());
				
           	// scale to 2 decimal points.
           	total = parseFloat(Math.round(total * 100) / 100).toFixed(2);
           	total_collected = $("#edit-field-total-collected-und-0-value").val();
           	
           	$("#edit-field-total-assessed-und-0-value").removeProp('disabled');
           	$("#edit-field-total-assessed-und-0-value").val(total);
           	$("#edit-field-amount-outstanding-und-0-value").removeProp('disabled');
           	
			var fixedOutstanding = total - parseFloat(Math.round(total_collected * 100) / 100);
           	$("#edit-field-amount-outstanding-und-0-value").val(fixedOutstanding.toFixed(2));
        }
        var activitySummaryUpdate = function(event,request,settings){
    		//capture ief operations
			var trigger_action = (settings.extraData._triggering_element_value).toLowerCase().trim();
			if( trigger_action == 'edit' || trigger_action == 'remove' || trigger_action == 'add new'){
				var element = ".ief-row-form > td > div";
				var appento = ".ief-row-form > td";
				if(trigger_action == 'add new'){
					element = ".ief-form";
					appento = ".field-widget-inline-entity-form .form-wrapper .ief-form";
					//console.log($(appento).parent());
				}
				$(element).dialog({
					modal: true,
					width: 1000,
					dialogClass: "no-close",
					appendTo: $(appento).parent(),
				});
				//uncheck the use as primary contact checkbox
				$(".field-name-field-use-as-primary-contact input").attr('checked', false); 
			}
			else if(trigger_action == 'cancel'){
				if($(".ui-dialog .ief-form")){
					$(".ui-dialog .ief-form").dialog("close");
					$(".ui-dialog .ief-form").dialog("destroy");
				}
			}
			else if(trigger_action == 'update' || trigger_action == 'create'){
				if($(".ui-dialog .ief-form")){
					$(".ui-dialog .ief-form").dialog("close");
					$(".ui-dialog .ief-form").dialog("destroy");
				}
				var pbc_info = Drupal.settings.ccsf_ws;
				//update primary business contact info
				if(pbc_info && pbc_info.primary_business_contact != ''){
					var $pbc_info = [
					    {
					    	key: "#edit-field-primary-business-contact-und-0-value",
					    	value: pbc_info.primary_business_contact
						},
						{
					    	key: "#edit-field-primary-business-contact-t-und-0-value",
					    	value: pbc_info.primary_business_title
						},
						{
					    	key: "#edit-field-primary-business-contact-e-und-0-email",
					    	value: pbc_info.primary_business_email
						},
						{
					    	key: "#edit-field-primary-contact-phone-2-und-0-value",
					    	value: pbc_info.primary_business_phone
						},
						{
					    	key: "#edit-field-company-name-und-0-value",
					    	value: pbc_info.primary_business_company
						}
					]; 
					updateNonEditableFields($pbc_info);
				}
				$("#edit-actions .form-submit").first().click();
			}
        }
        
        var paymentSummaryUpdate = function(event, request, settings){
        	var trigger_action = (settings.extraData._triggering_element_value).toLowerCase().trim();  
        	
			if( trigger_action == 'edit' || trigger_action == 'remove' || trigger_action == 'add new'){
				if(trigger_action == 'remove' && Drupal.settings.ccsf_ws){
					// update collected totals
					var updated_info = Drupal.settings.ccsf_ws;
					console.log(updated_info);
					if(! isNaN(parseFloat(updated_info.field_payment_amount)) ){
						updateNonEditableFields(getCollectedFields(updated_info));
						calculateTotal();
						updateNonEditableFields(getAssessedFields(updated_info));
						calculateAssessedTotal();
						$("#edit-actions .form-submit").first().click();
					}
				}
				else if(trigger_action == 'edit'){
					$(".field-type-number-decimal input").change( function(){
			        	$(this).val($(this).val().replace(/[^\d.-]/g, ''));
			        });
				}
				var element = ".ief-row-form > td > div";
				var appento = ".ief-row-form > td";
				if(trigger_action == 'add new'){
					element = "#edit-field-payment-summary-und-form";
					appento = "#edit-field-payment-summary > div > fieldset > div";
				}
				$(element).dialog({
					modal: true,
					width: 1000,
					dialogClass: "no-close",
					appendTo: appento,
				});
			}
			else if(trigger_action == 'cancel'){
				if($(".ui-dialog .ief-form")){
					$(".ui-dialog .ief-form").dialog("close");
					$(".ui-dialog .ief-form").dialog("destroy");
				}
			}
			else if( ( trigger_action == 'update' || trigger_action == 'create') && Drupal.settings.ccsf_ws){
				// update collected totals
				var updated_info = Drupal.settings.ccsf_ws;
				var refresh_numbers = false;
				console.log(updated_info);	
				if(! isNaN(parseFloat(updated_info.field_payment_amount)) ){
					updateNonEditableFields(getCollectedFields(updated_info));
					calculateTotal();
					refresh_numbers = true;
				}
				if(! isNaN(parseFloat(updated_info.field_payment_amount_due)) ){
					updateNonEditableFields(getAssessedFields(updated_info));
					calculateAssessedTotal();
					console.log("here");
					refresh_numbers = true;
				}

				if(refresh_numbers == true)
					$("#edit-actions .form-submit").first().click();
			}
			if( trigger_action == 'edit' || trigger_action == 'add new'){
				//push due date underneath amount due
				$('div[id$="form-field-payment-amount-due"]').after($('div[id$="form-field-payment-due-date"]'));

				//make title fit
				$('input[id$="form-title"]').attr('style','width:100%');
				
				//make two columns, moved this to content type -> Payment summary + CSS setup
				//$('div[id$="form-field-payment-amount-due"]').prev().before('<div id="columnWrapper" style="-webkit-column-count:2;-moz-column-count:2;column-count:2"></div>'); //todo add more column count

				/*$('#columnWrapper').parent().find("> div").each(function(){
					if ($(this).attr('id') == "columnWrapper") {
						//do nothing
					} else if ($(this).hasClass('field-name-field-payment-entry-note')) {
						//end container before note
						return false;
					} else if ($(this).hasClass('field-name-field-assessment-for-workers')) {
						//style 2nd column
						$(this).attr('style','padding-top:1.5px');
						$('#columnWrapper').append($(this));
					} else if ($(this).hasClass('field-name-field-payment-date')) {
						//style 2nd column
						$(this).attr('style','margin-top:0');
						$('#columnWrapper').append($(this));
						$(this).find('.fieldset-legend').text('Payment Received Date');
					} else {
						$('#columnWrapper').append($(this));
					}
				});*/
				
				jQuery('#edit-field-payment-summary-und-form-field-assessment-for-workers').before(jQuery('#edit-field-payment-summary-und-form-field-payment-amount-due'));
				jQuery('#edit-field-payment-summary-und-form-field-assessment-for-workers').before(jQuery('#edit-field-payment-summary-und-form-field-payment-due-date'));
				
				//modify dropdown forms
				if($('select[id$="form-field-assessment-for-workers-und"]').length > 0){
					var initialText = $('select[id$="form-field-assessment-for-workers-und"] option:selected').text();
					var initialValue = $('select[id$="form-field-assessment-for-workers-und"]').val();
 				
					//set initial state of the Escrow funds for workers fields.	
					if (initialText == 'HCSO Restitution'){ 
						manageEscrows('HCSO Restitution');	
					}else{
						$('div[id$="form-field-escrow-controller"]').hide();
					}
					//create hidden field to hold data
					$('select[id$="form-field-assessment-for-workers-und"]').after('<input type="hidden" value="'+initialValue+'" id="realPaymentType"/>');

					//transfer existing payment type name to the hidden field
					$('#realPaymentType').attr('name',$('select[id$="form-field-assessment-for-workers-und"]').attr('name'));
					$('select[id$="form-field-assessment-for-workers-und"]').attr('name','');
					
					//add event to first payment type dropdown
					$('select[id$="form-field-assessment-for-workers-und"]').attr('onchange','manageTypes()');

					//create secondary dropdown
					$('select[id$="form-field-assessment-for-workers-und"]').after('<select id="secondaryPaymentType" style="display:none" class="form-select" onchange="setPaymentType()"></select>');

					//loop through default dropdown and populate 2nd dropdown with first options
					$('select[id$="form-field-assessment-for-workers-und"] option').each(function() {
						if ($(this).text() != 'Penalties to City') {
							//put empty into both categories
							if ($(this).text() == '- None -') {
								$(this).text('- Select One -');
								$(this).val('');
								$(this).addClass('health');
								$(this).addClass('citation');
								$('#secondaryPaymentType').append($(this));
							} else if ($(this).text().substr(0,11) == 'Citation - ') {
								$(this).addClass('citation');
								$(this).text($(this).text().substr(11, $(this).text().length));	
								$('#secondaryPaymentType').append($(this));
							} else if ($(this).text() == 'HCSO Restitution' || $(this).text() == 'City Option') {
								$(this).addClass('health');
								$('#secondaryPaymentType').append($(this));
							} else if ($(this).text() == 'HRA') {
								//removing HRA because this resolution method will no longer be used in the future
								$(this).remove();
							} else {
								$(this).remove();
							}
						}
					});
					
					//add options to trigger secondary dropdown in default dropdown
					$('select[id$="form-field-assessment-for-workers-und"]').append('<option value="health">Health Care Expenditure</option>');
					$('select[id$="form-field-assessment-for-workers-und"]').append('<option value="citation">Citation</option>');

					//set dropdowns depending on saved value
					if (initialText.substr(0,11) == 'Citation - ') {
						$('select[id$="form-field-assessment-for-workers-und"]').val('citation');
						$('#secondaryPaymentType').show();
						$('#secondaryPaymentType').val(initialValue);
					} else if (initialText == 'HCSO Restitution' || initialText == 'City Option' || initialText == 'HRA') {
						$('select[id$="form-field-assessment-for-workers-und"]').val('health');
						$('#secondaryPaymentType').show();
						$('#secondaryPaymentType').val(initialValue);
                                        }
				}
			}
        }
        
        $(document).ajaxComplete(function(data){
            if($('.ief-row-form').length > 0)
                $(".ief-entity-table").trigger("destroy");
            else
                attachTableSorter(pagerOptions);
        });

        attachTableSorter(pagerOptions);
       
        // IEF ajax callback
        $( document ).ajaxSuccess(function(event, request, settings) {
        	//return;
        	if($("#edit-field-activity-summary").is(':visible') && $(".ief-form-row") && settings.extraData){
        		activitySummaryUpdate(event,request,settings);
    		}
        	else if($("#edit-field-payment-summary").is(':visible') && settings.extraData){
        		paymentSummaryUpdate(event,request,settings);
        	}
        	else if( ( $("#edit-field-additional-claimants").is(':visible') ||  $("#edit-field-additional-owners").is(':visible') || ($("#edit-field-additional-business").is(':visible') ) && settings.extraData) ){
        		activitySummaryUpdate(event,request,settings);
        	}
    	});
        
        // add show all and print button
		if( $("#ief-entity-table-edit-field-activity-summary-und-entities").length > 0 && $("#print_activities").length < 1){
			$(".group-activity-summary-actions").show();
			$(".form-item-field-show-all-activities-und").append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type='button' name='print_activities' id='print_activities' >Print</button>");
			$("#edit-field-show-all-activities-und").click( function(){
				if($(this).is(':checked')) 
					$('.ief-entity-table').trigger('pageSize', 'all');
				else
					$('.ief-entity-table').trigger('pageSize', '10');
			})
		}
    });
   // });

})(jQuery);

function manageTypes() {
	jQuery('#secondaryPaymentType').hide();
	var firstChoice = jQuery('select[id$="form-field-assessment-for-workers-und"]').val();
	if (firstChoice == "Penalties to city") {
		jQuery('#realPaymentType').val(firstChoice);
	} else {
			jQuery('#realPaymentType').val('');
			jQuery('#secondaryPaymentType').slideDown();
			jQuery('#secondaryPaymentType').val('');
			jQuery('#secondaryPaymentType option').hide();
		if (firstChoice == "health") {
			jQuery('#secondaryPaymentType option.health').show();
		} else if (firstChoice == "citation") {
			jQuery('#secondaryPaymentType option.citation').show();
		}
	}
}
// turn on/off Escrow funds for worker fields
function manageEscrows(type){
	if(type == 'HCSO Restitution'  || 'Health care assessment' === jQuery('#secondaryPaymentType').val()){
		jQuery('.field-name-field-escrow-controller').show('slow', function(){
			// checkbox event handler
			jQuery('[id$="form-field-escrow-controller-und"]').change(function(){
				if( jQuery(this).prop('checked') ){
				 	jQuery('.group-escrow-fund').show();	
				}
				else{
					jQuery('.group-escrow-fund').hide();
				}
			});	
		if(jQuery('[id$="form-field-escrow-controller-und"]').prop('checked'))
			jQuery('.group-escrow-fund').show();
				
		});
	}
	else
		jQuery('.field-name-field-escrow-controller').hide();
}
function setPaymentType() {
	jQuery('#realPaymentType').val(jQuery('#secondaryPaymentType').val());
	manageEscrows('');
}

