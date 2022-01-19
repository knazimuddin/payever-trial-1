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
          {
            "action_running": false,
            "santander_applications": []
          }
         ],
        "result": {}
      }
      """

  Scenario: Create business
    Given I mock Elasticsearch method "bulkIndex" with:
      """
      {
        "arguments": [
          "folder_transactions",
          []
        ]
      }
      """
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

  Scenario: Create sample products
    Given I use DB fixture "business-sample-transactions"
    And I mock Elasticsearch method "search" with:
      """
      {
        "arguments": [
          "folder_transactions"
        ]
      }
      """
    And I mock Elasticsearch method "singleIndex" with:
      """
      {
        "arguments": [
          "folder_transactions"
         ]
      }
      """
    Given I publish in RabbitMQ channel "async_events_transactions_micro" message with json:
      """
      {
        "name":"products.event.sampleproduct.created",
        "uuid":"7ee31df2-e6eb-4467-8e8d-522988f426b8",
        "version":0,
        "encryption":"none",
        "createdAt":"2019-08-28T12:32:26+00:00",
        "metadata":{
          "locale":"de",
          "client_ip":"176.198.69.86"
        },
        "payload":{
          "business": {
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
          },
          "products": [{
            "apps": [],
            "active": true,
            "collections": [],
            "imagesUrl": [],
            "images": [],
            "variants": [],
            "example": true,
            "onSales": false,
            "isLocked": false,
            "barcode": "123423",
            "businessUuid": "42bf8f24-d383-4e5a-ba18-e17d2e03bb0e",
            "categories": [],
            "category": null,
            "currency": "EUR",
            "description": "Description",
            "price": 100,
            "salePrice": null,
            "shipping": {
              "measure_mass": "kg",
              "measure_size": "cm",
              "weight": 324,
              "width": 32,
              "length": 32,
              "height": 23
            },
            "sku": "SKU-123",
            "title": "Title",
            "type": "physical",
            "vatRate": 19,
            "options": [],
            "channelSets": [],
            "createdAt": "2020-06-08T07:54:09.792Z",
            "updatedAt": "2020-06-08T07:54:09.797Z",
            "uuid": "ee1855e5-b843-47a8-abf9-0e5b37928071",
            "hidden": true,
            "enabled": true,
            "id": "ee1855e5-b843-47a8-abf9-0e5b37928071"
          }]
        }
      }
      """
    And I process messages from RabbitMQ "async_events_transactions_micro" channel
    Then I look for model "Transaction" by following JSON and remember as "transactions1":
    """
      {
        "business_uuid": "42bf8f24-d383-4e5a-ba18-e17d2e03bb0e"
      }
    """
    And stored value "transactions1" should contain json:
    """
      {
        "amount": 100,
        "items": [
          {
            "name": "Title"
          }
        ]
      }
    """
