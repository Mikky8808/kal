<?php

namespace Config;

// Create a new instance of our RouteCollection class.
$routes = Services::routes();

/*
 * --------------------------------------------------------------------
 * Router Setup
 * --------------------------------------------------------------------
 */
$routes->setDefaultNamespace('App\Controllers');
$routes->setDefaultController('Home');
$routes->setDefaultMethod('index');
$routes->setTranslateURIDashes(false);
$routes->set404Override();
// The Auto Routing (Legacy) is very dangerous. It is easy to create vulnerable apps
// where controller filters or CSRF protection are bypassed.
// If you don't want to define all routes, please use the Auto Routing (Improved).
// Set `$autoRoutesImproved` to true in `app/Config/Feature.php` and set the following to true.
// $routes->setAutoRoute(false);

/*
 * --------------------------------------------------------------------
 * Route Definitions
 * --------------------------------------------------------------------
 */

// We get a performance increase by specifying the default
// route since we don't have to scan directories.
$routes->get('/', 'Home::index');
$routes->get('api/auth', '\App\Controllers\Auth\Auth::index');
$routes->post('api/auth/login', '\App\Controllers\Auth\Auth::login');

//Members
$routes->post('api/members/getAllMembers', '\App\Controllers\Api\Members::getAllMembers');
$routes->post('api/members/getMember', '\App\Controllers\Api\Members::getMember');
$routes->post('api/members/getMemberQV', '\App\Controllers\Api\Members::getMemberQV');

$routes->post('/api/members/checkInMember', '\App\Controllers\Api\Members::checkInMember');
$routes->post('/api/members/deleteCheckInMember', '\App\Controllers\Api\Members::deleteCheckInMember');
$routes->post('/api/members/getAllcheckInMembers', '\App\Controllers\Api\Members::getAllcheckInMembers');
$routes->post('api/members/saveMember', '\App\Controllers\Api\Members::saveMember');
$routes->post('api/members/uploadMemberPic', '\App\Controllers\Api\Members::uploadMemberPic');

//Points
$routes->post('/api/points/getAllPointTrans', '\App\Controllers\Api\PointsTransactions::getAllPointTrans');
$routes->post('/api/points/Save', '\App\Controllers\Api\PointsTransactions::Save');
$routes->post('/api/points/Delete', '\App\Controllers\Api\PointsTransactions::Delete');

//vehicles
$routes->post('/api/Vehicles/Save', '\App\Controllers\Api\Vehicles::Save');
$routes->post('/api/Vehicles/getLastVehodometer', '\App\Controllers\Api\Vehicles::getLast');
$routes->post('/api/Vehicles/getVehodometer', '\App\Controllers\Api\Vehicles::getVehodometer');

//Admin
$routes->post('/api/admin/getci_sessions', '\App\Controllers\Api\Admin::getci_sessions');
$routes->post('/api/admin/getUserList', '\App\Controllers\Api\Admin::getUserList');


// //renewals
// $routes->post('/api/renewal/getAllMemberRenwals', '\App\Controllers\Api\Membershiprenewals::getAllMemberRenwals');
// $routes->post('/api/renewal/saveMemberRenwals', '\App\Controllers\Api\Membershiprenewals::saveMemberRenwals');
// $routes->post('/api/renewal/delete', '\App\Controllers\Api\Membershiprenewals::Delete');

// //Purchases
// $routes->post('/api/purchases/getAllMemberpurchases', '\App\Controllers\Api\Membepointpurchases::getAllMemberpurchases');
// $routes->post('/api/purchases/saveMemberPurchases', '\App\Controllers\Api\Membepointpurchases::saveMemberPurchases');
// $routes->post('/api/purchases/delete', '\App\Controllers\Api\Membepointpurchases::Delete');

// //Earned
// $routes->post('/api/earn/getAllMemberEarned', '\App\Controllers\Api\Membepointearned::getAllMemberEarned');
// $routes->post('/api/earn/save', '\App\Controllers\Api\Membepointearned::Save');
// $routes->post('/api/earn/delete', '\App\Controllers\Api\Membepointearned::Delete');

