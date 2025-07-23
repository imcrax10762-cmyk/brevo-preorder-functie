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

  // --- FINALE CORRECTIE HIER ---
  // Initialiseer de ALGEMENE API client en stel de sleutel EENMAAL in
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications['apiKey'];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  // Maak nu de specifieke API-instanties aan; ze gebruiken nu automatisch de sleutel
  const transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();
  const contactsApi = new SibApiV3Sdk.ContactsApi();
  // --- EINDE CORRECTIE ---

  try {
    // Stap 1: Contactpersoon aanmaken/updaten 
    await contactsApi.createContact({
      email: email,
      listIds: [PREORDER_LIST_ID],
      updateEnabled: true,
    });

    const emailParams = {
      productTitle, selectedVariant, quantity, price, productUrl, customerEmail: email,
    };

    // Stap 2: Stuur de bevestigingsmail naar de KLANT
    await transactionalEmailsApi.sendTransacEmail({
      templateId: CUSTOMER_TEMPLATE_ID,
      to: [{ email: email }],
      params: emailParams,
    });

    // Stap 3: Stuur de notificatiemail naar de ADMIN
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
