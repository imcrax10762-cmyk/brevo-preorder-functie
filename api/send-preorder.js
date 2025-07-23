const SibApiV3Sdk = require('@sendinblue/client');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // --- CONFIGURATIE MET JOUW ID'S ---
  const CUSTOMER_TEMPLATE_ID = 5; // Klant - Pre-order Bevestiging
  const ADMIN_TEMPLATE_ID = 6;    // Admin - Nieuwe Pre-order
  const PREORDER_LIST_ID = 6;     // Pre-order Aanmeldingen lijst
  const ADMIN_EMAIL = 'contact@mm2126.com';  // ⚠️ VERVANG DOOR HET E-MAILADRES WAAR JIJ DE MELDING WILT KRIJGEN
  // ----------------------------------------------------

  const { email, productTitle, selectedVariant, quantity, price, productUrl } = req.body;

  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_API_KEY; // Deze haalt de sleutel veilig uit Vercel

  try {
    // Stap 1: Contactpersoon aanmaken/updaten en toevoegen aan lijst
    const contactsApi = new SibApiV3Sdk.ContactsApi();
    await contactsApi.createContact({
      email: email,
      listIds: [PREORDER_LIST_ID],
      updateEnabled: true,
    });

    // Data voor in de e-mails
    const emailParams = {
      productTitle,
      selectedVariant,
      quantity,
      price,
      productUrl,
      customerEmail: email,
    };

    const transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();

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
    // Log de fout voor debugging in Vercel
    console.error('Er is een fout opgetreden in de Brevo flow:', error.response ? error.response.body.message : error.message);
    
    // Stuur een duidelijke foutmelding terug
    return res.status(500).json({ 
        message: 'Er is iets misgegaan bij het verwerken van de aanvraag.',
        errorDetails: error.response ? error.response.body.message : error.message
    });
  }
};