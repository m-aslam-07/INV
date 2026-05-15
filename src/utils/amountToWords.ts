const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

function convertBelowHundred(n: number): string {
  if (n < 20) return ones[n];
  const ten = Math.floor(n / 10);
  const one = n % 10;
  return tens[ten] + (one ? '-' + ones[one] : '');
}

function convertBelowThousand(n: number): string {
  if (n < 100) return convertBelowHundred(n);
  const hundred = Math.floor(n / 100);
  const remainder = n % 100;
  return ones[hundred] + ' Hundred' + (remainder ? ' and ' + convertBelowHundred(remainder) : '');
}

export function amountToWords(amount: number): string {
  if (amount === 0) return 'Rupees Zero Only';

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let words = '';

  if (rupees === 0) {
    words = '';
  } else {
    const crore = Math.floor(rupees / 10000000);
    const lakh = Math.floor((rupees % 10000000) / 100000);
    const thousand = Math.floor((rupees % 100000) / 1000);
    const hundred = rupees % 1000;

    const parts: string[] = [];

    if (crore > 0) {
      parts.push(convertBelowHundred(crore) + ' Crore');
    }
    if (lakh > 0) {
      parts.push(convertBelowHundred(lakh) + ' Lakh');
    }
    if (thousand > 0) {
      parts.push(convertBelowHundred(thousand) + ' Thousand');
    }
    if (hundred > 0) {
      parts.push(convertBelowThousand(hundred));
    }

    words = 'Rupees ' + parts.join(' ');
  }

  if (paise > 0) {
    const paiseWords = convertBelowHundred(paise);
    if (words) {
      words += ' and ' + paiseWords + ' Paise';
    } else {
      words = paiseWords + ' Paise';
    }
  }

  words += ' Only';

  return words;
}
