Feature: Proxy endpoints

  Background:
    Given I remember as "businessId" following value:
    """
    "36bf8981-8827-4c0c-a645-02d9fc6d72c8"
    """
    Given I remember as "transactionId" following value:
    """
    "ad738281-f9f0-4db7-a4f6-670b0dff5327"
    """

  Scenario: Download contract
    Given I authenticate as a user with the following data:
    """
    {"email": "email@email.com","roles": [{"name": "oauth","permissions": [{"businessId": "{{businessId}}","acls": []}]}]}
    """
    And I mock an axios request with parameters:
    """
    {
      "request": {
        "method": "get",
        "url": "*/api/download-resource/business/{{businessId}}/integration/instant_payment/action/contract?paymentId={{transactionId}}&rawData=true",
        "headers": {
          "Accept": "application/json, text/plain, */*",
          "authorization": "*"
        }
      },
      "response": {
        "status": 200,
        "body": {
          "contentType": "application/pdf",
          "filenameWithExtension": "contract.pdf",
          "base64Content": "base64_contract_pdf"
        }
      }
    }
    """
    And I use DB fixture "transactions/third-party-payment"
    When I send a GET request to "/api/proxy/download-contract/{{transactionId}}"
    Then print last response
    Then the response status code should be 200
    And the response header "Content-Type" should have value "application/pdf"
    And the response header "Content-Disposition" should have value "attachment; filename=contract.pdf"
