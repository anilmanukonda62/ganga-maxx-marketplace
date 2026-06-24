const OpenAI = require('openai');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Groq uses OpenAI-compatible API
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

const COMPANY_INFO = `
Company: Ganga Maxx Marketplace
Type: B2B Cleaning & Hygiene Supplies
Address: Sri Ram Nagar Colony, Puppalaguda, Hyderabad, Telangana 500089
Phone: +91 9110306090, +91 9110714545
Email: Gangamaxxmarketplace@gmail.com
Hours: Monday to Saturday, 9 AM to 6 PM
Area: Hyderabad and Telangana
Ordering: Browse products → Submit enquiry → Team contacts within 24 hours
Bulk Orders: Available with special pricing, submit enquiry for quote
`;

/**
 * Translates Telugu/Hinglish slang terms commonly typed by customers into English
 * to ensure maximum LLM comprehension, prevent organization rate limit overheads,
 * and block false triggers of out-of-scope filters.
 */
const translateQuery = (msg) => {
  if (!msg) return '';
  let text = msg.toLowerCase().trim();

  // Replace common Telugu words with English equivalents
  text = text.replace(/\bprice enti\b/g, 'what is the price')
             .replace(/\bprice yenti\b/g, 'what is the price')
             .replace(/\benti\b/g, 'what is')
             .replace(/\byenti\b/g, 'what is')
             .replace(/\bcheppu\b/g, 'tell me')
             .replace(/\bchepu\b/g, 'tell me')
             .replace(/\bcheppandi\b/g, 'tell me')
             .replace(/\bemi\b/g, 'what is')
             .replace(/\byemi\b/g, 'what is')
             .replace(/\bundhi\b/g, 'is it available')
             .replace(/\bundi\b/g, 'is it available')
             .replace(/\bvasthundha\b/g, 'does it deliver')
             .replace(/\bki\b/g, 'to');

  return text;
};

/**
 * Filter products from MongoDB based on user query intent to prevent hallucinations,
 * improve relevance, and reduce token counts.
 */
