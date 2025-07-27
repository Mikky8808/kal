<?php

namespace App\Controllers\Api;

use Twilio\Rest\Client;

class SmsSend extends BaseController
{
    private $authToken = 'a0f31093cd7166149ac338a54b8bb6f7';
    private $accountSid = 'ACddc85b203d477a94559e46cc0bbfc3d3';
    private $twilioNumber = '+17147599685';
    
    
    public function quickSend()
    {
        $this->data->phone = preg_replace('/\D/u', '', $this->data->phone);
        $this->data->authToken = $this->authToken;
        $this->data->accountSid = $this->accountSid;
        $client = new Client($this->accountSid, $this->authToken);
        try {
            $message = $client->messages->create(
                '+1' . $this->data->phone,
                array(
                    'from' => $this->twilioNumber,
                    'body' => $this->data->message,
                )
            );
            $this->data->message = $message->sid;

        } catch (\Twilio\Exceptions\RestException $e) {
            $this->data->error = $e->getMessage();
            $this->data->errorcode = $e->getCode();
        }

        echo json_encode($this->data);

    }
}
