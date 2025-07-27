<?php

namespace App\Controllers\Auth;

class Auth extends BaseController
{
    public function index()
    {
        $data["Authenticated"] = false;

        if ($this->session->username) {
            $data["Authenticated"] = true;
            $data['bootdata'] = $this->bootdata($this->session->username);

        }
        return json_encode($data);
    }

    public function login()
    {
        $session = config('Session');
        $sesUser = $this->session->username;

        $data["Authenticated"] = false;
        $user = $this->db->table('users')->where('username', $this->data->username)->get()->getRow();
        if ($user) {
            if (($user->password) == sha1($this->data->password)) {
                $data["Authenticated"] = true;
                $this->session->set('username', $user->username);

                $data['bootdata'] = $this->bootdata($user->username);
                $data['session'] = $session->cookieName . ':' . $this->session->session_id;

            }
        }

        return json_encode($data);
    }

    public function memberLogin()
    {
        $data["Authenticated"] = false;

        // Accept JSON or form data
        $input = $this->request->getJSON() ?? (object)$this->request->getPost();
        $lastName = isset($input->lastName) ? trim($input->lastName) : '';
        $phoneLast4 = isset($input->phoneLast4) ? trim($input->phoneLast4) : '';

        if ($lastName && $phoneLast4) {
            // Find member by last name (case-insensitive)
            $member = $this->db->table('members')
                ->where('LOWER(lastname)', strtolower($lastName))
                ->get()
                ->getRow();

            if ($member) {
                // Get last 4 digits of phone (remove non-digits)
                $digits = preg_replace('/\D/', '', $member->phone);
                $memberLast4 = substr($digits, -4);

                if ($memberLast4 === $phoneLast4) {
                    $data["Authenticated"] = true;
                    $data["member"] = $member;
                    // Optionally, set session info here if needed
                }
            }
        }

        return json_encode($data);
    }

    private function bootdata($username)
    {
        $session = config('Session');

        $data['user'] =
        $this->db->table('users')->where('username', $username)->get()->getRow();
        $data['membertypes'] = $this->db->table('membertypes')->orderBy('seq')->get()->getResult();
        $data['drivers'] = $this->db->table('users')->where('isDriver', true)->get()->getResult();
        $data['PTStaff'] = $this->db->table('users')->where('isPT', true)->get()->getResult();
        $data["RideStatus"] = $this->db->table("ridestatus")->get()->getResult();
        $data["ptStatus"] = $this->db->table("ptstatus")->get()->getResult();
        $data["ptReasons"] = $this->db->table("ptreasons")->get()->getResult();
        $data["lunchstatus"] = $this->db->table("lunchstatus")->get()->getResult();
        $data["membershiptypes"] = $this->db->table("membershiptypes")->orderBy('seq')->get()->getResult();
        $data["insurancetypes"] = $this->db->table("insurancetypes")->orderBy('seq')->get()->getResult();
        // $data["paymentmethodtypes"] = $this->db->table("paymentmethodtypes")->orderBy('type')->get()->getResult();
        // $data["pointearntypes"] = $this->db->table("pointearntypes")->orderBy('type')->get()->getResult();
        // $data["pointredeemtypes"] = $this->db->table("pointredeemtypes")->orderBy('type')->get()->getResult();

        $data["vehicles"] = $this->db->table("vehicles")->get()->getResult();

        $data["tripreasons"] = $this->db->table("tripreasons")->orderBy('reason')->get()->getResult();
        $data["pointMethods"] = $this->db->table("point_methods")->orderBy('tran_type, seq')->get()->getResult();
        $data['session'] = $this->session->session_id;
        $this->db->table('ci_sessions')
        ->set('username', $username)
        ->set('loginTime','now()',false)                    
        ->where('id', $session->cookieName . ':' . $this->session->session_id)
        ->update();
        return $data;
            }
}