// //Redeem
// $routes->post('/api/Redeem/getAllMemberRedeemed', '\App\Controllers\Api\Memberpointredeems::getAllMemberRedeem');
// $routes->post('/api/Redeem/save', '\App\Controllers\Api\Memberpointredeems::Save');
// $routes->post('/api/Redeem/delete', '\App\Controllers\Api\Memberpointredeems::Delete');



//Rides
$routes->post('/api/rides/getDayTrips', '\App\Controllers\Api\Rides::getDayTrips');
$routes->post('/api/rides/assignDriver', '\App\Controllers\Api\Rides::assignDriver');
$routes->post('/api/rides/getAllRidesCal', '\App\Controllers\Api\Rides::getAllRidesCal');
$routes->post('/api/rides/createRideAppt', '\App\Controllers\Api\Rides::createRideAppt');
$routes->post('/api/rides/getTrip', '\App\Controllers\Api\Rides::getTrip');
$routes->post('/api/rides/updateRideAppt', '\App\Controllers\Api\Rides::updateRideAppt');


// PT
$routes->post('/api/Ptappts/getPTAppt', '\App\Controllers\Api\PtAppointment::getPTAppt');
$routes->post('/api/Ptappts/getMemberApptForPrint', '\App\Controllers\Api\PtAppointment::getMemberApptForPrint');
$routes->post('/api/Ptappts/updatePTAppt', '\App\Controllers\Api\PtAppointment::updatePTAppt');
$routes->post('/api/Ptappts/createPTAppt', '\App\Controllers\Api\PtAppointment::createPTAppt');
$routes->post('/api/Ptappts/getAllPTAppt', '\App\Controllers\Api\PtAppointment::getAllPTAppt');
$routes->post('/api/Ptappts/updatePTApptStatus', '\App\Controllers\Api\PtAppointment::updatePTApptStatus');
$routes->post('/api/Ptappts/deletePTAppt', '\App\Controllers\Api\PtAppointment::deletePTAppt');

// Accupuncture/Massage
$routes->post('/api/AccuMassage/getPTAppt', '\App\Controllers\Api\Accumassageappts::getPTAppt');
$routes->post('/api/AccuMassage/getAllPTAppt', '\App\Controllers\Api\Accumassageappts::getAllPTAppt');
$routes->post('/api/AccuMassage/saveAppt', '\App\Controllers\Api\Accumassageappts::saveAppt');
$routes->post('/api/AccuMassage/DeleteAppt', '\App\Controllers\Api\Accumassageappts::DeleteAppt');

// LUNCH
$routes->post('/api/lunch/getAll', '\App\Controllers\Api\LunchReservation::getAll');
$routes->post('/api/lunch/Insert', '\App\Controllers\Api\LunchReservation::Insert');
$routes->post('/api/lunch/Save', '\App\Controllers\Api\LunchReservation::Save');
$routes->post('/api/lunch/Get', '\App\Controllers\Api\LunchReservation::Get');
$routes->post('/api/lunch/Delete', '\App\Controllers\Api\LunchReservation::Delete');
$routes->post('/api/lunch/createLunchTypes', '\App\Controllers\Api\LunchReservation::createLunchTypes');

// SMS 
$routes->post('/api/sms/quickSend', '\App\Controllers\Api\SmsSend::quickSend');


$routes->get('api/logoff', static function () {
    $data = 'loggedoff';
    $session = \Config\Services::session();
    $session->destroy();
    header("HTTP/1.1 401 Unauthorized"); 
    exit;
    return json_encode($data);});

// $routes->get('/test/hello', 'Test::hello');
$routes->get('/(:any)', 'Home::index');



/*
 * --------------------------------------------------------------------
 * Additional Routing
 * --------------------------------------------------------------------
 *
 * There will often be times that you need additional routing and you
 * need it to be able to override any defaults in this file. Environment
 * based routes is one such time. require() additional route files here
 * to make that happen.
 *
 * You will have access to the $routes object within that file without
 * needing to reload it.
 */
if (is_file(APPPATH . 'Config/' . ENVIRONMENT . '/Routes.php')) {
    require APPPATH . 'Config/' . ENVIRONMENT . '/Routes.php';
}
