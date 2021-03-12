const metrics = [
		{sizes: [
				"small",
				"medium",
				"large"
			],types: [
				"transactions"
			],_id: "69ca727e-d5d9-491d-9f14-45509cae2799",name: "averageSuccessPayments",group: "Payment Status"
		},
		{sizes: [
				"small",
				"medium",
				"large"
			],types: [
				"transactions"
			],_id: "248a270d-3f7f-464c-a0f4-ed1a27f425c5",name: "conversionRate",group: "Conversion Metric"
		},
		{sizes: [
				"small",
				"medium",
				"large"
			],types: [
				"transactions"
			],_id: "32c29f00-5f9a-4a08-b628-e07173cc9da3",name: "countNewPayments",group: "Payment Status"
		},
		{sizes: [
				"small",
				"medium",
				"large"
			],types: [
				"transactions"
			],_id: "e48ee6f3-71c5-455e-8e6a-7861f2fb268c",name: "countPaidPayments",group: "Payment Status"
		},
		{sizes: [
				"small",
				"medium",
				"large"
			],types: [
				"transactions"
			],_id: "90c3b4b0-1187-444d-a2a1-c8949e557295",name: "countRefunds",group: "Payment Status"
		},
		{sizes: [
				"small",
				"medium",
				"large"
			],types: [
				"transactions"
			],_id: "fb9da106-8b47-4d42-b8dd-dd83131005fb",name: "countSessions",group: "Behavior Metric"
		},
		{sizes: [
				"small",
				"medium",
				"large"
			],types: [
				"transactions"
			],_id: "5047bb89-0d78-4895-ae85-b0c051655385",name: "countSuccessPayments",group: "Payment Status"
		},
		{sizes: [
				"small",
				"medium",
				"large"
			],types: [
				"transactions"
			],_id: "bbc5b245-455a-4af9-9f6b-a8f1e8a5be9e",name: "countUnsuccessfulPayments",group: "Payment Status"
		},
		{sizes: [
				"small",
				"medium",
				"large"
			],types: [
				"transactions"
			],_id: "9083a824-e814-47a4-88b8-c2e7b5f4038f",name: "exitRate",group: "Behavior Metric"
		},
		{sizes: [
				"small",
				"medium",
				"large"
			],types: [
				"transactions"
			],_id: "9ebbc63f-10fb-4f31-8c5c-88778bda114a",name: "maxSuccessPayments",group: "Payment Status"
		},
		{sizes: [
				"small",
				"medium",
				"large"
			],types: [
				"transactions"
			],_id: "edd39636-8fce-4538-b90a-283d145616ac",name: "minSuccessPayments",group: "Payment Status"
		},
		{sizes: [
				"small",
				"medium",
				"large"
			],types: [
				"transactions"
			],_id: "70b34060-e4dc-4888-a6db-d097c4f23e7e",name: "rateNewPayments",group: "Payment Status"
		},
		{sizes: [
				"small",
				"medium",
				"large"
			],types: [
				"transactions"
			],_id: "c6ed31c7-65ac-4ebe-a557-7673f9059158",name: "ratePaidPayments",group: "Payment Status"
		},
		{sizes: [
				"small",
				"medium",
				"large"
			],types: [
				"transactions"
			],_id: "f1cbac05-824f-4bb5-ace3-c8113800a675",name: "rateRefundPayments",group: "Payment Status"
		},
		{sizes: [
				"small",
				"medium",
				"large"
			],types: [
				"transactions"
			],_id: "c565a4c9-2d69-45c5-a3ff-c9236b390226",name: "rateSuccessPayments",group: "Payment Status"
		},
		{sizes: [
				"small",
				"medium",
				"large"
			],types: [
				"transactions"
			],_id: "12beaeea-e78a-4c38-8e39-754c4c4b5265",name: "revenue",group: "Conversion Metric"
		},
		{sizes: [
				"small",
				"medium",
				"large"
			],types: [
				"transactions"
			],_id: "31708868-fa62-4055-959e-f5083c21d51b",name: "sessionDuration",group: "Behavior Metric"
		},
		{sizes: [
				"small",
				"medium",
				"large"
			],types: [
				"transactions"
			],_id: "401ca526-3fa7-42a2-bda6-1b0e2028a5a1",name: "totalCount",group: "Payment Status"
		}
    ];
    const result = [];
    metrics.forEach((i) => {
        console.log(i);
        const foundIndex = result.findIndex((a) => a.type === i.group);
        console.log(foundIndex);
        if (foundIndex >= 0) {
            result[foundIndex].list.push(i);
        }
        else {
            result.push({
                type: i.group,
                list: [i],
            });
        }
    });
      console.log(result);