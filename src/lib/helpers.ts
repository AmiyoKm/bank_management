import { Loan, PaymentStatus } from "../../generated/prisma/client.js";

export const generateAccountNumber = (prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

export const generateLoanSchedule = (loan: Loan) => {
    const principal = Number(loan.amount);
    const rate = Number(loan.interestRate);
    const termMonths = loan.term;

    const totalInterest = principal * (rate / 100) * (termMonths / 12);
    const totalPayable = principal + totalInterest;
    const monthlyInstallment = totalPayable / termMonths;

    const schedules = [];
    let currentDate = new Date();

    for (let i = 1; i <= termMonths; i++) {
        currentDate.setMonth(currentDate.getMonth() + 1);

        schedules.push({
            loanId: loan.id,
            dueDate: new Date(currentDate),
            dueAmount: monthlyInstallment,
            status: PaymentStatus.PENDING,
        });
    }

    return schedules;
};
