<?php

namespace App\Models;

use CodeIgniter\Model;

class Oauth_access_tokens extends Model
{
    protected $table = 'riders';
    protected $primaryKey = 'access_token';

    protected $useAutoIncrement = true;

    protected $returnType = 'object';
    // protected $useSoftDeletes = true;

    protected $allowedFields = ['client_id',
        'user_id', 'expires',
        'scope',
    ];

    // protected $useTimestamps = false;
    // protected $createdField = 'created_at';
    // protected $updatedField = 'updated_at';
    // protected $deletedField = 'deleted_at';

    protected $validationRules = [];
    protected $validationMessages = [];
    protected $skipValidation = false;
}
