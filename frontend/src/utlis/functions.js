export const calculateBalance = (ledgerDetails, fromDate) => {
  let openingBalance = 0;
  let balance = 0;
  let totalReceipt = 0;
  let totalPayment = 0;

  // Filter and calculate opening balance from entries before fromDate
  const entriesBeforeFromDate = ledgerDetails.filter(item => item.date < fromDate);
  
  entriesBeforeFromDate.forEach(item => {
    if (item.receipt > 0) {
      openingBalance += item.receipt;
    }
    if (item.payment > 0) {
      openingBalance -= item.payment;
    }
  });

  // Remove the entries used to calculate opening balance
  const ledgerDetailsAfterFromDate = ledgerDetails.filter(item => item.date >= fromDate);

  // Add opening balance entry to the top
  const openingBalanceEntry = {
    ledgerTypeName: ledgerDetails[0].ledgerTypeName, // Head column data
    date: fromDate, // Date
    accountName: '', // Name
    description: 'OPENING BALANCE', // Description
    branchName: '', // Branch
    receipt: openingBalance > 0 ? openingBalance : 0, // Receipt
    payment: openingBalance < 0 ? Math.abs(openingBalance) : 0,
    balance: openingBalance, // Balance
  };

  // Reverse the original ledger details first
  const reversedLedgerDetails = [...ledgerDetailsAfterFromDate].reverse();

  const paymentDetailsWithBalance = reversedLedgerDetails.map((item, index) => {
    if (item.receipt > 0) {
      balance -= item.receipt;
      totalReceipt += item.receipt;
    }
    if (item.payment > 0) {
      balance += item.payment;
      totalPayment += item.payment;
    }
    return { ...item, balance };
  });

  // Reverse the mapped result to restore the original order
  return [openingBalanceEntry, ...paymentDetailsWithBalance];
};



export const calculateTotalSale = (saleDetail) => {
  let totalSales = 0;
  saleDetail.forEach((item) => {
    totalSales += item.totalAmount;
  });
  return totalSales;
};

export const calculateFinalBalanceCashBook = (details) => {
  let finalBalance = 0;
  let paymentTotal = 0;
  let receiptTotal = 0;

  details.forEach((item) => {
    finalBalance += item.balance;
    paymentTotal += item.payment;
    receiptTotal += item.receipt;
  });
  return { finalBalance, paymentTotal, receiptTotal };
};

export const calculateFinalBalance = (details) => {
  let finalBalance = 0;
  let paymentTotal = 0;
  let receiptTotal = 0;

  details.forEach((item) => {
    finalBalance += item.balance;
    paymentTotal += item.credit;
    receiptTotal += item.debit;
  });
  return { finalBalance, paymentTotal, receiptTotal };
};

export const calculateTotalAmount = (ledgerDetails, selectedBranch) => {
  let totalAmount = 0;

  ledgerDetails.forEach((product) => {
    const quantity = selectedBranch
      ? product?.distribution.find(
        (branch) => branch.branchName === selectedBranch
      )?.itemQuantity || 0
      : product?.distribution.reduce(
        (totalQuantity, branch) => totalQuantity + branch.itemQuantity,
        0
      );

    const avgPrice = parseFloat(product.averagePrice).toFixed(2);
    const itemAmount = quantity * avgPrice;
    totalAmount += itemAmount;
  });

  return totalAmount.toFixed(2);
};

export const calculateQuoteTotal = (ledgerDetails) => {
  let total = 0;
  ledgerDetails.forEach((product) => {
    const itemTotal =
      product.itemQuantity * product.productPrice - product.productDiscount;
    total += itemTotal;
  });
  return total;
};

export const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const numberToWords = (num) => {
  var a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  var b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  if ((num = num.toString()).length > 9) return "overflow";
  var n = ("000000000" + num)
    .substr(-9)
    .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return;
  var str = "";
  str +=
    n[1] != 0
      ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "Crore "
      : "";
  str +=
    n[2] != 0
      ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "Lakh "
      : "";
  str +=
    n[3] != 0
      ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "Thousand "
      : "";
  str +=
    n[4] != 0
      ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "Hundred "
      : "";
  str +=
    n[5] != 0
      ? (str != "" ? "and " : "") +
      (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]])
      : "";
  return str + "Rupees only ";
};


export const calculateTrialBalance = (ledgerDetails) => {
  let totalReceipt = 0;
  let totalPayment = 0;


  ledgerDetails.map((item, index) => {
    if (parseInt(item.balance) >= 0) {
      totalReceipt += parseInt(item.balance);
    }
    if (parseInt(item.balance) < 0) {
      totalPayment += parseInt(item.balance);
    }
  });
  return totalPayment, totalReceipt;
};
