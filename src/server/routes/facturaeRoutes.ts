import { Router } from 'express';

export const facturaeRouter = Router();

facturaeRouter.post('/facturae/generate', (req, res, next) => {
  try {
    const { invoiceNumber, issueDate, customer, total, vatAmount } = req.body;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<fe:Facturae xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:fe="http://www.facturae.es/Facturae/2014/v3.2.2/Facturae">
  <FileHeader>
    <SchemaVersion>3.2.2</SchemaVersion>
    <Modality>I</Modality>
    <InvoiceIssuerType>EM</InvoiceIssuerType>
    <Batch>
      <BatchIdentifier>${invoiceNumber || 'F2026/0001'}</BatchIdentifier>
      <InvoicesCount>1</InvoicesCount>
      <TotalInvoicesAmount><TotalAmount>${(total || 100).toFixed(2)}</TotalAmount></TotalInvoicesAmount>
    </Batch>
  </FileHeader>
  <Parties>
    <SellerParty>
      <TaxIdentification><TaxNumber>B12345678</TaxNumber></TaxIdentification>
      <LegalEntity><CorporateName>RESTAURANTE EL TABERNERO S.L.</CorporateName></LegalEntity>
    </SellerParty>
    <BuyerParty>
      <TaxIdentification><TaxNumber>${customer?.nif || '12345678Z'}</TaxNumber></TaxIdentification>
      <LegalEntity><CorporateName>${customer?.name || 'CLIENTE RECURRENTE'}</CorporateName></LegalEntity>
    </BuyerParty>
  </Parties>
  <Invoices>
    <Invoice>
      <InvoiceHeader>
        <InvoiceNumber>${invoiceNumber || 'F2026/0001'}</InvoiceNumber>
        <IssueDate>${issueDate || new Date().toISOString().split('T')[0]}</IssueDate>
        <InvoiceDocumentType>FC</InvoiceDocumentType>
        <InvoiceClass>OO</InvoiceClass>
      </InvoiceHeader>
      <InvoiceTotals>
        <TotalGrossAmount>${((total || 100) - (vatAmount || 10)).toFixed(2)}</TotalGrossAmount>
        <TotalTaxOutputs>${(vatAmount || 10).toFixed(2)}</TotalTaxOutputs>
        <InvoiceTotal>${(total || 100).toFixed(2)}</InvoiceTotal>
      </InvoiceTotals>
    </Invoice>
  </Invoices>
</fe:Facturae>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="Facturae_${invoiceNumber || 'F2026_0001'}.xml"`);
    res.send(xml);
  } catch (err) {
    next(err);
  }
});
