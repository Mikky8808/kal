<?php

namespace App\Controllers\Api;

use App\Models\LunchreservationsModel;
use App\Models\LunchtypesModel;



class LunchReservation extends BaseController
{

    public function Save()
    {
        $LunchreservationsModel = new LunchreservationsModel();
        $LunchreservationsModel->save($this->data);
        $this->data->insertID = $this->db->insertID();
        echo json_encode($this->data);

    }

    public function Delete()
    {
        $LunchreservationsModel = new LunchreservationsModel();
        $result = $LunchreservationsModel
            ->where('id', $this->data->id)
            ->delete();
        $this->data->result = $result;
        echo json_encode($this->data);

    }


   
    public function Get()
    {
        $LunchreservationsModel = new LunchreservationsModel();
        $data = $LunchreservationsModel
            ->select('memberId, lunchreservations.id as id,  lunchreservations.status, guests,guestNames,
                 CONCAT(TRIM(LastName),", ",TRIM(firstName) ) as fullName,  date')

            ->where('lunchreservations.id', $this->data->id)
            ->join('members', 'members.id = lunchreservations.memberId')
 
            ->first();

  ;

        // $data =  $counts + $lunchs;
        

        echo json_encode($data);

    }
   
    public function getAll()
    {
        $LunchreservationsModel = new LunchreservationsModel();
        $lunchs = $LunchreservationsModel
            ->select('memberId, lunchreservations.id as apptsID, lunchreservations.status, guests,guestNames,
        CASE
        WHEN nickName > "" THEN  CONCAT(TRIM(LastName),", ",TRIM(firstName)," (",nickName,")")
        ELSE CONCAT(TRIM(LastName),", ",TRIM(firstName) )
        END AS title,
        date as start, date as Date,
        lunchstatus.statusIcon,
          "white"
      AS color')

            ->where('date >=', $this->data->startStr)
            ->where('date <', $this->data->endStr)
            ->join('members', 'members.id = lunchreservations.memberId')
            ->join('lunchstatus', 'lunchstatus.status = lunchreservations.status')
            ->orderBy('date')
            ->orderBy('title')
            ->findAll();

        $counts = $LunchreservationsModel
            ->select('  COUNT(*) as title, date as start,
        "summarize" as statusIcon,
        99 as status,

        "white" as color')

            ->where('date >=', $this->data->startStr)
            ->where('date <', $this->data->endStr)
            ->groupBy('date')
            ->findAll();

        $LunchtypesModel = new LunchtypesModel();

        $lucnhTypes = $LunchtypesModel
            ->select(' CONCAT(" ",lunchtypes.desc)  as title, date as start,
       "lunch_dining" as statusIcon,
       99 as status,

       "white" as color')

            ->where('date >=', $this->data->startStr)
            ->where('date <', $this->data->endStr)
            ->findAll();

        $data = array_merge($lunchs, $counts, $lucnhTypes);

        // $data =  $counts + $lunchs;
        

        echo json_encode($data);

    }
    //
    public function Insert()
    {

        $LunchreservationsModel = new LunchreservationsModel();

        if ($this->data->id > 0) {
            $this->data->reuslt = $LunchreservationsModel->save($this->data);
            $this->db->error = $this->db->error();
        }

        try {
            $this->db->transBegin();

            foreach ($this->data->daysSelected as $date) {
                $this->data->date = $date;

                $LunchreservationsModel->insert($this->data);

            }
        } catch (\Exception $e) {
            $this->db->transRollback();
            throw new \error ("Error Processing Request", 1);

        }
        $this->db->transCommit();

        echo json_encode($this->data);

    }

    public function createLunchTypes()
    {

        $LunchtypesModel = new LunchtypesModel();

        try {
            $this->db->transBegin();

            foreach ($this->data->daysSelected as $date) {
                $this->data->date = $date;

                $result = $LunchtypesModel->save($this->data);

            }
        } catch (\Error $e) {
            $this->db->transRollback();
            throw new \Exception("Error Processing Request", 1);

        }
        $this->db->transCommit();
        $this->data->result = $result;
        echo json_encode($this->data);

    }

}
