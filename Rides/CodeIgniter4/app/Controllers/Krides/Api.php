<?php namespace App\Controllers\Krides;

use App\Models\Driver;
use App\Models\Trips;
use App\Models\Riders;

class Api extends BaseController
{

    public function getDriverProfile()
    {
        $data = $this->request->getJSON();
        $model = new Driver();

        $user = $model->find($data->user_id);
        echo json_encode($user);

    }
    public function saveTripRide()
    {
        $model = new Trips();
        $data = $this->request->getJSON();
        if ($data->id > 0) {
            $model->save($data);
            $data = $model->find($data->id);
        } else {
            $data->id = $model->insert($data);
            if ($data->roundTrip === true) {
                $rtnTrip = clone $data;
                $rtnTrip->pickupDate = $data->returnDate;
                $rtnTrip->pickAddress = $data->dropAddress;
                $rtnTrip->dropAddress = $data->pickAddress;
                $rtnTrip->rtnTrip = true;
                $rtnTrip->id = $model->insert($rtnTrip);
                $data->rtnTrip = $rtnTrip;
            }
        }

        echo json_encode($data);
        //echo json_encode($model->insert($this->request->getJSON()));

    }

    public function getAllTrips()
    {
        $model = new Trips();
        $id = $this->request->getJSON();
        if ($id != 0) {
            echo json_encode($model->where('rider_id', $id)->findAll());
        } else {
            echo json_encode($model->findAll());
        }

    }
    public function getTrip()
    {
        $model = new Trips();
        $id = $this->request->getJSON();

        echo json_encode($model->find($id));

    }
    public function getDayTrips()
    {
        $model = new Trips();
        $data = $this->request->getJSON();
        echo json_encode($model->where("DATE_FORMAT(pickupDate,'%Y-%m-%d')", $data->date)->where('seStatus <',6)->orderBy('pickupDate')->findAll());
        // if ($id != 0) {
        //     echo json_encode($model->where('rider_id', $id)->findAll());
        // } else {
        //     echo json_encode($model->findAll());
        // }

    }

    public function saveRider()
    {
        $model = new Riders();
        $data = $this->request->getJSON();
        if ($data->id > 0) {
            $model->save($data);
        } else { $data->id = $model->insert($data);}
        $resp["data"] = $data;
        $resp["Riders"] = $this->db->table("riders_view")->get()->getResult();

        echo json_encode($resp);
        //echo json_encode($model->insert($this->request->getJSON()));

    }

    public function getAllRiders()
    {

        //  $this->db->table("riders_view")->get()->getResult();

        echo json_encode($this->db->table("riders_view")
                ->get()
                ->getResult());

    }
    public function assignDriver()
    {
        $model = new Trips();
        $data = $this->request->getJSON();
         if ($data->id > 0) {
             $model->save($data);
            $data = $model->find($data->id);
         }
        // } else {
        //     $data->id = $model->insert($data);
        //     if ($data->roundTrip === true) {
        //         $rtnTrip = clone $data;
        //         $rtnTrip->pickupDate = $data->returnDate;
        //         $rtnTrip->pickAddress = $data->dropAddress;
        //         $rtnTrip->dropAddress = $data->pickAddress;
        //         $rtnTrip->rtnTrip = true;
        //         $rtnTrip->id = $model->insert($rtnTrip);
        //         $data->rtnTrip = $rtnTrip;
        //     }
        // }

        echo json_encode($data);
        //echo json_encode($model->insert($this->request->getJSON()));

    }
 
    //--------------------------------------------------------------------

}