const getFilteredProducts = async (message, categories) => {
  const lowerMsg = message.toLowerCase().trim();

  try {
    // 1. Stock Status queries
    const isOutOfStockQuery = lowerMsg.includes('out of stock') || 
                               lowerMsg.includes('out-of-stock') || 
                               lowerMsg.includes('unavailable') || 
                               lowerMsg.includes('stock empty') ||
                               lowerMsg.includes('stock list') ||
                               lowerMsg.includes('stock status');
    
    if (isOutOfStockQuery) {
      return await Product.find({ 'stock.status': 'out_of_stock' }).lean();
    }

    // 2. Eco-friendly queries
    const isEcoQuery = lowerMsg.includes('eco friendly') || 
                       lowerMsg.includes('eco-friendly') || 
                       lowerMsg.includes('green') || 
                       lowerMsg.includes('sustainable') || 
                       lowerMsg.includes('environment') ||
                       lowerMsg.includes('biodegradable') ||
                       lowerMsg.includes('swizydra');
    
    if (isEcoQuery) {
      return await Product.find({
        $or: [
          { name: /swizydra/i },
          { description: /eco|green|sustainable|biodegradable/i }
        ]
      }).lean();
    }

    // 3. Facility/Industry matching
    if (lowerMsg.includes('hospital') || lowerMsg.includes('medical') || lowerMsg.includes('clinic')) {
      return await Product.find({
        $or: [
          { category: 'safety-ppe' },
          { category: 'waste-management' },
          { name: /disinfectant|sanitizer|phenyl|bleach/i }
        ]
      }).lean();
    }

    if (lowerMsg.includes('office') || lowerMsg.includes('corporate') || lowerMsg.includes('it park') || lowerMsg.includes('it-park')) {
      return await Product.find({
        $or: [
          { name: /freshener|soap|handwash|tissue|glass cleaner|multipurpose/i },
          { category: 'waste-management' },
          { category: 'washroom-hygiene' }
        ]
      }).lean();
    }

    if (lowerMsg.includes('hotel') || lowerMsg.includes('restaurant') || lowerMsg.includes('cafe') || lowerMsg.includes('resort')) {
      return await Product.find({
        $or: [
          { name: /dishwash|floor cleaner|freshener|handwash|tissue|glass cleaner/i },
          { category: 'cleaning-tools' },
          { category: 'washroom-hygiene' }
        ]
      }).lean();
    }

    if (lowerMsg.includes('school') || lowerMsg.includes('college') || lowerMsg.includes('institute') || lowerMsg.includes('education')) {
      return await Product.find({
        $or: [
          { name: /floor cleaner|sanitizer|soap|phenyl/i },
          { category: 'waste-management' },
          { category: 'cleaning-tools' }
        ]
      }).lean();
    }

    // 4. Category matching
    const matchedCategoryIds = [];
    categories.forEach(cat => {
      const catNameLower = cat.name.toLowerCase();
      const catIdLower = cat.id.toLowerCase();
      
      if (lowerMsg.includes(catNameLower) || lowerMsg.includes(catIdLower) ||
          (catIdLower === 'cleaning-chemicals' && (lowerMsg.includes('chemical') || lowerMsg.includes('liquid') || lowerMsg.includes('soap') || lowerMsg.includes('detergent') || lowerMsg.includes('phenyl') || lowerMsg.includes('cleaner'))) ||
          (catIdLower === 'cleaning-tools' && (lowerMsg.includes('tool') || lowerMsg.includes('mop') || lowerMsg.includes('brush') || lowerMsg.includes('wiper') || lowerMsg.includes('cloth') || lowerMsg.includes('microfiber'))) ||
          (catIdLower === 'washroom-hygiene' && (lowerMsg.includes('washroom') || lowerMsg.includes('toilet') || lowerMsg.includes('urinal') || lowerMsg.includes('bathroom') || lowerMsg.includes('dispenser') || lowerMsg.includes('tissue'))) ||
          (catIdLower === 'safety-ppe' && (lowerMsg.includes('safety') || lowerMsg.includes('ppe') || lowerMsg.includes('mask') || lowerMsg.includes('glove') || lowerMsg.includes('apron') || lowerMsg.includes('shield'))) ||
          (catIdLower === 'waste-management' && (lowerMsg.includes('waste') || lowerMsg.includes('bin') || lowerMsg.includes('dustbin') || lowerMsg.includes('garbage') || lowerMsg.includes('trash'))) ||
          (catIdLower === 'cleaning-machines' && (lowerMsg.includes('machine') || lowerMsg.includes('vacuum') || lowerMsg.includes('scrubber') || lowerMsg.includes('dryer') || lowerMsg.includes('washer')))
      ) {
        matchedCategoryIds.push(cat.id);
      }
    });

    if (matchedCategoryIds.length > 0) {
      return await Product.find({ category: { $in: matchedCategoryIds } }).lean();
    }

    // 5. Keyword search (product names / terms)
    const keywords = ['sanitizer', 'mask', 'phenyl', 'cleaner', 'vacuum', 'mop', 'bin', 'soap', 'tissue', 'glove', 'bleach', 'chemical', 'apron', 'wiper', 'detergent', 'scrubber', 'freshener'];
    const matchedKeywords = keywords.filter(kw => lowerMsg.includes(kw));
    
    if (matchedKeywords.length > 0) {
      return await Product.find({
        $or: matchedKeywords.flatMap(kw => [
          { name: new RegExp(kw, 'i') },
          { description: new RegExp(kw, 'i') }
        ])
      }).lean();
    }

    // 6. Default Fallback: Popular products (up to 10 products, 1-2 from each category)
    const fallbackProducts = [];
    for (const cat of categories) {
      const prods = await Product.find({ category: cat.id }).limit(2).lean();
      fallbackProducts.push(...prods);
    }
    return fallbackProducts.slice(0, 10);
  } catch (error) {
    console.error('Pre-filtering error:', error.message);
    return await Product.find({}).limit(5).lean();
  }
};

