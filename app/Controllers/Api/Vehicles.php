<?php

namespace App\Controllers\Api;

use App\Models\VehiclesodometerModel;

class Vehicles extends BaseController
{

    public function Save()
    {
        $model = new VehiclesodometerModel();

        $model->save($this->data);

        return json_encode($this->data);
    }

    public function getLast()
    {
        if (isset($this->data->id)) {
            $model = new VehiclesodometerModel();
            $vehicle = $model->find($this->data->id);

        } else {

            $vehicle = $this->db->table('vehicles')
                ->select('vehicles.id as vehicle_id, odometer,  vehicles.vehicle as vehicle, reason')
                ->select('CASE WHEN vehiclesodometer.location = "out" THEN "in" ELSE "out" END AS location', false)

                ->where('vehicles.vid', $this->data->vid)
                ->orderBy('created_at', 'DESC')
                ->join(' vehiclesodometer', 'vehiclesodometer.vehicle_id = vehicles.id', 'left')

                ->get()->getRow();

        }

        return json_encode($vehicle);
    }
    public function getVehodometer()
    {
        $model = new VehiclesodometerModel();

        $data = $model
            ->select('vehiclesodometer.id as id, vehicles.id as resourceId, location, reason,
                  CONCAT(users.first_name ," (", odometer,")" ) as title,
                  created_at as start')
            ->select('CASE WHEN vehiclesodometer.location = "in" THEN  vehicles.outColor ELSE vehicles.color END AS color', false)
            ->where('created_at >=', $this->data->startStr)
            ->where('created_at <=', $this->data->endStr)
            ->join('vehicles', 'vehicles.id = vehiclesodometer.vehicle_id', 'left')

             ->join('users', 'users.username = vehiclesodometer.driver', 'left')

            // ->where ('apptDate <=',$this->data->end)
            ->findAll();

        return json_encode($data);
    }
}
