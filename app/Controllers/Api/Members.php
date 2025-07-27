<?php

namespace App\Controllers\Api;

use App\Models\AccumassageapptsModel;
use App\Models\LunchreservationsModel;
use App\Models\MembepointearnedModel;
use App\Models\MembepointpurchasesModel;
use App\Models\MembercheckinsModel;
use App\Models\MembershiprenewalsModel;
use App\Models\MembersModel;
use App\Models\PointsTransactionsModel;
use App\Models\PtapptsModel;
use App\Models\TripsModel;
use Laminas\Barcode\Barcode;

class Members extends BaseController
{

    public function validateCreateMember()
    {
        $errors = [];
        $model = new MembersModel();
        if (isset($this->data->emrID) && $this->data->emrID > "") {
            $member = $model->where('emrID', $this->data->emrID)->first();
            if ($member) {
                $errors[] = "Another Member with same emrID ($member->emrID) with ID($member->id) Already exists";
                header("HTTP/1.1 501 Validation Error");
                echo json_encode($errors);
                exit;
            }
        }

        $member = $model
            ->where('DOB', $this->data->DOB)
            // ->where ('TRIM(LOWER(lastName))',strtolower(trim($this->data->lastName))
            ->where('TRIM(LOWER(lastName))', strtolower(trim($this->data->lastName)))
            ->first();

        if ($member) {
            $errors[] = "Another Member with same Last Name and DOB  ($member->id) Already exists";
            header("HTTP/1.1 501 Validation Error");
            echo json_encode($errors);
            exit;
        }
    }
    public function saveMember()
    {

        $model = new MembersModel();

        if ($this->data->id > 0) {
            $model->save($this->data);
        } else {
            $this->validateCreateMember();
            $this->data->id = $model->insert($this->data);
        }
        $this->createBarCode($this->data);

        return json_encode($this->data);
    }

