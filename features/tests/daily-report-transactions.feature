Feature: Response Daily Report Transactions
  Scenario: Response Daily Report Transactions
    Given I use DB fixture "transactions/transactions-list-with-different-currencies"
    When I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
      """
      {
        "name": "mailer-report.event.daily-report-data.requested",
        "payload": {
          "beginDate": "2020-03-22T11:49:00.008Z"
        }
      }
      """
    Then I process messages from RabbitMQ "async_events_transactions_micro" channel
    And print RabbitMQ message list
    Then RabbitMQ exchange "async_events" should contain following ordered messages:
      """
      [
        {
          "name": "mailer-report.event.daily-report-data.sent",
          "payload": {
          }
        }
      ]
      """
