
    // Loan Calculator
    document.getElementById('loanForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('loanAmount').value);
        const months = parseInt(document.getElementById('loanMonths').value, 10);
        const result = document.getElementById('calculationResult');
  
        if (isNaN(amount) || amount <= 0) {
          result.style.color = '#e63946';
          result.textContent = '❌ Please enter a valid loan amount.';
          return;
        }
        if (isNaN(months) || months < 1 || months > 60) {
          result.style.color = '#e63946';
          result.textContent = '❌ Please enter months between 1 and 60.';
          return;
        }
  
        const monthlyPayment = (amount / months).toFixed(2);
        result.style.color = '#4CAF50';
        result.textContent = `✅ Estimated Monthly Payment: ${monthlyPayment} EGP`;
      });
    