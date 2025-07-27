<?php
namespace App\Controllers\Krides;

use \App\Libraries\Oauth;
use CodeIgniter\Controller;
use \OAuth2\Request;

/**
 * Class BaseController
 *
 * BaseController provides a convenient place for loading components
 * and performing functions that are needed by all your controllers.
 * Extend this class in any new controllers:
 *     class Home extends BaseController
 *
 * For security be sure to declare any new methods as protected or private.
 *
 * @package CodeIgniter
 */

class Auth extends Controller
{

    /**
     * An array of helpers to be loaded automatically upon
     * class instantiation. These helpers will be available
     * to all other controllers that extend BaseController.
     *
     * @var array
     */
    protected $helpers = [];

    /**
     * Constructor.
     */
    public function initController(\CodeIgniter\HTTP\RequestInterface$request, \CodeIgniter\HTTP\ResponseInterface$response, \Psr\Log\LoggerInterface$logger)
    {
        // Do Not Edit This Line
        parent::initController($request, $response, $logger);

        //--------------------------------------------------------------------
        // Preload any models, libraries, etc, here.
        //--------------------------------------------------------------------
        // E.g.:

        if (!$this->request->isAJAX()) {
            header("HTTP/1.1 401 Unauthorized");
            echo 'Unauthorized';
            exit;
        }

        $this->db = \Config\Database::connect();
        $this->session = \Config\Services::session();
        date_default_timezone_set('America/Los_Angeles');

    }
    private function bootData($username)
    {

        $data["RideStatus"] = $this->db->table("ridestatus")->get()->getResult();
        $data["Riders"] = $this->db->table("riders_view")->get()->getResult();
        $data["user"] = $this->db->table("oauth_users_view")
            ->where('username', $username)->get()->getRow();
        $data["users"] = $this->db->table("oauth_users_view")->select('username')->get()->getResult();
            

        return $data;

    }
    public function logout()
    {
        $data = $this->request->getJSON();
        $this->db->table('oauth_access_tokens')
            ->delete(["access_token" => $data->token]);
        $this->session->destroy();
    }
    public function ridesboot()
    {

        $data["Authenticated"] = false;

        $oauth = new Oauth();
        $request = Request::createFromGlobals();

        if ($this->session->username > '' && $oauth->server->verifyResourceRequest($request)) {
            $data["Authenticated"] = true;
            $data["bootdata"] = $this->bootData($this->session->username);
        }

        echo json_encode($data);

    }
    public function driverlogin()
    {
        $login = $this->request->getJSON();

        $oauth = new Oauth();
        $request = new Request();
        $resp["Authenticated"] = false;

        $respond = $oauth->server->handleTokenRequest($request->createFromGlobals());
        if ($respond->getStatusCode() == 200) {
            $resp["Authenticated"] = true;
            $this->session->set('username', $login->username);
            $resp["bootdata"] = $this->bootData($this->session->username);

        }
        $body = $respond->getResponseBody();
        $resp["auth"] = json_decode($respond->getResponseBody());

        return json_encode($resp);

    }
}