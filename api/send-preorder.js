const SibApiV3Sdk = require('@sendinblue/client');

const handler = async (req, res) => {
  // --- DEBUG STAP ---
  // Het doel is om te zien wat er in het 'SibApiV3Sdk' object zit.
  // Dit helpt ons de juiste manier te vinden om de API client aan te roepen.
  console.log("--- START DEBUG ---");
  console.log("Inhoud van SibApiV3Sdk object:", JSON.stringify(SibApiV3Sdk, null, 2));
  console.log("--- EINDE DEBUG ---");
  
  // We stoppen de functie hier tijdelijk om de log te kunnen lezen.
  // Dit zorgt voor een 500-error in de browser, wat nu oké is.
  return res.status(500).json({ message: "Debugging in progress. Check Vercel logs for 'START DEBUG'." });
};

// We gebruiken de CORS wrapper nog steeds, voor het geval dat
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://www.mm2126.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

module.exports = allowCors(handler);
