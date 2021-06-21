@values
Feature: Values
  Scenario: Fetching values
    When I send a GET request to "/api/values"
    Then print last response
    And the response status code should be 200
    And the response should contain json:
    """
    {
      "channels": [
        {
          "icon": "#channel-shopify",
          "label": "translation.channel_type.shopify",
          "name": "shopify"
        },
        {
          "icon": "#channel-facebook",
          "label": "translation.channel_type.facebook",
          "name": "facebook"
        },
        {
          "icon": "#channel-finance_express",
          "label": "translation.channel_type.financeExpress",
          "name": "finance_express"
        },
        {
          "icon": "#channel-shop",
          "label": "translation.channel_type.shop",
          "name": "shop"
        },
        {
          "icon": "#channel-woo_commerce",
          "label": "translation.channel_type.wooCommerce",
          "name": "woo_commerce"
        },
        {
          "icon": "#channel-magento",
          "label": "translation.channel_type.magento",
          "name": "magento"
        },
        {
          "icon": "#channel-marketing",
          "label": "translation.channel_type.marketing",
          "name": "marketing"
        },
        {
          "icon": "#channel-pos",
          "label": "translation.channel_type.pos",
          "name": "pos"
        },
        {
          "icon": "#channel-shopware",
          "label": "translation.channel_type.shopware",
          "name": "shopware"
        },
        {
          "icon": "#channel-debitoor",
          "label": "translation.channel_type.debitoor",
          "name": "debitoor"
        },
        {
          "icon": "#channel-link",
          "label": "translation.channel_type.link",
          "name": "link"
        },
        {
          "icon": "#channel-e-conomic",
          "label": "translation.channel_type.eConomic",
          "name": "e-conomic"
        },
        {
          "icon": "#channel-jtl",
          "label": "translation.channel_type.jtl",
          "name": "jtl"
        },
        {
          "icon": "#channel-oxid",
          "label": "translation.channel_type.oxid",
          "name": "oxid"
        },
        {
          "icon": "#channel-weebly",
          "label": "translation.channel_type.weebly",
          "name": "weebly"
        },
        {
          "icon": "#channel-plentymarkets",
          "label": "translation.channel_type.plentyMarkets",
          "name": "plentymarkets"
        },
        {
          "icon": "#channel-advertising",
          "label": "translation.channel_type.advertising",
          "name": "advertising"
        },
        {
          "icon": "#channel-offer",
          "label": "translation.channel_type.offer",
          "name": "offer"
        },
        {
          "icon": "#channel-dandomain",
          "label": "translation.channel_type.danDomain",
          "name": "dandomain"
        },
        {
          "icon": "#channel-presta",
          "label": "translation.channel_type.prestaShop",
          "name": "presta"
        },
        {
          "icon": "#channel-xt_commerce",
          "label": "translation.channel_type.xtCommerce",
          "name": "xt_commerce"
        },
        {
          "icon": "#channel-overlay",
          "label": "translation.channel_type.overlay",
          "name": "overlay"
        },
        {
          "icon": "#channel-whatsapp",
          "label": "translation.channel_type.whatsapp",
          "name": "whatsapp"
        },
        {
          "icon": "#channel-telegram",
          "label": "translation.channel_type.telegram",
          "name": "telegram"
        },
        {
          "icon": "#channel-facebook-messenger",
          "label": "translation.channel_type.facebookMessenger",
          "name": "facebook-messenger"
        },
        {
          "icon": "#channel-commercetools",
          "label": "translation.channel_type.commercetools",
          "name": "commercetools"
        },
        {
          "icon": "#channel-ebay",
          "label": "translation.channel_type.ebay",
          "name": "ebay"
        },
        {
          "icon": "#channel-mobilede",
          "label": "translation.channel_type.mobilede",
          "name": "mobilede"
        },
        {
          "icon": "#channel-amazon",
          "label": "translation.channel_type.amazon",
          "name": "amazon"
        },
        {
          "icon": "#channel-autoscout24",
          "label": "translation.channel_type.autoscout24",
          "name": "autoscout24"
        },
        {
          "icon": "#channel-google_shopping",
          "label": "translation.channel_type.googleShopping",
          "name": "google_shopping"
        },
        {
          "icon": "#channel-instagram",
          "label": "translation.channel_type.instagram",
          "name": "instagram"
        },
        {
          "icon": "#channel-api",
          "label": "translation.channel_type.api",
          "name": "api"
        }
      ],
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
          "label": "translation.original_id",
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
          "label": "translation.reference",
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
          "label": "translation.date",
          "type": "date"
        },
        {
          "fieldName": "type",
          "filterConditions": [
            "is",
            "isNot"
          ],
          "label": "translation.payment_option",
          "options": [
            {
              "label": "translation.payment_option.instantPayment",
              "value": "instant_payment"
            },
            {
              "label": "translation.payment_option.paypal",
              "value": "paypal"
            },
            {
              "label": "translation.payment_option.sofort",
              "value": "sofort"
            },
            {
              "label": "translation.payment_option.stripeCreditCard",
              "value": "stripe"
            },
            {
              "label": "translation.payment_option.stripeDirectDebit",
              "value": "stripe_directdebit"
            },
            {
              "label": "translation.payment_option.santanderNLInstallment",
              "value": "santander_installment_nl"
            },
            {
              "label": "translation.payment_option.santanderATInstallment",
              "value": "santander_installment_at"
            },
            {
              "label": "translation.payment_option.swedbankCreditCard",
              "value": "swedbank_creditcard"
            },
            {
              "label": "translation.payment_option.swedbankInvoice",
              "value": "swedbank_invoice"
            },
            {
              "label": "translation.payment_option.santanderDEInvoice",
              "value": "santander_invoice_de"
            },
            {
              "label": "translation.payment_option.santanderDEPosInvoice",
              "value": "santander_pos_invoice_de"
            },
            {
              "label": "translation.payment_option.santanderDEFactoring",
              "value": "santander_factoring_de"
            },
            {
              "label": "translation.payment_option.santanderDEPosFactoring",
              "value": "santander_pos_factoring_de"
            },
            {
              "label": "translation.payment_option.wiretransfer",
              "value": "cash"
            },
            {
              "label": "translation.payment_option.santanderDKInstallment",
              "value": "santander_installment_dk"
            },
            {
              "label": "translation.payment_option.santanderNOInstallment",
              "value": "santander_installment_no"
            },
            {
              "label": "translation.payment_option.applePay",
              "value": "apple_pay"
            },
            {
              "label": "translation.payment_option.santanderNOInvoice",
              "value": "santander_invoice_no"
            },
            {
              "label": "translation.payment_option.googlePay",
              "value": "google_pay"
            },
            {
              "label": "translation.payment_option.santanderSeInstallment",
              "value": "santander_installment_se"
            },
            {
              "label": "translation.payment_option.santanderPosSeInstallment",
              "value": "santander_pos_installment_se"
            },
            {
              "label": "translation.payment_option.payExCreditCard",
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
          "label": "translation.status",
          "options": [
            {
              "label": "translation.status.New",
              "value": "STATUS_NEW"
            },
            {
              "label": "translation.status.InProcess",
              "value": "STATUS_IN_PROCESS"
            },
            {
              "label": "translation.status.Accepted",
              "value": "STATUS_ACCEPTED"
            },
            {
              "label": "translation.status.Paid",
              "value": "STATUS_PAID"
            },
            {
              "label": "translation.status.Declined",
              "value": "STATUS_DECLINED"
            },
            {
              "label": "translation.status.Refunded",
              "value": "STATUS_REFUNDED"
            },
            {
              "label": "translation.status.Failed",
              "value": "STATUS_FAILED"
            },
            {
              "label": "translation.status.Cancelled",
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
          "label": "translation.specific_status",
          "options": [
            {
              "label": "translation.specific_status.new",
              "value": "STATUS_NEW"
            },
            {
              "label": "translation.specific_status.inProcess",
              "value": "STATUS_IN_PROCESS"
            },
            {
              "label": "translation.specific_status.accepted",
              "value": "STATUS_ACCEPTED"
            },
            {
              "label": "translation.specific_status.paid",
              "value": "STATUS_PAID"
            },
            {
              "label": "translation.specific_status.declined",
              "value": "STATUS_DECLINED"
            },
            {
              "label": "translation.specific_status.refunded",
              "value": "STATUS_REFUNDED"
            },
            {
              "label": "translation.specific_status.failed",
              "value": "STATUS_FAILED"
            },
            {
              "label": "translation.specific_status.canceled",
              "value": "STATUS_CANCELLED"
            },
            {
              "label": "translation.specific_status.invoiceCancellation",
              "value": "STATUS_INVOICE_CANCELLATION"
            },
            {
              "label": "translation.specific_status.invoiceIncollection",
              "value": "STATUS_INVOICE_INCOLLECTION"
            },
            {
              "label": "translation.specific_status.invoiceLatepayment",
              "value": "STATUS_INVOICE_LATEPAYMENT"
            },
            {
              "label": "translation.specific_status.invoiceReminder",
              "value": "STATUS_INVOICE_REMINDER"
            },
            {
              "label": "translation.specific_status.santanderInProgress",
              "value": "STATUS_SANTANDER_IN_PROGRESS"
            },
            {
              "label": "translation.specific_status.santanderInProcess",
              "value": "STATUS_SANTANDER_IN_PROCESS"
            },
            {
              "label": "translation.specific_status.santanderDeclined",
              "value": "STATUS_SANTANDER_DECLINED"
            },
            {
              "label": "translation.specific_status.santanderApproved",
              "value": "STATUS_SANTANDER_APPROVED"
            },
            {
              "label": "translation.specific_status.santanderApprovedWithRequirements",
              "value": "STATUS_SANTANDER_APPROVED_WITH_REQUIREMENTS"
            },
            {
              "label": "translation.specific_status.santanderDeferred",
              "value": "STATUS_SANTANDER_DEFERRED"
            },
            {
              "label": "translation.specific_status.santanderCanceled",
              "value": "STATUS_SANTANDER_CANCELLED"
            },
            {
              "label": "translation.specific_status.santanderAutomaticDecline",
              "value": "STATUS_SANTANDER_AUTOMATIC_DECLINE declined"
            },
            {
              "label": "translation.specific_status.santanderInDecision",
              "value": "STATUS_SANTANDER_IN_DECISION"
            },
            {
              "label": "translation.specific_status.santanderDecisionNextWorkingDay",
              "value": "STATUS_SANTANDER_DECISION_NEXT_WORKING_DAY"
            },
            {
              "label": "translation.specific_status.santanderInCancellation",
              "value": "STATUS_SANTANDER_IN_CANCELLATION"
            },
            {
              "label": "translation.specific_status.santanderAccountOpened",
              "value": "STATUS_SANTANDER_ACCOUNT_OPENED"
            },
            {
              "label": "translation.specific_status.santanderCanceledAnother",
              "value": "STATUS_SANTANDER_CANCELLED_ANOTHER"
            },
            {
              "label": "translation.specific_status.santanderShopTemporaryApproved",
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
          "label": "translation.channel",
          "options": [
            {
              "label": "translation.channel_type.shopify",
              "value": "shopify"
            },
            {
              "label": "translation.channel_type.facebook",
              "value": "facebook"
            },
            {
              "label": "translation.channel_type.financeExpress",
              "value": "finance_express"
            },
            {
              "label": "translation.channel_type.shop",
              "value": "shop"
            },
            {
              "label": "translation.channel_type.wooCommerce",
              "value": "woo_commerce"
            },
            {
              "label": "translation.channel_type.magento",
              "value": "magento"
            },
            {
              "label": "translation.channel_type.marketing",
              "value": "marketing"
            },
            {
              "label": "translation.channel_type.pos",
              "value": "pos"
            },
            {
              "label": "translation.channel_type.shopware",
              "value": "shopware"
            },
            {
              "label": "translation.channel_type.debitoor",
              "value": "debitoor"
            },
            {
              "label": "translation.channel_type.link",
              "value": "link"
            },
            {
              "label": "translation.channel_type.eConomic",
              "value": "e-conomic"
            },
            {
              "label": "translation.channel_type.jtl",
              "value": "jtl"
            },
            {
              "label": "translation.channel_type.oxid",
              "value": "oxid"
            },
            {
              "label": "translation.channel_type.weebly",
              "value": "weebly"
            },
            {
              "label": "translation.channel_type.plentyMarkets",
              "value": "plentymarkets"
            },
            {
              "label": "translation.channel_type.advertising",
              "value": "advertising"
            },
            {
              "label": "translation.channel_type.offer",
              "value": "offer"
            },
            {
              "label": "translation.channel_type.danDomain",
              "value": "dandomain"
            },
            {
              "label": "translation.channel_type.prestaShop",
              "value": "presta"
            },
            {
              "label": "translation.channel_type.xtCommerce",
              "value": "xt_commerce"
            },
            {
              "label": "translation.channel_type.overlay",
              "value": "overlay"
            },
            {
              "label": "translation.channel_type.whatsapp",
              "value": "whatsapp"
            },
            {
              "label": "translation.channel_type.telegram",
              "value": "telegram"
            },
            {
              "label": "translation.channel_type.facebookMessenger",
              "value": "facebook-messenger"
            },
            {
              "label": "translation.channel_type.commercetools",
              "value": "commercetools"
            },
            {
              "label": "translation.channel_type.ebay",
              "value": "ebay"
            },
            {
              "label": "translation.channel_type.mobilede",
              "value": "mobilede"
            },
            {
              "label": "translation.channel_type.amazon",
              "value": "amazon"
            },
            {
              "label": "translation.channel_type.autoscout24",
              "value": "autoscout24"
            },
            {
              "label": "translation.channel_type.googleShopping",
              "value": "google_shopping"
            },
            {
              "label": "translation.channel_type.instagram",
              "value": "instagram"
            },
            {
              "label": "translation.channel_type.api",
              "value": "api"
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
          "label": "translation.amount",
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
          "label": "translation.total",
          "type": "number"
        },
        {
          "fieldName": "currency",
          "filterConditions": [
            "is",
            "isNot"
          ],
          "label": "translation.currency",
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
          "label": "translation.customer_name",
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
          "label": "translation.customer_email",
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
          "label": "translation.merchant_name",
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
          "label": "translation.merchant_email",
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
          "label": "translation.seller_name",
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
          "label": "translation.seller_email",
          "type": "string"
        }
      ],
      "paymentOptions": [
        {
          "icon": "#payment-method-instant_payment",
          "label": "translation.payment_option.instantPayment",
          "name": "instant_payment"
        },
        {
          "icon": "#payment-method-paypal",
          "label": "translation.payment_option.paypal",
          "name": "paypal"
        },
        {
          "icon": "#payment-method-sofort",
          "label": "translation.payment_option.sofort",
          "name": "sofort"
        },
        {
          "icon": "#payment-method-stripe",
          "label": "translation.payment_option.stripeCreditCard",
          "name": "stripe"
        },
        {
          "icon": "#payment-method-stripe_directdebit",
          "label": "translation.payment_option.stripeDirectDebit",
          "name": "stripe_directdebit"
        },
        {
          "icon": "#payment-method-santander_installment_nl",
          "label": "translation.payment_option.santanderNLInstallment",
          "name": "santander_installment_nl"
        },
        {
          "icon": "#payment-method-santander_installment_at",
          "label": "translation.payment_option.santanderATInstallment",
          "name": "santander_installment_at"
        },
        {
          "icon": "#payment-method-swedbank_creditcard",
          "label": "translation.payment_option.swedbankCreditCard",
          "name": "swedbank_creditcard"
        },
        {
          "icon": "#payment-method-swedbank_invoice",
          "label": "translation.payment_option.swedbankInvoice",
          "name": "swedbank_invoice"
        },
        {
          "icon": "#payment-method-santander_invoice_de",
          "label": "translation.payment_option.santanderDEInvoice",
          "name": "santander_invoice_de"
        },
        {
          "icon": "#payment-method-santander_pos_invoice_de",
          "label": "translation.payment_option.santanderDEPosInvoice",
          "name": "santander_pos_invoice_de"
        },
        {
          "icon": "#payment-method-santander_factoring_de",
          "label": "translation.payment_option.santanderDEFactoring",
          "name": "santander_factoring_de"
        },
        {
          "icon": "#payment-method-santander_pos_factoring_de",
          "label": "translation.payment_option.santanderDEPosFactoring",
          "name": "santander_pos_factoring_de"
        },
        {
          "icon": "#payment-method-cash",
          "label": "translation.payment_option.wiretransfer",
          "name": "cash"
        },
        {
          "icon": "#payment-method-santander_installment_dk",
          "label": "translation.payment_option.santanderDKInstallment",
          "name": "santander_installment_dk"
        },
        {
          "icon": "#payment-method-santander_installment_no",
          "label": "translation.payment_option.santanderNOInstallment",
          "name": "santander_installment_no"
        },
        {
          "icon": "#payment-method-apple_pay",
          "label": "translation.payment_option.applePay",
          "name": "apple_pay"
        },
        {
          "icon": "#payment-method-santander_invoice_no",
          "label": "translation.payment_option.santanderNOInvoice",
          "name": "santander_invoice_no"
        },
        {
          "icon": "#payment-method-google_pay",
          "label": "translation.payment_option.googlePay",
          "name": "google_pay"
        },
        {
          "icon": "#payment-method-santander_installment_se",
          "label": "translation.payment_option.santanderSeInstallment",
          "name": "santander_installment_se"
        },
        {
          "icon": "#payment-method-santander_pos_installment_se",
          "label": "translation.payment_option.santanderPosSeInstallment",
          "name": "santander_pos_installment_se"
        },
        {
          "icon": "#payment-method-payex_creditcard",
          "label": "translation.payment_option.payExCreditCard",
          "name": "payex_creditcard"
        }
      ]
    }
    """
