<?php

namespace App\Controllers\Api;

use App\Models\MembersModel;
use App\Models\PtapptsModel;
use App\Models\TripsModel;
use App\Models\SheduleblockModel;
use CodeIgniter\API\ResponseTrait;

class PtAppointment extends BaseController
{
    use ResponseTrait;

    protected $request1;

    public function getPTAppt()
    {
        $username = session()->username;

        $PtapptsModel = new PtapptsModel();
        $data = $PtapptsModel
            ->select('ptappts.id as id, PTStaff,reserveRide, initialVisit,
            ptappts.status as status, ptappts.memberId as memberId,
            DATE_FORMAT(apptDateTime,"%Y-%m-%d") as apptDate, ptappts.ptReason,
            reserveRide,apptDuration, apptTime, DATE_FORMAT(trips.pickupDate,"%H:%i") as ridePickupTime,
            DATE_FORMAT(rtntrip.pickupDate,"%H:%i") as rideDropTime, ptappts.wheelChair,
            CONCAT(TRIM(members.LastName),", ",TRIM(members.firstName) ) as MemberFullName,
            trips.instructions, PTStaffAssistant,
            CASE
            WHEN DATE_FORMAT(apptDateTime,"%Y-%m-%d") > CURRENT_DATE or users.isAdmin = 1 THEN 1
            ELSE 0
         END AS allowDelete')
            ->where('ptappts.id', $this->data->ptapptsID)
            ->join('members', 'members.id = ptappts.memberId')
            ->join('trips', 'trips.ptapptsID = ptappts.id AND trips.rtnTrip = 0 and trips.deleted_at is null ', 'left')
            ->join('trips as rtntrip', 'rtntrip.ptapptsID = ptappts.id AND rtntrip.rtnTrip != 0 and rtntrip.deleted_at is null', 'left')
            ->join('users', "username = '{$this->session->username}'", 'left')
            ->get()
            ->getRow();

        return $this->respond($data);
    }

    public function getMemberApptForPrint()
    {
        $username = session()->username;

        $PtapptsModel = new PtapptsModel();
        $data = $PtapptsModel
            ->select('ptappts.id as id, PTStaff,reserveRide, ptappts.apptDateTime,
            ptappts.status as status, ptappts.memberId as memberId,
            DATE_FORMAT(apptDateTime,"%m/%d/%Y - %h:%i %p") as apptDate, ptappts.ptReason,
            reserveRide,apptDuration, apptTime, DATE_FORMAT(trips.pickupDate,"%h:%i %p") as ridePickupTime,
            CONCAT(TRIM(members.LastName),", ",TRIM(members.firstName) ) as MemberFullName,
            trips.instructions,')
            ->where('ptappts.memberId', $this->data->memberId)
            ->where('ptappts.apptDateTime >= NOW()')
            ->orderBy('apptDateTime')
            ->join('members', 'members.id = ptappts.memberId', 'left')
            ->join('trips', 'trips.ptapptsID = ptappts.id AND trips.rtnTrip = 0 and trips.deleted_at is null ', 'left')
            ->findAll();

        return $this->respond($data);
    }

    private function contUpdatePTApptRide($rtnTrip, $tripBase, $pick, $drop, $time)
    {
        $TripsModel = new TripsModel();

        $trip = $TripsModel->select('id')
            ->where('ptapptsID', $this->data->id)
            ->where('rtnTrip', $rtnTrip)
            ->first();

        if (!isset($trip)) {
            $trip = $tripBase;
        }
        $trip->wheelChair = $this->data->wheelChair;
        $trip->rtnTrip = $rtnTrip;
        $trip->pickAddress = $pick;
        $trip->dropAddress = $drop;
        $trip->instructions = $this->data->instructions;
        $trip->pickupDate = $this->data->apptDate . ' ' . $time;
        $trip->apptDate = $this->data->apptDate . ' ' . $this->data->apptTime;
        $TripsModel->save($trip);

    }
    private function updatePTApptRide()
    {
        $TripsModel = new TripsModel();
        if ($this->data->reserveRide !== 'Y') {
            $TripsModel->where('ptapptsID', $this->data->id)->delete();
            return;
        }
        $jsmAddress = '7872 Walker Street, La Palma, CA 90623';

        $MembersModel = new MembersModel();

        $tripBase = $MembersModel
            ->select('id as rider_id,
         CONCAT(firstName, " ",lastName) as name,
         CONCAT(address,", " ,city ,", ",state," ", zipCode) as pickAddress,
         phone'
            )
            ->where('id', $this->data->memberId)
            ->get()->getRow();

        $tripBase->ptapptsID = $this->data->id;
        $tripBase->reason ='PT (' . $this->data->PTStaff .')';

        $memberAddress = $tripBase->pickAddress;

        $this->contUpdatePTApptRide(0, $tripBase, $memberAddress, $jsmAddress, $this->data->ridePickupTime);
        $this->contUpdatePTApptRide(1, $tripBase, $jsmAddress, $memberAddress, $this->data->rideDropTime);

    }

    public function updatePTAppt()
    {
        $PtapptsModel = new PtapptsModel();
        $this->data->apptDateTime = $this->data->apptDate . ' ' . $this->data->apptTime;

        // --- Double booking prevention for the same time frame ---
        $apptDateTime = $this->data->apptDateTime;
        $apptDuration = $this->data->apptDuration;
        $PTStaff = $this->data->PTStaff;
        $PTStaffAssistant = $this->data->PTStaffAssistant;
        $memberId = $this->data->memberId;
        $id = $this->data->id;

        // Check for staff or assistant double booking (excluding current appt)
        $conflict = $PtapptsModel
            ->where('id !=', $id)
            ->groupStart()
                ->where('PTStaff', $PTStaff)
                ->orWhere('PTStaff', $PTStaffAssistant)
            ->groupEnd()
            ->where("apptDateTime < DATE_ADD('{$apptDateTime}', INTERVAL {$apptDuration} MINUTE)")
            ->where("DATE_ADD(apptDateTime, INTERVAL apptDuration MINUTE) > '{$apptDateTime}'")
            ->first();

        if ($conflict) {
            return $this->respondConflict(["error" => "Double booking detected for staff or assistant in the same time frame."]);
        }

        // Check for member double booking (excluding current appt)
        $conflict = $PtapptsModel
            ->where('id !=', $id)
            ->where('memberId', $memberId)
            ->where("apptDateTime < DATE_ADD('{$apptDateTime}', INTERVAL {$apptDuration} MINUTE)")
            ->where("DATE_ADD(apptDateTime, INTERVAL apptDuration MINUTE) > '{$apptDateTime}'")
            ->first();

        if ($conflict) {
            return $this->respondConflict(["error" => "Double booking detected for member in the same time frame."]);
        }
        // --- End double booking prevention ---

        try {
            $this->db->transBegin();
            $Ptappts = $PtapptsModel->save($this->data);
            $this->updatePTApptRide();
        } catch (\Error $e) {
            $this->db->transRollback();
            throw new \Exception("Error Processing Request", 1);

        }
        $this->db->transCommit();

        return $this->respond($this->data);
    }
    public function updatePTApptStatus()
    {
        $PtapptsModel = new PtapptsModel();

        return $this->respond($PtapptsModel->save($this->data));
    }
    public function deletePTAppt()
    {

        if (isset($this->data->blockid)){
            $SheduleblockModel = new SheduleblockModel();
            $SheduleblockModel->delete($this->data->blockid);
            return $this->respond($this->data);


        }
        $PtapptsModel = new PtapptsModel();
        $TripsModel = new TripsModel();

        if ($this->data->deleteType == 'single') {
            $this->data->deleteTypePath=true;
            $PtapptsModel
                ->where('id', $this->data->id)
                ->delete();

            $TripsModel
                ->where('ptapptsID', $this->data->id)
                ->delete();
        } else {
            $PtapptsModel
                ->where('apptDateTime >', $this->data->apptDate)
                ->where('memberId', $this->data->memberId)
                ->delete();
            $TripsModel
                ->where('apptDate >', $this->data->apptDate)
                ->where('rider_id', $this->data->memberId)
                ->delete();

        }
        $this->data->ptDeleted = $PtapptsModel->affectedRows();
        $this->data->tripsDeleted = $TripsModel->affectedRows();

        return $this->respond($this->data);

    }

    public function getAllPTAppt()
    {
        $PtapptsModel = new PtapptsModel();
        $SheduleblockModel = new SheduleblockModel();

        // Filter by staff only if not 'All'
        if (isset($this->data->staff) && $this->data->staff != 'All') {
            $PtapptsModel->groupStart()
                ->where('PTstaff', $this->data->staff)
                ->orWhere('PTStaffAssistant', $this->data->staff)
                ->groupEnd();

            $SheduleblockModel->where('PTstaff', $this->data->staff);
        }

        // Fetch appointments
        $scheduleData = $PtapptsModel
            ->select('ptappts.id as ptapptsID, ptappts.status, PTStaff as resourceId, PTStaff, ptappts.memberId,
                      CONCAT(members.firstName," ",members.LastName) as title, initialVisit,
                      apptDateTime as start, users.ptColor as color, ptappts.wheelChair,
                      DATE_ADD(apptDateTime, INTERVAL apptDuration MINUTE) as end,
                      ptstatus.statusIcon, reserveRide, PTStaffAssistant')
            ->where('apptDateTime >=', $this->data->startStr)
            ->where('apptDateTime <=', $this->data->endStr)
            ->join('members', 'members.id = ptappts.memberId', 'left')
            ->join('users', 'users.username = ptappts.PTStaff', 'left')
            ->join('ptstatus', 'ptstatus.status = ptappts.status', 'left')
            ->findAll();

        // Fetch schedule blocks
        $blockData = $SheduleblockModel
            ->select('blockid, PTStaff as resourceId, PTStaff,
                      CONCAT(reason," (",PTStaff,")") as title, 1 as blocked,
                      apptDateTime as start, "lightgrey" as color,
                      DATE_ADD(apptDateTime, INTERVAL apptDuration MINUTE) as end')
            ->where('apptDateTime >=', $this->data->startStr)
            ->where('apptDateTime <=', $this->data->endStr)
            ->where('blockType', 'PT')
            ->findAll();

        // Merge appointments and blocks
        $data = array_merge($scheduleData, $blockData);

        return $this->respond($data);
    }

    public function validateCreatePTAppt()
    {
        $errors = [];
        $PtapptsModel = new PtapptsModel();
        $TripsModel = new TripsModel();
        $PTStaff = $this->data->PTStaff;
        $apptDuration = $this->data->apptDuration;

        foreach ($this->data->daysSelected as $apptDate) {
            $apptDateTime = $apptDate . ' ' . $this->data->apptTime;

            // Check for member double booking in the same time frame
            $rec = $PtapptsModel
                ->select('PTStaff, memberId,  DATE_FORMAT(apptDateTime,"%m/%d/%Y") as apptDate,
                DATE_FORMAT(apptDateTime,"%h:%i %p") as apptTime,
                DATE_FORMAT(DATE_ADD(apptDateTime, INTERVAL apptDuration MINUTE),"%h:%i %p") as apptEndTime,
                CONCAT(members.firstName," ",members.LastName ) as memberName,')
                ->where("memberID", $this->data->memberId)
                ->where("apptDateTime < DATE_ADD('{$apptDateTime}' ,INTERVAL {$this->data->apptDuration} MINUTE)")
                ->where("DATE_ADD(apptDateTime, INTERVAL apptDuration MINUTE) > '{$apptDateTime}'")
                ->join('members', 'members.id = ptappts.memberId', 'left')
                ->first();

            if (isset($rec)) {
                $errors[] = "$rec->PTStaff has an appointment with '$rec->memberName' on $rec->apptDate  $rec->apptTime - $rec->apptEndTime";
            }

            // Check for assistant double booking in the same time frame
            if ($this->data->PTStaffAssistant > '') {
                $rec = $PtapptsModel
                    ->select('PTStaff,   DATE_FORMAT(apptDateTime,"%m/%d/%Y") as apptDate,
                    DATE_FORMAT(apptDateTime,"%h:%i %p") as apptTime,
                    DATE_FORMAT(DATE_ADD(apptDateTime, INTERVAL apptDuration MINUTE),"%h:%i %p") as apptEndTime,
                    CONCAT(members.firstName," ",members.LastName ) as memberName,')
                    ->where("PTStaff = '{$this->data->PTStaffAssistant}'")
                    ->where("apptDateTime < DATE_ADD('{$apptDateTime}' ,INTERVAL {$this->data->apptDuration} MINUTE)")
                    ->where("DATE_ADD(apptDateTime, INTERVAL apptDuration MINUTE) > '{$apptDateTime}'")
                    ->join('members', 'members.id = ptappts.memberId', 'left')
                    ->first();

                if (isset($rec)) {
                    $errors[] = "$rec->PTStaff cannot assist {$this->data->PTStaff}. Conflict with
                    Member '$rec->memberName' who has an appointment $rec->apptDate  $rec->apptTime - $rec->apptEndTime";
                }
            }

            // Check for staff double booking in the same time frame
            $recs = $PtapptsModel
                ->select('PTStaff,   DATE_FORMAT(apptDateTime,"%m/%d/%Y") as apptDate,
                    DATE_FORMAT(apptDateTime,"%h:%i %p") as apptTime,
                    DATE_FORMAT(DATE_ADD(apptDateTime, INTERVAL apptDuration MINUTE),"%h:%i %p") as apptEndTime,
                    CONCAT(members.firstName," ",members.LastName ) as memberName,')
                ->where("PTStaff = '{$this->data->PTStaff}'")
                ->where("apptDateTime < DATE_ADD('{$apptDateTime}' ,INTERVAL {$this->data->apptDuration} MINUTE)")
                ->where("DATE_ADD(apptDateTime, INTERVAL apptDuration MINUTE) > '{$apptDateTime}'")
                ->join('members', 'members.id = ptappts.memberId', 'left')
                ->orderBy('apptDateTime')
                ->findAll();

            if (isset($recs)) {
                foreach ($recs as $rec) {
                    $errors[] = "$rec->PTStaff has an appointment conflict with
                    member '$rec->memberName' who has an appointment 
                    $rec->apptDate  $rec->apptTime - $rec->apptEndTime";
                }
            }

            if ($this->data->reserveRide == 'Y') {
                $rec = $TripsModel
                    ->where("DATE_FORMAT(pickupDate,'%Y-%m-%d')", $apptDate)
                    ->where('rider_id', $this->data->memberId)
                    ->first();
                if (isset($rec)) {
                    $errors[] = $apptDate . ' RIDES has been already reserved';
                }
            }

        }

        if (count($errors) > 0) {
            return $this->respondConflict([
                'status' => 'error',
                'message' => implode("\n", $errors)
            ]);
        }
        return null;
    }
    private function createBlockTime (){
        $SheduleblockModel = new SheduleblockModel();
        $this->data->blockType = 'PT';
        foreach ($this->data->daysSelected as $apptDate) {
            $this->data->apptDateTime = $apptDate . ' ' . $this->data->apptTime;
            $SheduleblockModel->save($this->data);

        }

        echo json_encode($this->data);

    }
	
	  
public function createPTAppt()
{
    if ($this->data->blockTime) {
        // Make sure createBlockTime() returns a response object
        return $this->createBlockTime();
    }

    $validationResult = $this->validateCreatePTAppt();
    if ($validationResult) {
        // Should return a failValidationError or similar response
        return $validationResult;
    }

    $jsmAddress = '7872 Walker Street, La Palma, CA 90623';
    $PtapptsModel = new PtapptsModel();
    $MembersModel = new MembersModel();
    $TripsModel = new TripsModel();

    $trip = $MembersModel
        ->select('id as rider_id,
         CONCAT(firstName, " ",lastName) as name,
         CONCAT(address,", " ,city ,", ",state," ", zipCode) as pickAddress,
         phone'
        )
        ->where('id', $this->data->memberId)
        ->get()->getRow();

    if (!$trip) {
        return $this->failValidationError('Member not found');
    }

    $memberAddress = $trip->pickAddress;

    try {
        $this->db->transBegin();

        foreach ($this->data->daysSelected as $apptDate) {
            $this->data->apptDateTime = $apptDate . ' ' . $this->data->apptTime;

            if (!$PtapptsModel->insert($this->data)) {
                $this->db->transRollback();
                return $this->failServerError('Failed to create appointment');
            }
            $ptapptsID = $this->db->insertID();
            $this->data->initialVisit = 0;

            if ($this->data->reserveRide == 'Y') {
                $trip->reason = 'PT (' . $this->data->PTStaff . ')';
                $trip->wheelChair = $this->data->wheelChair;
                $trip->instructions = $this->data->instructions;
                $trip->ptapptsID = $ptapptsID;

                // PRIMARY RIDE
                $pickupDateTime = $apptDate . ' ' . $this->data->ridePickupTime;

                // Conflict check: pickup ride
                $pickupConflict = $TripsModel
                    ->where('pickupDate', $pickupDateTime)
                    ->where('deleted_at', null)
                    ->first();

                if ($pickupConflict) {
                    $this->db->transRollback();
                    return $this->respondConflict([
                        'status' => 'error',
                        'message' => 'A trip already exists at ' . $pickupDateTime,
                        'conflict' => $pickupConflict
                    ]);
                }

                $trip->rtnTrip = 0;
                $trip->pickAddress = $memberAddress;
                $trip->dropAddress = $jsmAddress;
                $trip->pickupDate = $pickupDateTime;
                $trip->apptDate = $this->data->apptDateTime;
                if (!$TripsModel->insert($trip)) {
                    $this->db->transRollback();
                    return $this->failServerError('Failed to create primary ride');
                }

                // RETURN RIDE
                $returnPickupTime = $apptDate . ' ' . $this->data->rideDropTime;

                // Conflict check: return ride
                $returnConflict = $TripsModel
                    ->where('pickupDate', $returnPickupTime)
                    ->where('deleted_at', null)
                    ->first();

                if ($returnConflict) {
                    $this->db->transRollback();
                    return $this->respondConflict([
                        'status' => 'error',
                        'message' => 'A return trip already exists ',
                        'conflict' => $returnConflict
                    ]);
                }

                $trip->pickupDate = $returnPickupTime;
                $trip->pickAddress = $jsmAddress;
                $trip->dropAddress = $memberAddress;
                $trip->rtnTrip = 1;
                if (!$TripsModel->insert($trip)) {
                    $this->db->transRollback();
                    return $this->failServerError('Failed to create return ride');
                }

                $this->data->Tripinfo = $trip;
            }
        }
        $this->db->transCommit();

        return $this->respondCreated([
            'status' => 'success',
            'message' => 'PT appointment and ride(s) created successfully',
            'data' => $this->data
        ]);
    } catch (\Throwable $e) {
        $this->db->transRollback();
        return $this->failServerError('Internal server error: ' . $e->getMessage());
    }
}

/**
 * Send a 409 Conflict response with JSON.
 */
protected function respondConflict($data)
{
    return $this->respond($data, 409);
}

}