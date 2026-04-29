const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:8080@localhost:5432/ncrm' });

const sql = `
CREATE OR REPLACE FUNCTION public.fn_lead_status_sync()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  v_track_id INTEGER;
BEGIN
  -- Only fire on status changes
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  -- CASE 1: Status changed to 2 (Assigned Contact) or 11 (Assigned Lead)
  -- Auto-create track record if none exists
  IF NEW.status IN (2, 11) THEN
    SELECT id INTO v_track_id FROM leadtrackdetails WHERE leadid = NEW.id LIMIT 1;

    IF v_track_id IS NULL THEN
      INSERT INTO leadtrackdetails (
        leadid, status, notes, customername,
        contactfollowedby, organizationid, modifyon,
        isdirectmeet, occupationtype, loantype, desireloanamount,
        tenure, preferedbank, cibilscore, incometype, incomeamount,
        isidproof, isageproof, isaddessproof, iscreditcardstatement,
        isexistingloantrack, iscurrentaccountstatement, isstabilityproof,
        isbankstatement, ispayslip, isform16, isbusinessproof,
        isitr, isgststatement, isencumbrancecertificate, istitledeed,
        isparentdeed, islayoutplan, isregulationorder, isbuildingpermit,
        ispropertytax, ispatta, isconstructionagreement, issaleagreement,
        isapf, isudsregistration, isrcbook, bankname, applicationnumber,
        loginvalue, sanctionroi, sanctionvalue, psdcondition,
        islegal, istechnical, legalreport, technicalreport,
        ispsdconditionverified, leadfollowedby, isnoresponse,
        payoutpercent, ispaid, connectorcontactid, disbursementamount,
        datastrength, compname, compcat, custsegment, customer
      )
      VALUES (
        NEW.id, NEW.status, 'Record auto-synced from leadpersonaldetails', COALESCE(NEW.firstname || ' ' || NEW.lastname, ''),
        COALESCE(NEW.connectorid, 0), COALESCE(NEW.organizationid, 1001), NOW(),
        false, '', COALESCE(NEW.loantype, ''), COALESCE(NEW.loanamount, '0'),
        0, '', 0, '', '0',
        false, false, false, false,
        false, false, false,
        false, false, false, false,
        false, false, false, false,
        false, false, false, false,
        false, false, false, false,
        false, false, false, '', '',
        '0', '0', '0', '',
        false, false, '', '',
        false, 0, false,
        '0', false, 0, '0',
        '', '', '', '', false
      )
      RETURNING id INTO v_track_id;
    ELSE
      -- Track record exists, just update its status
      UPDATE leadtrackdetails 
      SET status = NEW.status, modifyon = NOW(), notes = 'Status updated via leadpersonaldetails sync'
      WHERE id = v_track_id;
    END IF;

  -- CASE 2: Any OTHER status change — sync to existing track record (if it exists)
  ELSE
    SELECT id INTO v_track_id FROM leadtrackdetails WHERE leadid = NEW.id LIMIT 1;

    IF v_track_id IS NOT NULL THEN
      UPDATE leadtrackdetails 
      SET status = NEW.status, modifyon = NOW()
      WHERE id = v_track_id;
    END IF;
  END IF;

  -- CASE 3: Auto-create audit history for ANY status change that has a track record
  IF v_track_id IS NOT NULL THEN
    INSERT INTO leadtrackhistorydetails (
      tracknumber, leadid, status, notes, isdirectmeet, createon, contactfollowedby, leadfollowedby
    )
    SELECT tracknumber, leadid, NEW.status, 
           'Status change synced: ' || COALESCE(OLD.status::TEXT, '?') || ' -> ' || NEW.status::TEXT,
           false, NOW(), contactfollowedby, leadfollowedby
    FROM leadtrackdetails WHERE id = v_track_id;
  END IF;

  RETURN NEW;
END;
$function$;
`;

pool.query(sql)
  .then(() => {
    console.log('Trigger function updated successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error updating trigger function:', err);
    process.exit(1);
  });
