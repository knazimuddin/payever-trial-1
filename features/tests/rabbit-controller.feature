#TODO: Failing because elasticsearch client is not mocked
#Feature: Rabbit Controller
#  Scenario: Payment Code updated event received
#    Given I remember as "exampleId" following value:
#    """
#    "bf62b5a8-9687-4f62-acd0-398722a81d9c"
#    """

#    When I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
#    """
#    {
#      "name": "device_payments.code.updated",
#      "payload": {
#        "example": {
#          "_id": "{{exampleId}}",
#          "code": 123456,
#          "business_id": "3e92b893-63ec-4c9d-985d-5aeb13e2eec6",
#          "terminal_id": "eba238ef-9e99-40d1-b2b2-bc71ed6c8fb6",
#          channel_set_id: "d35b2db7-a905-4d7a-9ab3-2826f0276a28",
#          checkout_id: "210ea89a-88d4-4da1-a266-399a8b2b06a9",
#          amount: 500,
#          payment_flow_id: "4740ebaefff59d742f69c073de22b7cd",
#          payment_method: "santander_installment",
#          payment_id: "83299edb74b3e665b58e021078fb63de",
#          payment_uuid: "ed023c58-9836-4635-ab01-b4e128794762",
#          status: "STATUS_PAID",
#          invoice_id?: "invoice_id",
#          created_at: "Thu Jan 26 2017 11:00:00 GMT+1100",
#        }
#      }
#    }
#    """
#    Then I process messages from RabbitMQ "async_events_example_micro" channel
#    And model "Example" with id "{{exampleId}}" should contain json:
#    """
#    {
#      "_id": "{{exampleId}}",
#      "number": 1000,
#      "name": "example #1",
#      "enabled": true
#    }
#    """
