<?php

namespace App\Controllers\Api;

use App\Models\MembershiprenewalsModel;
use App\Models\MembersModel;

class Membershiprenewals extends BaseController
{

    public function Delete()
    {
        $MembershiprenewalsModel = new MembershiprenewalsModel();
        $result = $MembershiprenewalsModel
        ->where('id',$this->data->id)
        ->delete();
        $this->data->result = $result;
        $memRenwal = $MembershiprenewalsModel
        ->select('memberID as id, mbrshpStartDate, mbrshpEndDate')
        ->where('memberId', $this->data->memberId)
        ->orderBy('mbrshpEndDate', 'desc')
        ->first();
    if (isset($memRenwal)) {

        $MembersModel = new MembersModel();
        $MembersModel->save($memRenwal);
    }
    
        return  $this->getAllMemberRenwals();

    }
    
    public function saveMemberRenwals()
    {

        $MembershiprenewalsModel = new MembershiprenewalsModel();
        $MembershiprenewalsModel->save($this->data);
        $this->data->insertID = $this->db->insertID();

        $memRenwal = $MembershiprenewalsModel
            ->select('memberID as id, mbrshpStartDate, mbrshpEndDate')
            ->where('memberId', $this->data->memberId)
            ->orderBy('mbrshpEndDate', 'desc')
            ->first();
        if (isset($memRenwal)) {

            $MembersModel = new MembersModel();
            $MembersModel->save($memRenwal);
        }

        return  $this->getAllMemberRenwals();

    }

    public function getAllMemberRenwals()
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

        $MembershiprenewalsModel = new MembershiprenewalsModel();
        $renewal = $MembershiprenewalsModel
            ->where('memberId', $this->data->memberId)
            ->orderBy('transactiondate', 'desc')

            ->findAll();
        $data['member'] = $member;

        $data['renewal'] = $renewal;

        return json_encode($data);

    }
    //

}
