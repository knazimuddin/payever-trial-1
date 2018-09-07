#!/usr/bin/bash
curl -X PATCH --data '{"rrsets":[{"name":"placeholder.devpayever.com.","type":"A","ttl":600,"changetype":"REPLACE","records":[{"content":"13.81.14.131","disabled":false}]}]}' -H 'X-API-Key: HuePSKjO2kAB4G0n' https://pdns.payever.de/api/v1/servers/localhost/zones/devpayever.com | jq .
