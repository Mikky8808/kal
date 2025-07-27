<?php

namespace App\Controllers\Api;

use App\Models\MembersModel;
use App\Models\PointsTransactionsModel;

class PointsTransactions extends BaseController
{

    public function Delete()
    {

        $PointsTransactionsModel = new PointsTransactionsModel();

        $result = $PointsTransactionsModel
            ->where('id', $this->data->id)
            ->delete();

        if ($this->data->tran_type == 'MEMBERSHIP') {
            $memRenwal = $PointsTransactionsModel
                ->select('memberID as id, mbrshpStartDate, mbrshpEndDate')
                ->where('memberId', $this->data->memberId)
                ->where('tran_type', 'MEMBERSHIP')
                ->orderBy('mbrshpEndDate', 'desc')
                ->first();
            if (isset($memRenwal)) {

                $MembersModel = new MembersModel();
                $MembersModel->save($memRenwal);
            }
        }

        return $this->getAllPointTrans();
    }

    public function Save()
    {

        $PointsTransactionsModel = new PointsTransactionsModel();
        $PointsTransactionsModel->save($this->data);
        $this->data->insertID = $this->db->insertID();

        if ($this->data->tran_type == 'MEMBERSHIP') {

            $memRenwal = $PointsTransactionsModel
                ->select('memberID as id, mbrshpStartDate, mbrshpEndDate')
                ->where('tran_type', 'MEMBERSHIP')

                ->where('memberId', $this->data->memberId)
                ->orderBy('mbrshpEndDate', 'desc')
                ->first();
            if (isset($memRenwal)) {
                $MembersModel = new MembersModel();
                $MembersModel->save($memRenwal);
            }
        }

        return $this->getAllPointTrans();
    }

    public function getAllPointTrans()
    {

        $model = new MembersModel();

        $member = $model
            ->select('id as memberId, members.notes')
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

        $PointsTransactionsModel = new PointsTransactionsModel();

        if ($this->data->tran_type == 'MEMBERSHIP') {
            $PointsTransactionsModel->orderBy('transactiondate', 'DESC');
        } else {
            $PointsTransactionsModel->orderBy('transactiondate', 'DESC');
        }

        $pointTrans = $PointsTransactionsModel
            ->select('points_transactions.*, point_methods.description')
            ->where('memberId', $this->data->memberId)
            ->where('points_transactions.tran_type', $this->data->tran_type)
            ->join('point_methods', 'point_methods.method = points_transactions.method
            AND point_methods.tran_type = points_transactions.tran_type', 'left')

            ->findAll();

        $data['member'] = $member;

        $data['pointTrans'] = $pointTrans;

        return json_encode($data);
    }
    //

}
