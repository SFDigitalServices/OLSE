--ACCESS=access content

SELECT distinct
A.nid,
concat(fn.field_user_firstname_value, ' ', ln.field_user_lastname_value) as 'name',
B.field_activity_date_value as 'activity_date',
C.field_activity_type_value as 'activity_type',
D.field_activity_description_value as 'description',
E.field_time_spent_value as 'time_spent',
F.field_activity_cost_value as 'cost',
G.field_activity_notes_value as 'notes',
H.field_co_full_name_value as 'Full Name',
I.field_other_activity_type_value as 'other_activity',
J.field_activity_status_value as 'activity_status',
K.field_recurring_reminder_value as 'recurring_reminder',
L.field_recurring_reminder_type_value as 'recurring_type',
M.field_notification_email_in_value as 'email_in_x_days',
N.field_notification_message_value as 'email_message',
O.field_cc_additional_staff_value as 'additional_staff',
P.field_reminder_end_date_value as 'reminder_end_date',
Q.field_status_change_date_value as 'change_date'
FROM node A 
JOIN field_data_field_activity_summary S on S.entity_id = A.nid
LEFT JOIN field_data_field_claim_type CT ON CT.entity_id = A.nid
LEFT JOIN field_data_field_activity_date B on B.entity_id = S.field_activity_summary_target_id
LEFT JOIN field_data_field_activity_type C on C.entity_id = S.field_activity_summary_target_id
LEFT JOIN field_data_field_activity_description D on D.entity_id = S.field_activity_summary_target_id
LEFT JOIN field_data_field_time_spent E on E.entity_id = S.field_activity_summary_target_id
LEFT JOIN field_data_field_activity_cost F on F.entity_id = S.field_activity_summary_target_id
LEFT JOIN field_data_field_activity_notes G on G.entity_id = S.field_activity_summary_target_id
LEFT JOIN field_data_field_co_full_name H on H.entity_id = S.field_activity_summary_target_id
LEFT JOIN field_data_field_other_activity_type I on I.entity_id = S.field_activity_summary_target_id
LEFT JOIN field_data_field_activity_status J on J.entity_id = S.field_activity_summary_target_id
LEFT JOIN field_data_field_recurring_reminder K on K.entity_id = S.field_activity_summary_target_id
LEFT JOIN field_data_field_recurring_reminder_type L on L.entity_id = S.field_activity_summary_target_id
LEFT JOIN field_data_field_notification_email_in M on M.entity_id = S.field_activity_summary_target_id
LEFT JOIN field_data_field_notification_message N on N.entity_id = S.field_activity_summary_target_id
LEFT JOIN field_data_field_cc_additional_staff O on O.entity_id = S.field_activity_summary_target_id
LEFT JOIN field_data_field_reminder_end_date P on P.entity_id = S.field_activity_summary_target_id
LEFT JOIN field_data_field_status_change_date Q on Q.entity_id = S.field_activity_summary_target_id
LEFT JOIN field_data_field_act_compliance_officer CO on CO.entity_id = S.field_activity_summary_target_id
LEFT join field_data_field_user_firstname fn on fn.entity_id = CO.field_act_compliance_officer_target_id
LEFT join field_data_field_user_lastname ln on ln.entity_id = CO.field_act_compliance_officer_target_id
WHERE
A.type = 'intake_form'
AND CT.field_claim_type_value = 'hcso'
AND A.title like concat('%',COALESCE(:title,''),'%')