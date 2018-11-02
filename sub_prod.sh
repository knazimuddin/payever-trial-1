#!/usr/bin/bash
curl -X PATCH --data '{"rrsets":[{"name":"transactions-backend.payever.org.","type":"A","ttl":600,"changetype":"REPLACE","records":[{"content":"13.81.170.138","disabled":false}]}]}' -H 'X-API-Key: HuePSKjO2kAB4G0n' https://pdns.payever.de/api/v1/servers/localhost/zones/payever.org | jq .
