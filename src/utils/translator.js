 const en = require('../testdata/translations/en.json');
const fr = require('../testdata/translations/fr.json');
//const es = require('../testdata/translations/es.json');
const pt = require('../testdata/translations/pt.json');

const translations = {
  en,
  fr,
  pt
};

// normalize dropdown value
function normalizeKey(value) {
  if (!value) return '';
  return value.trim()                  // remove leading/trailing spaces
              .replace(/\u200E|\u200F/g, '') // remove invisible LTR/RTL chars
              .toUpperCase();           // consistent uppercase key
}


function translate(language, section, value) {
  const key = normalizeKey(value);
  // return translation if exists, otherwise fallback to original value
  return translations[language][section]?.[key] || value;
}

module.exports = { translate };