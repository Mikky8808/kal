<?php
namespace App\Controllers\Krides;

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

use CodeIgniter\Controller;

class BaseController extends Controller
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
        $this->resquest = service('request');
        if (!$this->request->isAJAX()) {
            header("HTTP/1.1 401 Unauthorized");
            echo 'Unauthorized';
            exit;
        }
        $this->session = \Config\Services::session();
        // if (!($this->session->Driver_id > 0)) {
        //     header("HTTP/1.1 401 Unauthorized");
        //     exit;
        // }
        $this->db = \Config\Database::connect();

        date_default_timezone_set('America/Los_Angeles');

    }

}
