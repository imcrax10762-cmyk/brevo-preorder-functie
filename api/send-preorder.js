const SibApiV3Sdk = require('@sendinblue/client');

// NIEUW: Functie om de CORS headers toe te voegen
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://www.mm2126.com'); // Specifiek jouw domein
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // NIEUW: De browser stuurt eerst een 'OPTIONS' request (een "preflight"). 
  // Als dat het geval is, sturen we gewoon een "OK" terug.
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

const handler = async (req, res) => {
  // We gebruiken de oude logica niet meer in de 'if' hier, 
  // omdat de preflight check hierboven dit al afhandelt.

  // --- CONFIGURATIE MET JOUW ID'S ---
  const CUSTOMER_TEMPLATE_ID = 5; 
  const ADMIN_TEMPLATE_ID = 6;
  const PREORDER_LIST_ID = 6;
  const ADMIN_EMAIL = 'imCrax10762@gmail.com';
  // ----------------------------------------------------

  const { email, productTitle, selectedVariant, quantity, price, productUrl } = req.body;

  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  try {
    const contactsApi = new SibApiV3Sdk.ContactsApi();
    await contactsApi.createContact({
      email: email,
      listIds: [PREORDER_LIST_ID],
      updateEnabled: true,
    });

    const emailParams = {
      productTitle,
      selectedVariant,
      quantity,
      price,
      productUrl,
      customerEmail: email,
    };

    const transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();

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
    console.error('Er is een fout opgetreden in de Brevo flow:', error.response ? error.response.body.message : error.message);
    return res.status(500).json({ 
        message: 'Er is iets misgegaan bij het verwerken van de aanvraag.',
        errorDetails: error.response ? error.response.body.message : error.message
    });
  }
};

// Exporteer de handler met de CORS wrapper eromheen
module.exports = allowCors(handler);
