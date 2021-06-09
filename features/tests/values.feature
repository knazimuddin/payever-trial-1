@values
Feature: Values
  Scenario: Fetching values
    When I send a GET request to "/api/values"
    Then print last response
    And the response status code should be 200
    And the response should contain json:
    """
    {
      "filters": [
        {
          "fieldName": "original_id",
          "filterConditions": [
            "is",
            "isNot",
            "startsWith",
            "endsWith",
            "contains",
            "doesNotContain"
          ],
          "label": "filters.original_id",
          "type": "string"
        },
        {
          "fieldName": "reference",
          "filterConditions": [
            "is",
            "isNot",
            "startsWith",
            "endsWith",
            "contains",
            "doesNotContain"
          ],
          "label": "filters.reference",
          "type": "string"
        },
        {
          "fieldName": "date",
          "filterConditions": [
            "isDate",
            "isNotDate",
            "afterDate",
            "beforeDate",
            "betweenDates"
          ],
          "label": "filters.date",
          "type": "date"
        },
        {
          "fieldName": "type",
          "filterConditions": [
            "is",
            "isNot"
          ],
          "label": "filters.payment_option",
          "options": [
            {
              "label": "filters.payment_option.instantPayment",
              "value": "instant_payment"
            },
            {
              "label": "filters.payment_option.paypal",
              "value": "paypal"
            },
            {
              "label": "filters.payment_option.sofort",
              "value": "sofort"
            },
            {
              "label": "filters.payment_option.stripeCreditCard",
              "value": "stripe"
            },
            {
              "label": "filters.payment_option.stripeDirectDebit",
              "value": "stripe_directdebit"
            },
            {
              "label": "filters.payment_option.santanderNLInstallment",
              "value": "santander_installment_nl"
            },
            {
              "label": "filters.payment_option.santanderATInstallment",
              "value": "santander_installment_at"
            },
            {
              "label": "filters.payment_option.swedbankCreditCard",
              "value": "swedbank_creditcard"
            },
            {
              "label": "filters.payment_option.swedbankInvoice",
              "value": "swedbank_invoice"
            },
            {
              "label": "filters.payment_option.santanderDEInvoice",
              "value": "santander_invoice_de"
            },
            {
              "label": "filters.payment_option.santanderDEPosInvoice",
              "value": "santander_pos_invoice_de"
            },
            {
              "label": "filters.payment_option.santanderDEFactoring",
              "value": "santander_factoring_de"
            },
            {
              "label": "filters.payment_option.santanderDEPosFactoring",
              "value": "santander_pos_factoring_de"
            },
            {
              "label": "filters.payment_option.wiretransfer",
              "value": "cash"
            },
            {
              "label": "filters.payment_option.santanderDKInstallment",
              "value": "santander_installment_dk"
            },
            {
              "label": "filters.payment_option.santanderNOInstallment",
              "value": "santander_installment_no"
            },
            {
              "label": "filters.payment_option.applePay",
              "value": "apple_pay"
            },
            {
              "label": "filters.payment_option.santanderNOInvoice",
              "value": "santander_invoice_no"
            },
            {
              "label": "filters.payment_option.googlePay",
              "value": "google_pay"
            },
            {
              "label": "filters.payment_option.santanderSeInstallment",
              "value": "santander_installment_se"
            },
            {
              "label": "filters.payment_option.santanderPosSeInstallment",
              "value": "santander_pos_installment_se"
            },
            {
              "label": "filters.payment_option.payExCreditCard",
              "value": "payex_creditcard"
            }
          ],
          "type": "option"
        },
        {
          "fieldName": "status",
          "filterConditions": [
            "is",
            "isNot"
          ],
          "label": "filters.status",
          "options": [
            {
              "label": "filters.status.New",
              "value": "STATUS_NEW"
            },
            {
              "label": "filters.status.InProcess",
              "value": "STATUS_IN_PROCESS"
            },
            {
              "label": "filters.status.Accepted",
              "value": "STATUS_ACCEPTED"
            },
            {
              "label": "filters.status.Paid",
              "value": "STATUS_PAID"
            },
            {
              "label": "filters.status.Declined",
              "value": "STATUS_DECLINED"
            },
            {
              "label": "filters.status.Refunded",
              "value": "STATUS_REFUNDED"
            },
            {
              "label": "filters.status.Failed",
              "value": "STATUS_FAILED"
            },
            {
              "label": "filters.status.Cancelled",
              "value": "STATUS_CANCELLED"
            }
          ],
          "type": "option"
        },
        {
          "fieldName": "specific_status",
          "filterConditions": [
            "is",
            "isNot"
          ],
          "label": "filters.specific_status",
          "options": [
            {
              "label": "filters.specific_status.new",
              "value": "STATUS_NEW"
            },
            {
              "label": "filters.specific_status.inProcess",
              "value": "STATUS_IN_PROCESS"
            },
            {
              "label": "filters.specific_status.accepted",
              "value": "STATUS_ACCEPTED"
            },
            {
              "label": "filters.specific_status.paid",
              "value": "STATUS_PAID"
            },
            {
              "label": "filters.specific_status.declined",
              "value": "STATUS_DECLINED"
            },
            {
              "label": "filters.specific_status.refunded",
              "value": "STATUS_REFUNDED"
            },
            {
              "label": "filters.specific_status.failed",
              "value": "STATUS_FAILED"
            },
            {
              "label": "filters.specific_status.canceled",
              "value": "STATUS_CANCELLED"
            },
            {
              "label": "filters.specific_status.invoiceCancellation",
              "value": "STATUS_INVOICE_CANCELLATION"
            },
            {
              "label": "filters.specific_status.invoiceIncollection",
              "value": "STATUS_INVOICE_INCOLLECTION"
            },
            {
              "label": "filters.specific_status.invoiceLatepayment",
              "value": "STATUS_INVOICE_LATEPAYMENT"
            },
            {
              "label": "filters.specific_status.invoiceReminder",
              "value": "STATUS_INVOICE_REMINDER"
            },
            {
              "label": "filters.specific_status.santanderInProgress",
              "value": "STATUS_SANTANDER_IN_PROGRESS"
            },
            {
              "label": "filters.specific_status.santanderInProcess",
              "value": "STATUS_SANTANDER_IN_PROCESS"
            },
            {
              "label": "filters.specific_status.santanderDeclined",
              "value": "STATUS_SANTANDER_DECLINED"
            },
            {
              "label": "filters.specific_status.santanderApproved",
              "value": "STATUS_SANTANDER_APPROVED"
            },
            {
              "label": "filters.specific_status.santanderApprovedWithRequirements",
              "value": "STATUS_SANTANDER_APPROVED_WITH_REQUIREMENTS"
            },
            {
              "label": "filters.specific_status.santanderDeferred",
              "value": "STATUS_SANTANDER_DEFERRED"
            },
            {
              "label": "filters.specific_status.santanderCanceled",
              "value": "STATUS_SANTANDER_CANCELLED"
            },
            {
              "label": "filters.specific_status.santanderAutomaticDecline",
              "value": "STATUS_SANTANDER_AUTOMATIC_DECLINE declined"
            },
            {
              "label": "filters.specific_status.santanderInDecision",
              "value": "STATUS_SANTANDER_IN_DECISION"
            },
            {
              "label": "filters.specific_status.santanderDecisionNextWorkingDay",
              "value": "STATUS_SANTANDER_DECISION_NEXT_WORKING_DAY"
            },
            {
              "label": "filters.specific_status.santanderInCancellation",
              "value": "STATUS_SANTANDER_IN_CANCELLATION"
            },
            {
              "label": "filters.specific_status.santanderAccountOpened",
              "value": "STATUS_SANTANDER_ACCOUNT_OPENED"
            },
            {
              "label": "filters.specific_status.santanderCanceledAnother",
              "value": "STATUS_SANTANDER_CANCELLED_ANOTHER"
            },
            {
              "label": "filters.specific_status.santanderShopTemporaryApproved",
              "value": "STATUS_SANTANDER_SHOP_TEMPORARY_APPROVED"
            }
          ],
          "type": "option"
        },
        {
          "fieldName": "channel",
          "filterConditions": [
            "is",
            "isNot"
          ],
          "label": "filters.channel",
          "options": [
            {
              "label": "filters.channel_type.shopify",
              "value": "shopify"
            },
            {
              "label": "filters.channel_type.facebook",
              "value": "facebook"
            },
            {
              "label": "filters.channel_type.financeExpress",
              "value": "finance_express"
            },
            {
              "label": "filters.channel_type.shop",
              "value": "shop"
            },
            {
              "label": "filters.channel_type.wooCommerce",
              "value": "woo_commerce"
            },
            {
              "label": "filters.channel_type.magento",
              "value": "magento"
            },
            {
              "label": "filters.channel_type.marketing",
              "value": "marketing"
            },
            {
              "label": "filters.channel_type.pos",
              "value": "pos"
            },
            {
              "label": "filters.channel_type.shopware",
              "value": "shopware"
            },
            {
              "label": "filters.channel_type.debitoor",
              "value": "debitoor"
            },
            {
              "label": "filters.channel_type.link",
              "value": "link"
            },
            {
              "label": "filters.channel_type.eConomic",
              "value": "e-conomic"
            },
            {
              "label": "filters.channel_type.jtl",
              "value": "jtl"
            },
            {
              "label": "filters.channel_type.oxid",
              "value": "oxid"
            },
            {
              "label": "filters.channel_type.weebly",
              "value": "weebly"
            },
            {
              "label": "filters.channel_type.plentyMarkets",
              "value": "plentymarkets"
            },
            {
              "label": "filters.channel_type.advertising",
              "value": "advertising"
            },
            {
              "label": "filters.channel_type.offer",
              "value": "offer"
            },
            {
              "label": "filters.channel_type.danDomain",
              "value": "dandomain"
            },
            {
              "label": "filters.channel_type.prestaShop",
              "value": "presta"
            },
            {
              "label": "filters.channel_type.xtCommerce",
              "value": "xt_commerce"
            },
            {
              "label": "filters.channel_type.overlay",
              "value": "overlay"
            },
            {
              "label": "filters.channel_type.whatsapp",
              "value": "whatsapp"
            },
            {
              "label": "filters.channel_type.telegram",
              "value": "telegram"
            },
            {
              "label": "filters.channel_type.facebookMessenger",
              "value": "facebook_messenger"
            },
            {
              "label": "filters.channel_type.commercetools",
              "value": "commercetools"
            },
            {
              "label": "filters.channel_type.ebay",
              "value": "ebay"
            },
            {
              "label": "filters.channel_type.mobilede",
              "value": "mobilede"
            },
            {
              "label": "filters.channel_type.amazon",
              "value": "amazon"
            },
            {
              "label": "filters.channel_type.autoscout24",
              "value": "autoscout24"
            },
            {
              "label": "filters.channel_type.googleShopping",
              "value": "google_shopping"
            },
            {
              "label": "filters.channel_type.instagram",
              "value": "instagram"
            }
          ],
          "type": "option"
        },
        {
          "fieldName": "amount",
          "filterConditions": [
            "is",
            "isNot",
            "greaterThan",
            "lessThan",
            "between"
          ],
          "label": "filters.amount",
          "type": "number"
        },
        {
          "fieldName": "total",
          "filterConditions": [
            "is",
            "isNot",
            "greaterThan",
            "lessThan",
            "between"
          ],
          "label": "filters.total",
          "type": "number"
        },
        {
          "fieldName": "currency",
          "filterConditions": [
            "is",
            "isNot"
          ],
          "label": "filters.currency",
          "type": "option",
          "options": []
        },
        {
          "fieldName": "customer_name",
          "filterConditions": [
            "is",
            "isNot",
            "startsWith",
            "endsWith",
            "contains",
            "doesNotContain"
          ],
          "label": "filters.customer_name",
          "type": "string"
        },
        {
          "fieldName": "customer_email",
          "filterConditions": [
            "is",
            "isNot",
            "startsWith",
            "endsWith",
            "contains",
            "doesNotContain"
          ],
          "label": "filters.customer_email",
          "type": "string"
        },
        {
          "fieldName": "merchant_name",
          "filterConditions": [
            "is",
            "isNot",
            "startsWith",
            "endsWith",
            "contains",
            "doesNotContain"
          ],
          "label": "filters.merchant_name",
          "type": "string"
        },
        {
          "fieldName": "merchant_email",
          "filterConditions": [
            "is",
            "isNot",
            "startsWith",
            "endsWith",
            "contains",
            "doesNotContain"
          ],
          "label": "filters.merchant_email",
          "type": "string"
        },
        {
          "fieldName": "seller_name",
          "filterConditions": [
            "is",
            "isNot",
            "startsWith",
            "endsWith",
            "contains",
            "doesNotContain"
          ],
          "label": "filters.seller_name",
          "type": "string"
        },
        {
          "fieldName": "seller_email",
          "filterConditions": [
            "is",
            "isNot",
            "startsWith",
            "endsWith",
            "contains",
            "doesNotContain"
          ],
          "label": "filters.seller_email",
          "type": "string"
        }
      ]
    }
    """
