<?php

function _ccsf_ws_colist($rolenames) {
  if ($rolenames == '') {
    $rolenames = "'Compliance Officer'";
  }
  
  $response = array();
  
  $result = db_query("SELECT u.name as 'name', u.uid as 'uid'
            FROM users u
            JOIN users_roles ur ON U.uid = ur.uid
            JOIN role r ON r.rid = ur.rid
            WHERE r.name in (" . $rolenames . ");");
  
  foreach ($result as $record) {
    $response[] = array(
      'id' => $record->name, 
      'name' => $record->name
    );
  }
  return ($response);

}

function _ccsf_ws_get_business_address($nid) {
  $select = "select B.field_address_value, C.field_address2_value, D.field_city_value, E.field_state_value, F.field_zip_code_value
              From field_data_field_business_address A
              join field_data_field_address B ON A.field_business_address_value = B.entity_id
              left join field_data_field_address2 C ON A.field_business_address_value = C.entity_id
              left join field_data_field_city D ON A.field_business_address_value = D.entity_id
              left join field_data_field_state E ON A.field_business_address_value = E.entity_id
              left join field_data_field_zip_code F ON A.field_business_address_value = F.entity_id
              Where A.entity_id = $nid;
  ";
  $result = db_query($select);
  foreach ($result as $record) {
    $response[] = array('address' => $record->field_address_value, 'address2' => $record->field_address2_value,
                        'city' => $record->field_city_value, 'state' => $record->field_state_value, 'zipcode' => $record->field_zip_code_value);
  }
  return ($response);
}

function _ccsf_ws_get_next_id($casetype){
	error_log($casetype);
if($casetype == 'hcso')
	$select = "select count(*) + 4 from field_data_field_claim_type where field_claim_type_value='hcso'";
else
  $select = "select count(*) + 1 as 'total' from field_data_field_claim_type where field_claim_type_value='$casetype'; ";

  return strtoupper($casetype) ."-". db_query($select)->fetchField();
}

function ccsf_ws_query_colist_alter($query) {
  $query->join('users_roles', 'ur', 'ur.rid=role.rid');
  $query->join('user', 'u', 'u.uid = ur.rid');
}

/**
 * Set notification reminder for user(s)
 * 
 * DEPRECATED
 */
function _setup_reminder($postdata){
  global $user;
  $remind_days = check_plain($postdata['remind_days']);
  $message = mysql_real_escape_string(check_plain(($postdata['message'])));
  $description = check_plain($postdata['description']);
  $cclist = mysql_real_escape_string(check_plain($postdata['cclist']));
  $recurring = mysql_real_escape_string(check_plain($postdata['recurring']));
  $recurring_type = mysql_real_escape_string(check_plain($postdata['recurring_type']));
  $start_date = mysql_real_escape_string(check_plain($postdata['start_date']));
  $sent_to = mysql_real_escape_string(check_plain($postdata['sent_to']));
  
  if($cclist != '')
    $cclist .= ", ".$user->mail;
  else
    $cclist = $user->mail;
  $activityid = check_plain($postdata['activityid']);

  $data = array(
  	'ar_start_date' => $start_date,
    'ar_acivityid' => $activityid,
    'ar_remind_days' => $remind_days,
    'ar_message' => "$message",
    'ar_description' => "$description",
    'ar_cclist' => "$cclist",
    'ar_status' => 'new',
  	'ar_recurring' => $recurring,
  	'ar_recurring_type' => $recurring_type,
  	'ar_sent_to' => $sent_to
  );

  // insert into table, write cron script.
  $id = db_insert('activity_reminder')->fields($data)->execute();
  return $id;
}

function _get_case_numbers($input){
  //get a list of case numbers(node title) where type = intake_form
  if($input != ''){
      $select = "SELECT title FROM node WHERE nid='$input';";
      $result = db_query($select)->fetchField();
      return $result;
  }
    return "";
}

function _get_hourly_rate($input){
	if($input != ''){
		$select = "SELECT C.title FROM field_data_field_compliance_officer_name A 
		join field_data_field_compliance_officer_profile B ON B.field_compliance_officer_profile_value = A.entity_id 
		join node C on C.nid = B.entity_id 
		WHERE A.field_compliance_officer_name_target_id = $input;";
		$result = db_query($select)->fetchField();
	
		if($result){
			// get step 5 hourly rate
			$url = "http://citidex.sfgov.org/cgi-bin/dhr/findClass.cgi?class=".$result."&title=&salaryRange=&exempt=&fifthStepEntry=&unionOnly=";
			$ch = curl_init();
			$timeout = 5;
			curl_setopt($ch, CURLOPT_URL, $url);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
			$html = curl_exec($ch);
			curl_close($ch);
			
			# Create a DOM parser object
			$dom = new DOMDocument();
			# The @ before the method call suppresses any warnings that
			# loadHTML might throw because of invalid HTML in the page.
			@$dom->loadHTML($html);
			$finder = new DomXPath($dom);
			$classname = "current-salary";
			
			//find the salary table by classname
			$nodes = $finder->query("//*[contains(concat(' ', normalize-space(@class), ' '), ' $classname ')]");
			
			// 2nd table is the current salary table
			$count = 0;
			foreach($nodes as $node){
				$count++;
				if($count == 1) continue;
				$trs =  $node->getElementsByTagName("tr");
				// 2nd tr is the hourly rate
				$rowcount = 0;
				foreach($trs as $tr){
					$rowcount++;
					if($rowcount == 1) continue;
					$step = 0;
					$elements = $tr->getElementsByTagName("td");
					foreach($elements as $element){
						$step++;
						if($step == 6)
							$rate = $element->nodeValue;
					}
					break;
				}
				break;
			}
			$rate = str_replace("$","",$rate);
			$float = floatval($rate);
			if($float && floatval($float) == $float){ 
				return $rate;
			}else{
				$module = 'ccsf_ws';
			    $key = 'key';
			    $language = language_default();
			    $params = array();
			    $from = NULL;
			    $send = FALSE;
			    $message = drupal_mail($module, $key, 'henry.jiang@sfgov.org', $language, $params, $from, $send);
			
			    $message['subject'] = 'OLSE Compliance Officer hourly rate error';
			    $message['body'] = array();
			    $message['body'][] = "There's an error parsing hourly rate for job class: $result";
			    
			    // Retrieve the responsible implementation for this message.
			    $system = drupal_mail_system($module, $key);
			
			    // Format the message body.
			    $message = $system->format($message);
			
			    // Send e-mail.
			    $message['result'] = $system->mail($message);
		    	return "";
			}
		}
	}
	return "";
}

function _create_or_edit_payment($input){
    // check if payment already exists
    $select = "SELECT nid FROM node WHERE type='payment' AND title = '$input'";
    $result = db_query($select)->fetchField();
    if($result){
        drupal_goto("/node/".$result."/edit");
    }

    $select = "SELECT title FROM node WHERE nid='$input';";
    $title = db_query($select)->fetchField();

    $node = new stdClass();
    $node->title = $title;
    $node->type = 'payment';
    $node->created = time();
    $node->changed= time();
    $node->status = 1;
    $node->tnid = 0;
    $node->translate = 0;
    $node->sticky = 0;
    $node->uid = 1;
    $node->language = 'und';
    $node->timestamp = time();
    $node->promote = 0; //(1 or 0): promoted to front page
    $node->comment = 0; // 0 = comments disabled, 1 = read only, 2 = read/write

    node_submit($node);
    node_save($node);

    drupal_goto("/node/".$node->nid."/edit");
}

function _ccsf_ws_print_activities($input){
  
	global $user;
	// get all activity summary
	$select = "SELECT
field_activity_date_value as 'activity_date',
field_activity_type_value as 'activity_type',
field_activity_description_value as 'description',
field_activity_notes_value as 'notes',
field_co_full_name_value as 'fullname',
field_activity_status_value as 'status',
H.filename as 'filename'
FROM field_data_field_activity_summary A
left join field_data_field_activity_date B on B.entity_id = A.field_activity_summary_target_id
left join field_data_field_activity_type T on T.entity_id = A.field_activity_summary_target_id
left join field_data_field_activity_description C on C.entity_id = A.field_activity_summary_target_id
left join field_data_field_activity_notes D on D.entity_id = A.field_activity_summary_target_id
left join field_data_field_co_full_name E on E.entity_id = A.field_activity_summary_target_id
left join field_data_field_activity_status F on F.entity_id = A.field_activity_summary_target_id
left join field_data_field_attachments G on G.entity_id = A.field_activity_summary_target_id
left join file_managed H on H.fid = G.field_attachments_fid
WHERE A.entity_id=$input;";
	
	$result = db_query($select);
	
	require_once dirname(__FILE__) . '/../PHPWord/src/PhpWord/Autoloader.php';
	\PhpOffice\PhpWord\Autoloader::register ();
	
	$phpWord = new \PhpOffice\PhpWord\PhpWord();
	$section = $phpWord->addSection();
	$header = array('size' => 16, 'bold' => true);
	define("CELLWIDTH", 2000);
	// 1. Basic table
	$rows = 1;
	$cols = 8;
	$section->addText('Activity Summary', $header);
	// table properties
	$fancyTableStyle = array('borderSize' => 6, 'borderColor' => '999999');
	$cellRowSpan = array('vMerge' => 'restart', 'valign' => 'center', 'bgColor' => 'FFFF00');
	$cellRowContinue = array('vMerge' => 'continue');
	$cellColSpan = array('gridSpan' => 2, 'valign' => 'center');
	
	$cellVCentered = array('valign' => 'center');
	$spanTableStyleName = 'Colspan Rowspan';
	$phpWord->addTableStyle($spanTableStyleName, $fancyTableStyle);
	
	$table = $section->addTable($spanTableStyleName);
	
	$table->addRow();
	$header['size'] = 14;
	$table->addCell(CELLWIDTH)->addText('Activity Date', $header);
	$table->addCell(CELLWIDTH)->addText('Activity Type',$header);
	$table->addCell(CELLWIDTH)->addText('Activity Description',$header);
	$table->addCell(CELLWIDTH)->addText('Notes',$header);
	$table->addCell(CELLWIDTH)->addText('Compliance Officer',$header);
	$table->addCell(CELLWIDTH)->addText('Status',$header);
	$table->addCell(CELLWIDTH)->addText('File Name',$header);
	$format = 'm/d/Y';
	foreach ($result as $record) {
		$table->addRow();
		$activity_date = date ( $format, strtotime(str_replace("-", "/", $record->activity_date)));
		$table->addCell(CELLWIDTH)->addText($activity_date);
		$table->addCell(CELLWIDTH)->addText($record->activity_type);
		$table->addCell(CELLWIDTH)->addText(htmlspecialchars($record->description));
		$table->addCell(CELLWIDTH)->addText(htmlspecialchars($record->notes));
		$table->addCell(CELLWIDTH)->addText(htmlspecialchars($record->fullname));
		$table->addCell(CELLWIDTH)->addText($record->status);
		$table->addCell(CELLWIDTH)->addText(htmlspecialchars($record->filename));
		
		$rows++;
	}

	// create word document
	$filename = "activity_summary_$input.docx";
	$dir = file_stream_wrapper_get_instance_by_uri ( 'public://' )->realpath ();
	
	$downloadurl = file_stream_wrapper_get_instance_by_uri ( 'public://' )->getExternalUrl() . $user->name . "_" . $filename;
	$file_name = $dir . "/".$user->name . "_" . $filename;
	$objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
	$objWriter->save($file_name);
//error_log($downloadurl);
	return  drupal_json_encode($downloadurl);
}