const chatbotHandler = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Pre-translate message to English
    const translatedMessage = translateQuery(message);

    // Fetch categories and live filtered products using translated message
    const categories = await Category.find({ isActive: true }).lean();
    const filteredProducts = await getFilteredProducts(translatedMessage, categories);

    // Build category ID to Name map
    const categoryMap = {};
    categories.forEach(c => {
      categoryMap[c.id] = c.name;
    });

    // Format products in a clean, non-db format
    const productsText = filteredProducts.map(p => {
      const priceVal = p.variants && p.variants.length > 0 
        ? p.variants.map(v => `${v.label}: ₹${v.price}`).join(', ') 
        : `₹${p.price}`;
      
      const availabilityVal = p.stock?.status === 'out_of_stock' 
        ? 'Out of Stock' 
        : (p.stock?.status === 'low_stock' ? 'Limited Stock' : 'In Stock');
      const categoryName = categoryMap[p.category] || p.category;

      return `Product Name: ${p.name}
Category: ${categoryName}
Price: ${priceVal}
Availability: ${availabilityVal}
Description: ${p.description || ''}`;
    }).join('\n\n');

    const categoriesText = categories.map(c => `• ${c.name}: ${c.description}`).join('\n');

    const systemPrompt = `You are Ganga Maxx AI Assistant. You represent a professional B2B cleaning and hygiene solutions company in Hyderabad.
Your responsibility is to assist customers with:
• Product recommendations
• Product information
• Product comparisons
• Cleaning solutions
• Housekeeping supplies
• Washroom products
• Safety products
• PPE kits
• Delivery information
• Quotation guidance
• Bulk order planning
• Company information

COMPANY INFO:
${COMPANY_INFO}

PRODUCT CATEGORIES:
${categoriesText}

AVAILABLE PRODUCTS FOR THIS INQUIRY:
${productsText || 'No specific products match this query.'}

STRICT BEHAVIOR RULES:
1. Always respond in English.
2. Never respond in Telugu.
3. Never respond in Hindi.
4. Never expose database structures.
5. Never expose raw product data.
6. Never show MongoDB output.
7. Never use pipe symbols, except as explicitly specified for separating variants in Single Product inquiries.
8. Never invent products.
9. Never invent prices.
10. Never invent stock status.
11. Never invent company policies.
12. Use ONLY available database information.

OUT OF SCOPE QUESTIONS:
If the user asks questions completely unrelated to Ganga Maxx, our products, or services (for example: "Who is Virat Kohli?", "Tell me a joke", "What is Python?", "What is IPL?"), you MUST respond EXACTLY with:
"I am Ganga Maxx AI Assistant. I can assist with cleaning products, quotations, delivery information, bulk orders, and facility management solutions."

Do NOT use this out-of-scope response if the customer is asking about our products, catalog, delivery area, quotes, or bulk order pricing. Only use it for completely off-topic general knowledge, sports, entertainment, or technical questions.

HALLUCINATION PROTECTION:
If information or a product does not exist in the provided database:
"Sorry, I could not find that information in our product catalog."
Do NOT guess. Do NOT fabricate.

RESPONSE FORMATTING RULES (STRICTLY FOLLOW):
1. Always use clean, structured format - never show raw database fields like 'Category: cleaning-chemicals' or 'Base Price:'
2. For product recommendations, use this exact format:
   🏥 Recommended Products for [Customer Type]:

   1. **[Product Name]** - ₹[Price]
      [One line description of why it's good for their use case]

   2. **[Product Name]** - ₹[Price]
      [One line description]

   (and so on for each product)

   💡 *For bulk orders, submit an enquiry for special pricing!*

3. For single product inquiries, use this format:
   **[Product Name]**
   💰 Price: ₹[base price]
   📦 Variants: [variant1] | [variant2] | [variant3]
   ✅ Stock: [In Stock / Out of Stock]
   📝 [One line description]

4. For general questions, use short clean paragraphs - no bullet points with * symbol
5. Use relevant emojis sparingly to make responses visually appealing
6. Never show: 'Category:', 'Base Price:', 'Stock: in_stock/out_of_stock' in raw format
7. Always translate stock status: in_stock = ✅ Available, low_stock = ⚠️ Limited Stock, out_of_stock = ❌ Currently Unavailable
8. Keep responses concise - maximum 8-10 lines total
9. End every response with one helpful action suggestion in italics`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-8),
      { role: 'user', content: translatedMessage }
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: messages,
      max_tokens: 250,
      temperature: 0.7,
    });

    const botResponse = completion.choices[0].message.content;

    res.json({ success: true, message: botResponse });

  } catch (error) {
    console.error('Chatbot error:', error.message);
    res.json({
      success: true,
      message: "I'm having a technical issue right now. Please contact us at +91 9110306090 or submit an enquiry on our website. Sorry for the inconvenience!"
    });
  }
};

module.exports = { chatbotHandler };
