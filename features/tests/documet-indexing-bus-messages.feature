@document-indexing
Feature: Document indexing
  Background:
    Given I remember as "ruleId" following value:
      """
      "6325778c-375c-4c90-bedb-52c8e5490206"
      """

  Scenario: Assign documents ro rule
    Given I use DB fixture "rules/rules"
    When I publish in RabbitMQ channel "async_events_transactions_folders_micro" message with json:
    """
    {
      "name": "rules.event.assign-documents-to-rule",
      "payload": {
        "ruleId": "{{ruleId}}"
      }
    }
    """
    And process messages from RabbitMQ "async_events_transactions_folders_micro" channel
    Then print RabbitMQ exchange "transactions_folders" message list
    And the RabbitMQ exchange "transactions_folders" should contain following messages:
    """
    [
      { "someMessage": "res"}
    ]
    """
