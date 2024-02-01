import axios from "axios";
import * as cheerio from "cheerio";
import { extractDescription, extractPrice, extractCurrency } from "../utils";

function half(data: any): any {
  const halfLength = Math.ceil(data.length / 2);
  const newdata = data.slice(0, halfLength);
  return newdata;
}

export async function scrapeAmazonProduct(url: string) {
  if (!url) {
    return;
  }

  // Bright Data proxy configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;
  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: 'br.superproxy.io',
    port,
    rejectUnauthorized: false,
  };

  try {
    // Fetch the product page
    const response = await axios.get(url, options);
    const $ = cheerio.load(response.data);

    const title = $('#productTitle').text().trim();
    const currentPrice = extractPrice(
      $('.priceToPay span.a-price-whole'),
      $('a.size.base.a-color-price'),
      $('.a-button-selected .a-color-base'),
      $('.a-price.a-text-price')
    );

    const originalPrice1 = extractPrice(
      $('.basisPrice'),
      $('#priceblock_ourprice'),
      $('.a-price .a-text-price span.a-offscreen'),
      $('#listPrice'),
      $('#priceblock_dealprice'),
      $('.a-size-base.a-color-price')
    );
    const originalPrice = half(originalPrice1);

    const outOfStock =
      $('#availabilty span, #outOfStock').text().trim().toLowerCase() ===
      'currently unavailable.';

    const images =
      $('#imgBlkFront').attr('data-a-dynamic-image') ||
      $('#landingImage').attr('data-a-dynamic-image') ||
      '{}';

    const imageUrls = Object.keys(JSON.parse(images));
    const currency = extractCurrency($('.a-price-symbol'));
    const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, '');
    const star1 = $('span#acrPopover span.a-size-base').text();
    const reviewscount1 = $('span#acrCustomerReviewText').text().match(/\d+/);
    const description = extractDescription($);

    const starNumeric = star1.match(/\d+(\.\d+)?/);
    const starValue = starNumeric ? Number(starNumeric[0]) : 0;
   // After extracting numeric part
    const reviewscount = reviewscount1 ? Number(reviewscount1[0]) : 0;


    // Construct data object with scraped information
    const data = {
      url,
      currency: currency || 'Rupee',
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
      discountRate: Number(discountRate),
      description,
      category: 'category', // You might want to replace this with actual category extraction logic
      reviewsCount: reviewscount,
      stars: starValue,
      isOutOfStock: outOfStock,
    };

    console.log(data.stars);
    console.log(data.reviewsCount);
    return data;
  } catch (error: any) {
    throw new Error(`Failed to scrape product: ${error.message}`);
  }
}