    public function checkInMember()
    {

        $MembercheckinsModel = new MembercheckinsModel();
        $MembersModel = new MembersModel();
        if (isset($this->data->memberId)) {
            $MembersModel->where('id', $this->data->memberId);
        }
        if (isset($this->data->DL)) {
            $MembersModel->where('DL', $this->data->DL);
        }

        $member = $MembersModel
            ->select('*,
        CONCAT("/profileimgs/",id,"/barcode128.png") as barcode,
        membertypes.icon as membTypeIcon,
        membershiptypes.icon as membershiptypesIcon,
    CASE
    WHEN avatar > "" THEN CONCAT("/profileimgs/",id,"/sm-",avatar)
    ELSE "/profileimgs/person.png"
 END AS avatar')
            ->select('CASE WHEN membertype = "M" AND (mbrshpEndDate IS null or mbrshpEndDate < CURDATE()) THEN 1
                  ELSE 0
                  END AS expired ,')
            ->join('membershiptypes', 'membershiptypes.type = members.membershiptype', 'left')
            ->join('membertypes', 'membertypes.type = members.membertype', 'left')

            ->first();
        if ($member) {
            $MembercheckinsModel
                ->where('memberId', $member->id)
                ->where('type', $this->data->type)
                ->where('DATE_FORMAT(date,"%Y-%m-%d") = DATE_FORMAT(now(),"%Y-%m-%d")')
                ->delete();

            $this->data->memberId = $member->id;

            $MembercheckinsModel
                ->save($this->data);
        }

        return json_encode($member);
    }

    public function deleteCheckInMember()
    {

        $MembercheckinsModel = new MembercheckinsModel();

        $MembercheckinsModel
            ->where('id', $this->data->id)
            ->delete();

        return json_encode($this->data);
    }

    public function uploadMemberPic()
    {
        $imageproc = \Config\Services::image();
        $model = new MembersModel();

        $this->data->FCPATH = FCPATH;
        $img = $this->request->getFile('avatarpic');

        $this->data->img = $img;
        if ($img->isValid() && !$img->hasMoved()) {
            $newName = $img->getClientName();
            $img->move(FCPATH . 'profileimgs/' . $this->data->id, $newName, true);
            $size = getimagesize(FCPATH . 'profileimgs/' . $this->data->id . '/' . $newName);
            $this->data->size = $size;
            $imageproc->withFile(FCPATH . 'profileimgs/' . $this->data->id . '/' . $newName)
                ->fit(400, 400, 'center')
                ->reorient()

                ->save(FCPATH . 'profileimgs/' . $this->data->id . '/sm-' . $newName);

            $this->data->avatar = $newName . '?d=' . time();
            $model->save($this->data);

        }
        return json_encode($this->data);
    }

    private function createBarCode($member)
    {
        $path = FCPATH . 'profileimgs/' . $member->id;
        $filename = $path . '/barcode128.png';

        if (file_exists($filename)) {
            return;
        }

        if (!is_dir($path)) {
            mkdir(FCPATH . 'profileimgs/' . $member->id, 0755, true);
        }

        $barcodeOptions = ['text' => "KALANI: $member->id",
            'barHeight' => 20, 'withBorder' => false, 'drawText' => false, "stretchText" => false];
        $rendererOptions = [];
        $barcodeImage = Barcode::draw('code128',
            'image',
            $barcodeOptions,
            $rendererOptions);
        imagepng($barcodeImage, $filename);

    }

    public function getMember()
{
    $model = new MembersModel();

    $member = $model
        ->select('
            *,
            insurancetype,
            CONCAT("/profileimgs/",id,"/barcode128.png") as barcode,
            CASE
                WHEN avatar > "" THEN CONCAT("/profileimgs/",id,"/sm-",avatar)
                ELSE "/profileimgs/person.png"
            END AS avatar
        ')
        ->where('id', $this->data->id)
        ->first();

    return json_encode($member);
}
    private function getPointTrans($type, $memberId, $orderBy = 'transactiondate')
    {

        $PointsTransactionsModel = new PointsTransactionsModel();

        return $PointsTransactionsModel
            ->select('points_transactions.*, point_methods.description')
            ->where('memberId', $memberId)
            ->where('points_transactions.tran_type', $type)
            ->join('point_methods', 'point_methods.method = points_transactions.method
            AND point_methods.tran_type = points_transactions.tran_type', 'left')

            ->orderBy($orderBy, 'DESC')

            ->findAll();

    }

    public function getMemberQV()
    {
        // $this->createBarCode($this->data->id);

        $MembersModel = new MembersModel();
        $LunchreservationsModel = new LunchreservationsModel();
        // ->where('date >= DATE_FORMAT(NOW(),"%Y-%m-%d")')

        $PtapptsModel = new PtapptsModel();

        $AccumassageapptsModel = new AccumassageapptsModel();

        // $MembepointearnedModel = new MembepointearnedModel();
        // $MembershiprenewalsModel = new MembershiprenewalsModel();
        // $MembepointpurchasesModel = new MembepointpurchasesModel();
        $TripsModel = new TripsModel();

        // ->where('DATE_FORMAT(pickupDate,"%Y-%m-%d") >=  DATE_FORMAT(NOW(),"%Y-%m-%d")')
        if ($this->data->showAll == 0) {
            $TripsModel->where('DATE_FORMAT(pickupDate,"%Y-%m-%d") >=  DATE_FORMAT(NOW(),"%Y-%m-%d")');
            $AccumassageapptsModel->where('apptDateTime >= DATE_FORMAT(NOW(),"%Y-%m-%d")');
            $PtapptsModel->where('apptDateTime >= DATE_FORMAT(NOW(),"%Y-%m-%d")');
            $LunchreservationsModel->where('date >= DATE_FORMAT(NOW(),"%Y-%m-%d")');
        }

        $member = $MembersModel
            ->select('*,
            CONCAT("/profileimgs/",id,"/barcode128.png") as barcode,
            membertypes.icon as membTypeIcon,
            membershiptypes.icon as membershiptypesIcon,
            CONCAT(TRIM(members.LastName),", ",TRIM(members.firstName )) as fullName,
        CASE
        WHEN avatar > "" THEN CONCAT("/profileimgs/",id,"/sm-",avatar)
        ELSE "/profileimgs/person.png"
     END AS avatar')
            ->select('CASE WHEN mbrshpEndDate IS null or mbrshpEndDate < CURDATE() THEN 1
                      ELSE 0
                      END AS expired ,')
            ->where('id', $this->data->id)
            ->join('membershiptypes', 'membershiptypes.type = members.membershiptype', 'left')
            ->join('membertypes', 'membertypes.type = members.membertype', 'left')

            ->first();

        $this->createBarCode($member);

        $data["lunch"] = $LunchreservationsModel
            ->select('lunchreservations.id , lunchreservations.status, guests,guestNames,
               "Lunch"            AS title,  memberId,
                date as start,
                lunchstatus.statusIcon,
                CASE
                WHEN DAYOFWEEK(date) = 3 THEN "white"
                WHEN DAYOFWEEK(date) = 4 THEN "white"
                ELSE "white"
             END AS color')

            // ->where('date >= DATE_FORMAT(NOW(),"%Y-%m-%d")')
            ->where('memberId', $this->data->id)
            ->join('members', 'members.id = lunchreservations.memberId')
            ->join('lunchstatus', 'lunchstatus.status = lunchreservations.status')
            ->orderBy('date')
            ->orderBy('title')
            ->findAll();

            $data["Ptappts"] = $PtapptsModel
            ->select('ptappts.id as ptapptsID, ptappts.status, PTStaff ,ptappts.memberId,
                          CONCAT(members.firstName," ",members.LastName ) as title, initialVisit,
                          apptDateTime as start,apptDuration,
                            users.ptColor as color, ptappts.wheelChair,
                          DATE_ADD(apptDateTime, INTERVAL apptDuration MINUTE) as end,
                          ptstatus.statusIcon, reserveRide')
            // ->where('apptDateTime >= DATE_FORMAT(NOW(),"%Y-%m-%d")')
            ->where('memberId', $this->data->id)
            ->orderBy('apptDateTime')

            ->join('members', 'members.id = ptappts.memberId', 'left')
            ->join('users', 'users.username = ptappts.PTStaff', 'left')
            ->join('ptstatus', 'ptstatus.status = ptappts.status', 'left')
            ->findAll();
        //   DATE_FORMAT(apptDateTime, "%a, %b %e %Y  %h:%i %p")  as start,

              // Color-coded past massage/acupuncture sessions
        $data["accuMassages"]  = $AccumassageapptsModel
            ->select('accumassageappts.id as id, accumassageappts.status,
                CONCAT(TRIM(members.LastName),", ",TRIM(members.firstName)) as title,
                DATE_FORMAT(apptDateTime,"%m/%d/%Y %h:%i %p") as start,
                DAYOFWEEK(apptDateTime) as day,
                CASE
                    WHEN accumassageappts.status = 20 THEN "#4caf50"      -- Completed: green
                    WHEN accumassageappts.status = 30 THEN "#f44336"      -- No-show: red (replace 30 with your actual code if different)
                    ELSE "#a160c7"
                END AS color')
            ->where('memberId', $this->data->id)
            ->orderBy('apptDateTime')
            ->join('members', 'members.id = accumassageappts.memberId')
            ->join('ptstatus', 'ptstatus.status = accumassageappts.status')
            ->findAll();


        $data['renewal'] = $this->getPointTrans('MEMBERSHIP', $this->data->id);
        $data['earn'] = $this->getPointTrans('EARN', $this->data->id);
        $data['purchases'] = $this->getPointTrans('PURCHASE', $this->data->id);
        $data['redeem'] = $this->getPointTrans('REDEEM', $this->data->id);

       // SELECT memberId, tran_type,   ,  , where memberId = 5184 GROUP BY memberId;
       $PointsTransactionsModel = new PointsTransactionsModel();


           $data['sumPoints'] = $PointsTransactionsModel
           ->select('memberId, tran_type')
           ->select("CAST(SUM(CASE WHEN mbrshpStartDate > CURDATE() THEN 0 WHEN tran_type = 'REDEEM' THEN (points * -1) ELSE points END) AS SIGNED) AS totPoints ")
           ->select("CAST(SUM(CASE WHEN mbrshpStartDate > CURDATE() THEN points ELSE 0 END) AS SIGNED) AS totPendPoints ")
           ->select("CAST(SUM(CASE WHEN mbrshpStartDate > CURDATE() THEN 0 WHEN tran_type = 'REDEEM' THEN (daypass * -1) ELSE daypass END) AS SIGNED) AS totdaypass")
           ->select("CAST(SUM(CASE WHEN mbrshpStartDate > CURDATE() THEN daypass ELSE 0 END) AS SIGNED) AS totPenddaypass")
           ->where('memberId', $this->data->id)
           ->groupBy('memberId, tran_type')
           ->find();

           $data['trips'] = $TripsModel
            ->select('id, driver,  ptapptsID, phone, seStatus,rtnTrip, wheelChair,
            pickupDate')
            // ->where('DATE_FORMAT(pickupDate,"%Y-%m-%d") >=  DATE_FORMAT(NOW(),"%Y-%m-%d")')
            ->where('rider_id', $this->data->id)
            ->where('rtnTrip <> 1')
            ->orderBy('pickupDate')

            ->findAll();


        $data['member'] = $member;

         
        
        echo json_encode($data);

    }

    public function getAllcheckInMembers()
    {
        $MembersModel = new MembersModel();
        $MembercheckinsModel = new MembercheckinsModel();

        $data = $MembercheckinsModel
            ->select('membercheckins.id as apptsID, type as resourceId,
        CONCAT(TRIM(members.LastName),", ",TRIM(members.firstName)) as title,
        date  as start, 
        membercheckins.memberId, type,
        CASE
        when (members.avatar) = "" THEN "red"
        WHEN (type) = "K" THEN "#4caf50"
        ELSE "#4984dd"
     END AS color')

            ->where('date >=', $this->data->startStr)
            ->where('date <', $this->data->endStr)
            ->where('type', $this->data->type)
            ->join('members', 'members.id = membercheckins.memberId')
            ->orderBy('date')
            ->orderBy('title')
            ->findAll();

        echo json_encode($data);

    }
   
	
public function getAllMembers()
{
    $MembersModel = new MembersModel();
    if (isset($this->data->membertype) && $this->data->membertype > '') {
        $MembersModel->where('membertype', $this->data->membertype);
    }

    return json_encode($MembersModel
        ->select('CONCAT("/profileimgs/",members.id,"/barcode128.png") as barcode')
        ->select('members.id, membertype, legalSex, DL, phone')
        ->select("insurancetype") // <-- Add this line
        ->select("CASE WHEN notes > '' THEN 1 ELSE 0 END AS hasNotes")
        ->select('DATE_FORMAT(mbrshpStartDate,"%m/%d/%Y") as mbrshpStartDate,  DATE_FORMAT(mbrshpEndDate,"%m/%d/%Y") as mbrshpEndDate, ')
        ->select('emrID, membertypes.desc as memberTypeDesc, membertypes.icon as membTypeIcon,')
        ->select("CASE WHEN kalanichkin.date IS NULL THEN ''ELSE '1' END AS inKalani")
        ->select("CASE WHEN healthspringchkin.date IS NULL THEN ''ELSE '1' END AS inHS")
        ->select('membershiptypes.desc as memberTypeTypeDesc, membershiptypes.icon as membershiptypesIcon,')
        ->select('CASE WHEN mbrshpEndDate IS null or mbrshpEndDate < CURDATE() THEN 1 ELSE 0 END AS expired ')
        ->select('CASE WHEN nickName > "" THEN  CONCAT(TRIM(LastName),", ",TRIM(firstName)," (",nickName,")") ELSE CONCAT(TRIM(LastName),", ",TRIM(firstName) ) END AS fullName,')
        ->select('firstName, lastName,
            DATE_FORMAT(DOB,"%m/%d/%Y") as DOB, email,
            CONCAT(address,", ",city,", " ,state,zipCode ) as fullAddress,
            CASE
            WHEN avatar > "" THEN CONCAT("/profileimgs/",members.id,"/sm-",avatar)
            ELSE "/profileimgs/person.png"
            END AS avatar,')
        ->orderBy('fullName')
        ->join('membercheckins as kalanichkin', 'kalanichkin.type = "K" and members.id = kalanichkin.memberid and DATE_FORMAT(kalanichkin.date,"%Y-%m-%d") = DATE_FORMAT(now(),"%Y-%m-%d")', 'left')
        ->join('membercheckins as healthspringchkin', 'healthspringchkin.type = "H" and members.id = healthspringchkin.memberid and DATE_FORMAT(healthspringchkin.date,"%Y-%m-%d") = DATE_FORMAT(now(),"%Y-%m-%d")', 'left')
        ->join('membertypes', 'membertypes.type = members.membertype', 'left')
        ->join('membershiptypes', 'membershiptypes.type = members.membershiptype', 'left')
        ->findAll());
}
}
