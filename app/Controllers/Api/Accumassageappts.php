<?php

namespace App\Controllers\Api;

use App\Models\AccumassageapptsModel;
use App\Models\SheduleblockModel;

class Accumassageappts extends BaseController
{

    public function getPTAppt()
    {

        $AccumassageapptsModel = new AccumassageapptsModel();
        $data = $AccumassageapptsModel
            ->select('accumassageappts.id as id,
            accumassageappts.status as status, accumassageappts.memberId as memberId,
            DATE_FORMAT(apptDateTime,"%Y-%m-%d") as apptDate,
            apptDuration, apptTime,
            CONCAT(TRIM(members.LastName),", ",TRIM(members.firstName )) as MemberFullName')
            ->where('accumassageappts.id', $this->data->id)
            ->join('members', 'members.id = accumassageappts.memberId')
            ->first();

        return json_encode($data);
    }

    public function getAllPTAppt()
    {
        $AccumassageapptsModel = new AccumassageapptsModel();
        $dataAM = $AccumassageapptsModel
            ->select('memberId, accumassageappts.id as apptsID, accumassageappts.status,
        CONCAT(TRIM(members.LastName),", ",TRIM(members.firstName)) as title,
        apptDateTime as start,
        DATE_ADD(apptDateTime, INTERVAL apptDuration MINUTE) as end,
        ptstatus.statusIcon,
        CASE
        WHEN DAYOFWEEK(apptDateTime) = 4 THEN "#4caf50"
        ELSE "#a160c7"
     END AS color')

            ->where('apptDateTime >=', $this->data->startStr)
            ->where('apptDateTime <=', $this->data->endStr)
            ->join('members', 'members.id = accumassageappts.memberId')
            ->join('ptstatus', 'ptstatus.status = accumassageappts.status')
            ->findAll();

// $data['data']= $this.data;
        // return json_encode($PtapptsModel->findAll());
        $SheduleblockModel = new SheduleblockModel();

        $dataBlock=$SheduleblockModel 
        ->select ('blockid ,
        
        CONVERT(DAYOFWEEK(apptDateTime)-1,CHAR) as  daysOfWeek,

        DATE_FORMAT(apptDateTime,"%Y-%m-%d") as startRecur,
        apptTime as startTime,
        DATE_ADD(apptTime, INTERVAL apptDuration MINUTE) as endTime,
        1 as blocked,
        "blocked-off" as title,
        "lightgrey" as color

        ')
        ->where ('blockType','AM')
        ->findAll();

        $data = array_merge($dataAM, $dataBlock);
         echo json_encode($data);

    }

    public function saveAppt()
    {
      if (isset( $this->data->apptDate))  $this->data->apptDateTime = $this->data->apptDate . ' ' . $this->data->apptTime;

        if (isset($this->data->blockTime)) {
            $this->data->blockType = 'AM';
            $SheduleblockModel = new SheduleblockModel();
            $SheduleblockModel->save($this->data);

        } else {
            $AccumassageapptsModel = new AccumassageapptsModel();
            $AccumassageapptsModel->save($this->data);

        }

        $this->data->insertID = $this->db->insertID();

        echo json_encode($this->data);

    }

    public function DeleteAppt()
    {

        if (isset($this->data->blockid)){
            $SheduleblockModel = new SheduleblockModel();
            $result =  $SheduleblockModel->delete($this->data->blockid);

        } else 
        {
        $AccumassageapptsModel = new AccumassageapptsModel();
        $result = $AccumassageapptsModel
             ->delete($this->data->id);
    }
    $this->data->result = $result;

        echo json_encode($this->data);

    }
}
