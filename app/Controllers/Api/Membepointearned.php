<?php

namespace App\Controllers\Api;

use App\Models\MembepointearnedModel;
use App\Models\MembersModel;

class Membepointearned extends BaseController
{
    public function Delete()
    {

        $MembepointearnedModel = new MembepointearnedModel();
        $MembepointearnedModel
        ->where('id',$this->data->id)
        ->delete();
 
        return $this->getAllMemberEarned();

    }

    public function Save()
    {

        $MembepointearnedModel = new MembepointearnedModel();
        $MembepointearnedModel->save($this->data);
        $this->data->insertID = $this->db->insertID();

        return $this->getAllMemberEarned();
        echo json_encode($this->data);

    }

    public function getAllMemberEarned()
    {

        $model = new MembersModel();

        $member = $model
            ->select('id as memberId')
            ->select('membertypes.desc as memberTypeDesc, membertypes.icon as membTypeIcon,')
            ->select('membershiptypes.desc as memberTypeTypeDesc, membershiptypes.icon as membershiptypesIcon,')

            ->select('CASE
                WHEN nickName > "" THEN  CONCAT(TRIM(LastName),", ",TRIM(firstName)," (",nickName,")")
                ELSE CONCAT(TRIM(LastName),", ",TRIM(firstName) )
                END AS fullName,')
            ->select('
        CASE
        WHEN avatar > "" THEN CONCAT("/profileimgs/",id,"/sm-",avatar)
        ELSE "/profileimgs/person.png"
     END AS avatar')
            ->where('id', $this->data->memberId)
            ->join('membertypes', 'membertypes.type = members.membertype', 'left')
            ->join('membershiptypes', 'membershiptypes.type = members.membershiptype', 'left')

            ->first();

        $MembepointearnedModel = new MembepointearnedModel();
        $earned = $MembepointearnedModel
            ->where('memberId', $this->data->memberId)
            ->join('pointearntypes', 'pointearntypes.type = memberpointearned.earnType', 'left')

            ->orderBy('transactiondate', 'desc')

            ->findAll();
        $data['member'] = $member;

        $data['earned'] = $earned;

        return json_encode($data);

    }
    //

}
