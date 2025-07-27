<?php

namespace App\Controllers\Api;

use App\Models\MemberpointredeemedModel;
use App\Models\MembersModel;

class Memberpointredeems extends BaseController
{
    public function Delete()
    {

        $MemberpointredeemedModel = new MemberpointredeemedModel();
        $MemberpointredeemedModel
        ->where('id',$this->data->id)
        ->delete();
 
        return $this->getAllMemberRedeem();

    }

    public function Save()
    {

        $MemberpointredeemedModel = new MemberpointredeemedModel();
        $MemberpointredeemedModel->save($this->data);
        $this->data->insertID = $this->db->insertID();

        return $this->getAllMemberRedeem();
        echo json_encode($this->data);

    }

    public function getAllMemberRedeem()
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

        $MemberpointredeemedModel = new MemberpointredeemedModel();
        $redeem = $MemberpointredeemedModel
            ->where('memberId', $this->data->memberId)
            ->join('pointredeemtypes', 'pointredeemtypes.type = memberpointredeemed.redeemType', 'left')

            ->orderBy('transactiondate', 'desc')

            ->findAll();
        $data['member'] = $member;

        $data['redeem'] = $redeem;

        return json_encode($data);

    }
    //

}
