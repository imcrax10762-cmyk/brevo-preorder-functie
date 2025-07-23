// Importeer de library
const SibApiV3Sdk = require('@sendinblue/client');

// Functie om de CORS headers correct in te stellen
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://www.mm2126.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

// De hoofdfunctie die de logica uitvoert
const handler = async (req, res) => {
  // --- CONFIGURATIE MET JOUW ID'S ---
  const CUSTOMER_TEMPLATE_ID = 5;
  const ADMIN_TEMPLATE_ID = 6;
  const PREORDER_LIST_ID = 6;
  const ADMIN_EMAIL = 'imCrax10762@gmail.com';
  // ----------------------------------------------------
  
  const { email, productTitle, selectedVariant, quantity, price, productUrl } = req.body;

  // --- START: CORRECTE INITIALISATIE VOLGENS DOCUMENTATIE ---
  // Stap 1: Krijg de standaard client-instantie
  const defaultClient = SibApiV3Sdk.ApiClient.instance;

  // Stap 2: Configureer de API-sleutel op de standaard client
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  // Stap 3: Maak de specifieke API-instanties aan
  const transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();
  const contactsApi = new SibApiV3Sdk.ContactsApi();
  // --- EINDE: CORRECTE INITIALISATIE ---

  try {
    // Stap 4: Gebruik de instanties om de acties uit te voeren
    await contactsApi.createContact({
      email: email,
      listIds: [PREORDER_LIST_ID],
      updateEnabled: true,
    });

    const emailParams = {
      productTitle, selectedVariant, quantity, price, productUrl, customerEmail: email,
    };

    await transactionalEmailsApi.sendTransacEmail({
      templateId: CUSTOMER_TEMPLATE_ID,
      to: [{ email: email }],
      params: emailParams,
    });

    await transactionalEmailsApi.sendTransacEmail({
      templateId: ADMIN_TEMPLATE_ID,
      to: [{ email: ADMIN_EMAIL }],
      params: emailParams,
    });

    return res.status(200).json({ message: 'Operatie succesvol!' });

  } catch (error) {
    console.error('Fout in de Brevo flow:', error.response ? JSON.stringify(error.response.body) : error.message);
    return res.status(500).json({ 
      message: 'Er is iets misgegaan.',
      errorDetails: error.response ? error.response.body.message : error.message 
    });
  }
};

// Exporteer de handler met de CORS wrapper
module.exports = allowCors(handler);
