Feature: Handling business events

  Background:
    Given I remember as "businessId" following value:
      """
        "42bf8f24-d383-4e5a-ba18-e17d2e03bb0e"
      """
    And I mock an axios request with parameters:
      """
      {
        "request": {
          "method": "get",
          "url": "http://image1.url"
        },
        "response": {
          "status": 200,
          "body": "Image1 content"
        }
      }
      """
    And I mock an axios request with parameters:
      """
      {
        "request": {
          "method": "post",
          "url": "http://media-micro.url/api/image/business/{{businessId}}/products"
        },
        "response": {
          "status": 200,
          "body": "{\"blobName\": \"uploadedImage\"}"
        }
      }
      """
    And I mock Elasticsearch method "singleIndex" with:
      """
      {
        "arguments": [
          "transactions",
          "transaction",
          {
            "action_running": false,
            "santander_applications": []
          }
         ],
        "result": {}
      }
      """

  Scenario: Create business and check sample transactions
    Given I use DB fixture "business-sample-transactions"
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
      """
      {
        "name":"users.event.business.created",
        "uuid":"7ee31df2-e6eb-4467-8e8d-522988f426b8",
        "version":0,
        "encryption":"none",
        "createdAt":"2019-08-28T12:32:26+00:00",
        "metadata":{
          "locale":"de",
          "client_ip":"176.198.69.86"
        },
        "payload":{
          "_id":"42bf8f24-d383-4e5a-ba18-e17d2e03bb0e",
          "name":"example business",
          "currency":"EUR",
          "companyAddress": {
            "country": "DE"
          },
          "companyDetails": {
            "product": "BUSINESS_PRODUCT_RETAIL_B2C",
            "industry": "BRANCHE_FASHION"
          },
          "contactEmails": [
            "test@test.com"
          ]
        }
      }
      """
    And I process messages from RabbitMQ "async_events_transactions_micro" channel
    Then model "Business" with id "42bf8f24-d383-4e5a-ba18-e17d2e03bb0e" should contain json:
      """
      {
        "currency":"EUR"
      }
      """
    Then I look for model "Transaction" by following JSON and remember as "transactions1":
    """
      {
        "business_uuid": "42bf8f24-d383-4e5a-ba18-e17d2e03bb0e",
        "customer_name": "Customer 1"
      }
    """
    And stored value "transactions1" should contain json:
    """
      {
        "amount": 800,
        "customer_name": "Customer 1",
        "items": [
          {
            "name": "Product 2"
          },
          {
            "name": "Product 3"
          },
          {
            "name": "Product 4"
          }
        ]
      }
    """
    Then I look for model "Transaction" by following JSON and remember as "transactions2":
    """
      {
        "business_uuid": "42bf8f24-d383-4e5a-ba18-e17d2e03bb0e",
        "customer_name": "Customer 2"
      }
    """
    And stored value "transactions2" should contain json:
    """
      {
        "amount": 800,
        "customer_name": "Customer 2",
        "items": [
          {
            "name": "Product 2"
          },
          {
            "name": "Product 3"
          },
          {
            "name": "Product 4"
          }
        ]
      }
    """    
