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
G.field_repeat_offender_value as 'repeat_offender',
H.field_case_origin_value as 'case_origin',
I.field_business_account_value as 'business_account',
J.field_business_class_value as 'business_class',
K.field_language_value as 'primary_language',
L.field_number_of_claimants_value as 'number_claimants',
M.field_escrow_controller_value as 'escrow',
N.field_back_wages_value as 'back_wages',
P.field_penalties_to_city_value as 'city_penalty',
Q.field_penalties_to_worker_value as 'worker_penalty',
O.field_health_care_assessment_value as 'health_care_assessment',
S.field_citation_assessed_value as 'citation_assessed',
T.field_wages_recovered_other_agen_value 'wages_other',
UZ.field_c_back_wages_and_interest_value 'collected_wages',
V.field_c_penalties_to_city_value as 'collected_city_penalty',
W.field_c_penalties_to_worker_value as 'collected_worker_penalty',
X.field_c_health_care_remedy_value as 'collected_health_care',
Y.field_c_city_option_value as 'collected_city_option',
Z.field_c_hra_value as 'collected_hra',
AZ.field_c_citation_value as 'collected_citation',
BZ.field_c_wages_recovered_other_value as 'collected_other',
DZ.field_assessment_for_workers_value as 'payment_type',
EZ.field_payment_amount_value as 'payment_amount',
FZ.field_payment_date_value as 'payment_date',
HZ.field_activity_date_value as 'activity_date',
IZ.field_activity_description_value as 'correspondence type',
JZ.field_status_change_date_value as 'status change date'
FROM node A
JOIN field_data_field_claim_type CT ON CT.entity_id = A.nid
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
LEFT join field_data_field_repeat_offender G on G.entity_id = A.nid
LEFT join field_data_field_case_origin H on H.entity_id = A.nid
LEFT join field_data_field_business_account I on I.entity_id = A.nid
LEFT join field_data_field_business_class J on J.entity_id = A.nid
LEFT join field_data_field_language K on K.entity_id = A.nid
LEFT join field_data_field_number_of_claimants L on L.entity_id = A.nid
LEFT join field_data_field_escrow_controller M on M.entity_id = A.nid
LEFT join field_data_field_back_wages N on N.entity_id = A.nid
LEFT join field_data_field_penalties_to_city P on P.entity_id = A.nid
LEFT join field_data_field_penalties_to_worker Q on Q.entity_id = A.nid
LEFT join field_data_field_health_care_assessment O on O.entity_id = A.nid
LEFT join field_data_field_citation_assessed S on S.entity_id = A.nid
LEFT join field_data_field_wages_recovered_other_agen T on T.entity_id = A.nid
LEFT join field_data_field_c_back_wages_and_interest UZ on UZ.entity_id = A.nid
LEFT join field_data_field_c_penalties_to_city V on V.entity_id = A.nid
LEFT join field_data_field_c_penalties_to_worker W on W.entity_id = A.nid
LEFT join field_data_field_c_health_care_remedy X on X.entity_id = A.nid
LEFT join field_data_field_c_city_option Y on Y.entity_id = A.nid
LEFT join field_data_field_c_hra Z on Z.entity_id = A.nid
LEFT join field_data_field_c_citation AZ on Z.entity_id = A.nid
LEFT join field_data_field_c_wages_recovered_other BZ on Z.entity_id = A.nid
LEFT join field_data_field_payment_summary CZ on CZ.entity_id = A.nid
LEFT join field_data_field_assessment_for_workers DZ on DZ.entity_id = CZ.field_payment_summary_target_id
LEFT join field_data_field_payment_amount EZ on EZ.entity_id = CZ.field_payment_summary_target_id
LEFT join field_data_field_payment_date FZ on FZ.entity_id = CZ.field_payment_summary_target_id
LEFT join field_data_field_activity_summary GZ on GZ.entity_id = A.nid
LEFT join field_data_field_activity_date HZ on HZ.entity_id = GZ.field_activity_summary_target_id
LEFT join field_data_field_activity_description IZ on IZ.entity_id = GZ.field_activity_summary_target_id
LEFT join field_data_field_status_change_date JZ ON JZ.entity_id = GZ.field_activity_summary_target_id
WHERE
A.type = 'intake_form'
AND CT.field_claim_type_value = 'hcso'

