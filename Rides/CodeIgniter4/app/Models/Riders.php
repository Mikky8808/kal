<?php

namespace App\Models;

use CodeIgniter\Model;

class Riders extends Model
{
    protected $table = 'riders';
    protected $primaryKey = 'id';

    protected $useAutoIncrement = true;

    protected $returnType = 'object';
    // protected $useSoftDeletes = true;

    protected $allowedFields = [
        'firstName', 'middleName',
        'lastName', 'address', 'city',
        'state', 'zipCode', 'phone', 'email', 'instructions',
    ];

    // protected $useTimestamps = false;
    // protected $createdField = 'created_at';
    // protected $updatedField = 'updated_at';
    // protected $deletedField = 'deleted_at';

    protected $validationRules = [];
    protected $validationMessages = [];
    protected $skipValidation = false;
}