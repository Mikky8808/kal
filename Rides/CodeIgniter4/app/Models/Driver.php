<?php

namespace App\Models;

use CodeIgniter\Model;

class Driver extends Model
{
    protected $table = 'drivers';
    protected $primaryKey = 'id';

    protected $useAutoIncrement = true;

    protected $returnType = 'object';
    // protected $useSoftDeletes = true;

    protected $allowedFields = ['user_login',
        'user_pass', 'user_name',
        'user_phone', 'usertype', 'isAdmin',
        'last_login', 'last_ip', 'user_status'];

    // protected $useTimestamps = false;
    // protected $createdField = 'created_at';
    // protected $updatedField = 'updated_at';
    // protected $deletedField = 'deleted_at';

    protected $validationRules = [];
    protected $validationMessages = [];
    protected $skipValidation = false;
}
