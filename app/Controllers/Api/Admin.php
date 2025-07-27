<?php

namespace App\Controllers\Api;

use App\Models\VehiclesodometerModel;
use App\Models\UsersModel;

class Admin extends BaseController
{
    public function getci_sessions()
    {
        if (isset($this->data->deleteSession) && $this->data->deleteSession) {
            $this->db->table('ci_sessions')
            ->where('id',$this->data->deleteSession)
            ->delete();
        }
        $session = config('Session');
        $data['currsession']= $session->cookieName . ':' . $this->session->session_id;
        $data['data'] = $this->db->table('ci_sessions')
        ->select ('* , now() as now, TIME_FORMAT(TIMEDIFF(now(), timestamp), "%H:%i:%s") as idleTime')
        ->orderBy('loginTime')
        ->get()->getResult();

        return json_encode($data);
    }
    public function getUserList()
    {

        $model = new UsersModel();
        $data = $model
        ->orderBy('username')
        ->findAll();

        return json_encode($data);
    }
    public function UpdateUser()
    {

        $model = new UsersModel();
         $model->save($this->data);
         

        return $this->getUserList();
    }

public function deleteUser()
{
    $model = new UsersModel();
    $username = $this->request->getPost('username'); // or use getJSON() if sending JSON

    if ($username) {
        $model->where('username', $username)->delete();
    }

    return $this->getUserList();
}


}

