<?php

namespace App\Models;

use CodeIgniter\Model;

class Trips extends Model
{
    protected $table = 'trips';
    protected $primaryKey = 'id';

    protected $useAutoIncrement = true;

    protected $returnType = 'object';
    // protected $useSoftDeletes = true;

    protected $allowedFields = ['rider_id',
        'driver', 'seStatus', 'name',
        'pickupDate', 'apptDate', 'pickAddress',
        'dropAddress', 'phone', 'passengers',
        'reason', 'miles', 'instructions', 'rtnTrip',
    ];

    // protected $useTimestamps = false;
    // protected $createdField = 'created_at';
    // protected $updatedField = 'updated_at';
    // protected $deletedField = 'deleted_at';

    protected $validationRules = [];
    protected $validationMessages = [];
    protected $skipValidation = false;
}