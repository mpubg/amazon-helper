import { GetItems } from 'amazon-paapi';

export default async function handler(req, res) {
  const { asin } = req.query;

  if (!asin) {
    return res.status(400).json({ error: "ASIN is required" });
  }

  // US + CA marketplaces
  const marketplaces = [
    { country: "US", marketplace: "www.amazon.com", tag: process.env.PARTNER_TAG },
    { country: "CA", marketplace: "www.amazon.ca", tag: process.env.PARTNER_TAG }, // same tag as US
  ];

  const requestParameters = {
    ItemIds: [asin],
    Resources: [
      "Images.Primary.Large",
      "Images.Variants.Large",
      "ItemInfo.Title",
      "ItemInfo.Features",
      "ItemInfo.ByLineInfo",
      "Offers.Listings.Price"
    ],
  };

  const results = [];

  try {
    // Loop through US & CA
    for (const region of marketplaces) {
      try {
        const commonParameters = {
          AccessKey: process.env.ACCESS_KEY,
          SecretKey: process.env.SECRET_KEY,
          PartnerTag: region.tag,
          PartnerType: 'Associates',
          Marketplace: region.marketplace,
        };

        const data = await GetItems(commonParameters, requestParameters);

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

    return res.status(200).json(results);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
