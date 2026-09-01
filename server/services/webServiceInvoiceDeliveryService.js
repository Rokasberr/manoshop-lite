const { areOfficialWebServiceDocumentsEnabled } = require("../config/webServiceBusiness");
const { deliverWebServiceOfficialInvoice } = require("./webServiceOfficialInvoiceEmailService");
const { deliverWebServiceTestInvoice } = require("./webServiceTestInvoiceEmailService");

const deliverWebServiceInvoice = async (options) => {
  if (areOfficialWebServiceDocumentsEnabled()) return deliverWebServiceOfficialInvoice(options);
  const delivery = await deliverWebServiceTestInvoice(options);
  return { ...delivery, official: false };
};

module.exports = { deliverWebServiceInvoice };
