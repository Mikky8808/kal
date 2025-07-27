<?php

namespace App\Controllers\Api;

use App\Models\MembepointpurchasesModel;
use App\Models\MembersModel;

class Membepointpurchases extends BaseController
{
    public function Delete()
    {

        $MembepointpurchasesModel = new MembepointpurchasesModel();
        $MembepointpurchasesModel
        ->where('id',$this->data->id)
        ->delete();
 
        return $this->getAllMemberpurchases();

    }

    public function saveMemberPurchases()
    {

        $MembepointpurchasesModel = new MembepointpurchasesModel();
        $MembepointpurchasesModel->save($this->data);
        $this->data->insertID = $this->db->insertID();

        return $this->getAllMemberpurchases();
        echo json_encode($this->data);

    }

    public function getAllMemberpurchases()
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

        $MembepointpurchasesModel = new MembepointpurchasesModel();
        $purchases = $MembepointpurchasesModel
            ->where('memberId', $this->data->memberId)
            ->orderBy('transactiondate', 'desc')

            ->findAll();
        $data['member'] = $member;

        $data['purchases'] = $purchases;

        return json_encode($data);

    }
    //

}
