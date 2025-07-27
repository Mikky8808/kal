<?php
namespace App\Controllers\Api;

use App\Models\TripsModel;
use CodeIgniter\API\ResponseTrait;

class Rides extends BaseController
{
    use ResponseTrait;

    protected function respondConflict($data)
    {
        return $this->respond($data, 409);
    }

    // Automatically deletes soft-deleted trips from DB
    private function cleanSoftDeletedTrips()
    {
        $TripsModel = new TripsModel();
        $TripsModel->where('deleted_at IS NOT NULL', null, false)->delete();
    }

    public function getTrip()
    {
        $this->cleanSoftDeletedTrips();

        $TripsModel = new TripsModel();

        $trip = $TripsModel
            ->select('trips.id, rider_id, driver, name, driver, members.phone, seStatus, wheelChair,
                      reason, DATE_FORMAT(pickupDate,"%Y-%m-%d") as pickupDate,
                      DATE_FORMAT(pickupDate,"%H:%i") as pickupTime,
                      DATE_FORMAT(apptDate,"%Y-%m-%d") as apptDate,
                      DATE_FORMAT(apptDate,"%H:%i") as apptTime,
                      passengers, pickAddress, dropAddress, trips.instructions')
            ->where("trips.id", $this->data->id)
            ->join('members', 'members.id = trips.rider_id')
            ->first();

        if (!$trip) {
            return $this->failNotFound('Trip not found');
        }

        return $this->respond($trip);
    }

    public function updateRideAppt()
    {
        $this->cleanSoftDeletedTrips();

        $TripsModel = new TripsModel();
        $trip = $TripsModel->save($this->data);

        if ($trip === false) {
            return $this->failValidationErrors($TripsModel->errors());
        }

        $this->data->trip = $trip;
        return $this->respond($this->data);
    }

    public function getDayTrips()
    {
        $this->cleanSoftDeletedTrips();

        $TripsModel = new TripsModel();

        $trips = $TripsModel
            ->select('trips.id, driver, rider_id, ptapptsID, members.phone, seStatus, rtnTrip, wheelChair,
                      CONCAT(members.firstName," ",members.LastName ) as name,
                      DATE_FORMAT(pickupDate,"%h:%i %p") as pickupTime')
            ->where("DATE_FORMAT(pickupDate,'%Y-%m-%d')", $this->data->date)
            ->join('members', 'members.id = trips.rider_id')
            ->orderBy('pickupDate')
            ->findAll();

        return $this->respond($trips);
    }

    public function assignDriver()
    {
        $this->cleanSoftDeletedTrips();

        $TripsModel = new TripsModel();
        $TripsModel->save($this->data);
        return $this->respond($this->data);
    }

    public function getAllRidesCal()
    {
        $this->cleanSoftDeletedTrips();

        $TripsModel = new TripsModel();

        $data = $TripsModel
            ->select('trips.id as tripsId, seStatus, 
                      CONCAT(members.firstName," ",members.LastName ) as title,
                      pickupDate as start, wheelChair,
                      DATE_ADD(pickupDate, INTERVAL 30 MINUTE) as end,
                      CASE
                         WHEN rtnTrip = 1 THEN "red"
                         ELSE "green"
                      END AS color,
                      ridestatus.Icon', false)
            ->where('pickupDate >=', $this->data->startStr)
            ->where('pickupDate <=', $this->data->endStr)
            ->join('members', 'members.id = trips.rider_id')
            ->join('ridestatus', 'ridestatus.status = trips.seStatus')
            ->findAll();

        return $this->respond($data);
    }

    public function createRideAppt()
    {
        $this->cleanSoftDeletedTrips();

        $TripsModel = new TripsModel();
        $trip = clone $this->data;

        try {
            $this->db->transBegin();

            foreach ($this->data->daysSelected as $apptDate) {
                $pickupDateTime = $apptDate . ' ' . $this->data->ridePickupTime;

                // --- Double booking restrictions removed as requested ---

                // Insert primary ride
                $trip->apptDate = $apptDate . ' ' . $this->data->apptTime;
                $trip->pickupDate = $pickupDateTime;
                $trip->rtnTrip = 0;
                $trip->pickAddress = $this->data->pickAddress;
                $trip->dropAddress = $this->data->dropAddress;
                $TripsModel->insert($trip);

                // If round trip is needed
                if ($this->data->roundTrip == 0) {
                    $returnPickup = $apptDate . ' ' . $this->data->rideDropTime;

                    // No double booking check for return trip either

                    // Insert return ride
                    $trip->pickupDate = $returnPickup;
                    $trip->pickAddress = $this->data->dropAddress;
                    $trip->dropAddress = $this->data->pickAddress;
                    $trip->rtnTrip = 1;
                    $TripsModel->insert($trip);
                }
            }

        } catch (\Throwable $e) {
            $this->db->transRollback();
            return $this->failServerError('Internal server error: ' . $e->getMessage());
        }

        $this->db->transCommit();

        return $this->respondCreated([
            'status' => 'success',
            'message' => 'Ride(s) created successfully',
            'data' => $this->data
                ]);
    }
}