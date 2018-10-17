--ACCESS=access content

SELECT distinct
A.nid,
A.title as 'title',
concat(fn.field_user_firstname_value, ' ', ln.field_user_lastname_value) as 'name',
B.field_claim_date_value as 'claimdate',
case 
when D.field_current_claim_status_value = 'Watch' Then 'Watch'
when D.field_current_claim_status_value = 'Intake' then 'Intake'
when D.field_current_claim_status_value = 'Active Investigation' then 'Active Investigation'
when D.field_current_claim_status_value = 'Active Hearing' then 'Active Hearing'
when D.field_current_claim_status_value = 'Active Join Investigation' then 'Active Joint Investigation'
when D.field_current_claim_status_value = 'Payment Plan' then 'Payment Plan'
when D.field_current_claim_status_value = 'Closed_full' then 'Closed - paid in full'
when D.field_current_claim_status_value = 'Closed_uncollect' then 'Closed - uncollectable'
when D.field_current_claim_status_value = 'Closed_refered' then 'Closed - referred'
when D.field_current_claim_status_value = 'Closed_paycity' then 'Closed - payment at city escrow'
when D.field_current_claim_status_value = 'Closed_invalid' then 'Closed - no violation/no claimant'
when D.field_current_claim_status_value = 'Closed_remedied' then 'Closed - remedied (no payment) *HCSO only'
end as 'currentstatus',
E.field_business_name_value as 'businessname',
FROM_UNIXTIME(A.changed) as 'moddate',
datediff(current_timestamp, CD.field_claim_date_value ) as 'age'
FROM node A
JOIN field_data_field_claim_date B ON A.nid = B.entity_id
LEFT JOIN field_data_field_claim_date CD ON A.nid = CD.entity_id
LEFT JOIN field_data_field_compliance_officer C ON A.nid = C.entity_id
LEFT join field_data_field_current_claim_status D ON A.nid = D.entity_id
LEFT join field_data_field_business_name E ON A.nid = E.entity_id
LEFT join users U ON U.uid = A.uid
LEFT join users_roles F ON F.uid = U.uid
LEFT join role R ON F.rid = R.rid
LEFT join field_data_field_compliance_officer CO on CO.entity_id = A.nid
LEFT join field_data_field_user_firstname fn on fn.entity_id = CO.field_compliance_officer_target_id
LEFT join field_data_field_user_lastname ln on ln.entity_id = CO.field_compliance_officer_target_id
WHERE
A.type = 'intake_form'
--AND
--CASE
--  WHEN  :rid = 5 THEN F.rid like '%%'
--  ELSE U.uid = :uid
-- END
