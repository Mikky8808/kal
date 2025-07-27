<?php

namespace App\Models;

use CodeIgniter\Model;

class MembershiprenewalsModel extends Model
{
    protected $DBGroup = 'default';
    protected $table = 'membershiprenewals';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $insertID = 0;
    protected $returnType = 'object';
    protected $useSoftDeletes = true;
    protected $protectFields = true;
    protected $allowedFields = ['memberId',  'transactiondate', 'mbrshpStartDate','mbrshpEndDate',
         'amtpaid','paymentType','daypass','points','notes'];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat = 'datetime';
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
    protected $deletedField = 'deleted_at';

    // Validation
    protected $validationRules = [];
    protected $validationMessages = [];
    protected $skipValidation = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert = ['beforeInsert'];
    protected $afterInsert = [];
    protected $beforeUpdate = ['beforeUpdate'];
    protected $afterUpdate = [];
    protected $beforeFind = [];
    protected $afterFind = [];
    protected $beforeDelete = [];
    protected $afterDelete = [];

    protected function beforeInsert($data)
    {

        $data['data']['created_by'] = session()->username;
        $data['data']['modified_by'] = session()->username;
        return $data;
    }
    protected function beforeUpdate($data)
    {

        $data['data']['modified_by'] = session()->username;
        return $data;
    }

}
