const express = require("express");
const AmazonPaapi = require("amazon-paapi");

const app = express();
const port = process.env.PORT || 3000;

// US + CA marketplaces
const marketplaces = [
  { country: "US", marketplace: "www.amazon.com", tag: shreejagann0f-20 },
  { country: "CA", marketplace: "www.amazon.ca", tag: shreejagann0f-20 }, // same tag
];

app.get("/lookup", async (req, res) => {
  try {
    const asin = req.query.asin;

    if (!asin) {
      return res.status(400).json({ error: "ASIN is required" });
    }

    const requestParameters = {
      ItemIds: [asin],
      Resources: [
        "ItemInfo.Title",
        "ItemInfo.Features",
        "ItemInfo.ByLineInfo",
        "Offers.Listings.Price",
        "Images.Primary.Large",
        "Images.Variants.Large",
      ],
    };

    const results = [];

    // Loop US + CA
    for (const region of marketplaces) {
      try {
        const commonParameters = {
          AccessKey: "AKPACHPP681756975474",
          SecretKey: "MX5Yec7stDgLlFRTG2nPoeFelz8VQQnAKDmGtw8s",
          PartnerTag: "shreejagann0f-20", // e.g. mytag-20
          PartnerType: "Associates",
          Marketplace: region.marketplace,
        };

        const data = await AmazonPaapi.GetItems(
          commonParameters,
          requestParameters
        );

        results.push({
          region: region.country,
          marketplace: region.marketplace,
          data,
        });
      } catch (err) {
        results.push({
          region: region.country,
          marketplace: region.marketplace,
          error: err.message,
        });
      }
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`✅ Helper running on port ${port}`));
